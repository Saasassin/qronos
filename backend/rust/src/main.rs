// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
//! This example shows how to use swc to transpile TypeScript and JSX/TSX
//! modules.
//!
//! It will only transpile, not typecheck (like Deno's `--no-check` flag).

use std::cell::RefCell;
use std::collections::HashMap;
use std::path::Path;
use std::rc::Rc;

use anyhow::anyhow;
use anyhow::Error;
use deno_ast::MediaType;
use deno_ast::ParseParams;
use deno_ast::SourceMapOption;
use deno_ast::SourceTextInfo;
use deno_core::error::AnyError;
use deno_core::resolve_path;
use deno_core::url::Url;
use deno_core::v8;
use deno_core::JsRuntime;
use deno_core::ModuleLoadResponse;
use deno_core::ModuleLoader;
use deno_core::ModuleSource;
use deno_core::ModuleSourceCode;
use deno_core::ModuleSpecifier;
use deno_core::ModuleType;
use deno_core::RequestedModuleType;
use deno_core::ResolutionKind;
use deno_core::RuntimeOptions;
use deno_core::SourceMapGetter;

#[derive(Clone)]
struct SourceMapStore(Rc<RefCell<HashMap<String, Vec<u8>>>>);

impl SourceMapGetter for SourceMapStore {
    fn get_source_map(&self, specifier: &str) -> Option<Vec<u8>> {
        self.0.borrow().get(specifier).cloned()
    }

    fn get_source_line(&self, _file_name: &str, _line_number: usize) -> Option<String> {
        None
    }
}

struct TypescriptModuleLoader {
    source_maps: SourceMapStore,
    code_map: Rc<RefCell<HashMap<ModuleSpecifier, String>>>,
}

impl ModuleLoader for TypescriptModuleLoader {
    fn resolve(
        &self,
        specifier: &str,
        referrer: &str,
        _kind: ResolutionKind,
    ) -> Result<ModuleSpecifier, Error> {
        if specifier.starts_with("internal:") {
            Ok(ModuleSpecifier::parse(specifier)?)
        } else {
        Ok(resolve_path(specifier, Path::new(referrer))?)
        }
        // Ok(resolve_path(specifier, Path::new(referrer))
        //     .context("Failed to resolve specifier")?
        //     .to_string()
        //     .parse()
        //     .context("Failed to parse specifier")?)
    }

    fn load(
        &self,
        module_specifier: &ModuleSpecifier,
        _maybe_referrer: Option<&ModuleSpecifier>,
        _is_dyn_import: bool,
        _requested_module_type: RequestedModuleType,
    ) -> ModuleLoadResponse {
        let source_maps = self.source_maps.clone();
        let code_map = self.code_map.clone();
        fn load(
            source_maps: SourceMapStore,
            code_map: Rc<RefCell<HashMap<ModuleSpecifier, String>>>,
            module_specifier: &ModuleSpecifier,
        ) -> Result<ModuleSource, AnyError> {
            let media_type = MediaType::TypeScript; // Assume TypeScript for simplicity
            let code = code_map
                .borrow()
                .get(module_specifier)
                .cloned()
                .ok_or_else(|| anyhow!("Code not found for specifier"))?;

            let parsed = deno_ast::parse_module(ParseParams {
                specifier: module_specifier.clone(),
                text_info: SourceTextInfo::from_string(code),
                media_type,
                capture_tokens: false,
                scope_analysis: false,
                maybe_syntax: None,
            })?;
            let res = parsed.transpile(&deno_ast::EmitOptions {
                source_map: SourceMapOption::Separate,
                inline_sources: true,
                ..Default::default()
            })?;
            let source_map = res.source_map.unwrap();
            source_maps
                .0
                .borrow_mut()
                .insert(module_specifier.to_string(), source_map.into_bytes());
            Ok(ModuleSource::new(
                ModuleType::JavaScript,
                ModuleSourceCode::String(res.text.into()),
                module_specifier,
                None,
            ))
        }

        ModuleLoadResponse::Sync(load(source_maps, code_map, module_specifier))
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let source_map_store = SourceMapStore(Rc::new(RefCell::new(HashMap::new())));
    let code_map = Rc::new(RefCell::new(HashMap::new()));

    let mut js_runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(TypescriptModuleLoader {
            source_maps: source_map_store.clone(),
            code_map: code_map.clone(),
        })),
        source_map_getter: Some(Rc::new(source_map_store)),
        ..Default::default()
    });

    let module_code = r#"
export async function hello(name) {
    return fetch("https://example.com")
        .then(response => response.text())
        .then(text => `Hello, ${name}! ${text}`);
    // return new Promise((resolve, reject) => {
    //     resolve(`Hello, ${name}!`);
    // });
}
"#;

    let module_specifier = Url::parse("internal:root").unwrap();
    code_map
        .borrow_mut()
        .insert(module_specifier.clone(), module_code.to_string());

    let mod_id = js_runtime.load_main_es_module(&module_specifier).await?;

    js_runtime.mod_evaluate(mod_id).await?;
    // let result = js_runtime.execute_script(
    //     "ext://main",
    //     r#"
    //     (async () => {
    //         const { hello } = await import("ext://module");
    //         console.log(hello("World"));
    //     })();
    //     "#,
    // )?;

    let module_namespace = js_runtime.get_module_namespace(mod_id).unwrap();
    let scope = &mut js_runtime.handle_scope();
    let module_namespace = module_namespace.open(scope);

    // Retrieve the 'hello' function
    let key = v8::String::new(scope, "hello").unwrap();
    let hello_function = module_namespace.get(scope, key.into()).unwrap();
    let hello_fn = v8::Local::<v8::Function>::try_from(hello_function).unwrap();

    // Prepare the arguments for the 'hello' function
    let name = v8::String::new(scope, "World").unwrap();
    let args = [name.into()];

    let result = hello_fn.call(scope, hello_function, &args).unwrap();

    if result.is_promise() {
        let promise = v8::Local::<v8::Promise>::try_from(result).unwrap();
        let promise_result = promise
            .result(scope)
            .to_string(scope)
            .map(|s| s.to_rust_string_lossy(scope))
            .unwrap_or_default();
        println!("Result from hello function promise: {}", promise_result);
    } else {
        let result_str = result.to_string(scope).unwrap().to_rust_string_lossy(scope);
        println!("Result from hello function: {}", result_str);
    }

    Ok(())
}
