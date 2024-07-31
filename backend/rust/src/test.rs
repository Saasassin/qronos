#![feature(prelude_import)]
#![allow(clippy::print_stdout)]
#![allow(clippy::print_stderr)]
#[prelude_import]
use std::prelude::rust_2021::*;
#[macro_use]
extern crate std;
use deno::*;
use deno_core::op2;
use crate::args::flags_from_vec;
use crate::args::DenoSubcommand;
use crate::args::Flags;
use crate::args::DENO_FUTURE;
use crate::graph_container::ModuleGraphContainer;
use crate::util::display;
use crate::util::v8::get_v8_flags_from_env;
use crate::util::v8::init_v8_flags;
use deno_runtime::WorkerExecutionMode;
pub use deno_runtime::UNSTABLE_GRANULAR_FLAGS;
use deno_core::anyhow::Context;
use deno_core::error::AnyError;
use deno_core::error::JsError;
use deno_core::futures::FutureExt;
use deno_core::unsync::JoinHandle;
use deno_npm::resolution::SnapshotFromLockfileError;
use deno_runtime::fmt_errors::format_js_error;
use deno_runtime::tokio_util::create_and_run_current_thread_with_maybe_metrics;
use deno_terminal::colors;
use factory::CliFactory;
use std::env;
use std::future::Future;
use std::path::PathBuf;
trait SubcommandOutput {
    fn output(self) -> Result<i32, AnyError>;
}
impl SubcommandOutput for Result<i32, AnyError> {
    fn output(self) -> Result<i32, AnyError> {
        self
    }
}
impl SubcommandOutput for Result<(), AnyError> {
    fn output(self) -> Result<i32, AnyError> {
        self.map(|_| 0)
    }
}
impl SubcommandOutput for Result<(), std::io::Error> {
    fn output(self) -> Result<i32, AnyError> {
        self.map(|_| 0).map_err(|e| e.into())
    }
}
#[allow(clippy::print_stderr)]
fn setup_panic_hook() {
    let orig_hook = std::panic::take_hook();
    std::panic::set_hook(
        Box::new(move |panic_info| {
            {
                ::std::io::_eprint(
                    format_args!(
                        "\n============================================================\n",
                    ),
                );
            };
            {
                ::std::io::_eprint(
                    format_args!(
                        "Deno has panicked. This is a bug in Deno. Please report this\n",
                    ),
                );
            };
            {
                ::std::io::_eprint(
                    format_args!("at https://github.com/denoland/deno/issues/new.\n"),
                );
            };
            {
                ::std::io::_eprint(
                    format_args!(
                        "If you can reliably reproduce this panic, include the\n",
                    ),
                );
            };
            {
                ::std::io::_eprint(
                    format_args!(
                        "reproduction steps and re-run with the RUST_BACKTRACE=1 env\n",
                    ),
                );
            };
            {
                ::std::io::_eprint(
                    format_args!("var set and include the backtrace in your report.\n"),
                );
            };
            {
                ::std::io::_eprint(format_args!("\n"));
            };
            {
                ::std::io::_eprint(
                    format_args!(
                        "Platform: {0} {1}\n",
                        env::consts::OS,
                        env::consts::ARCH,
                    ),
                );
            };
            {
                ::std::io::_eprint(format_args!("Version: {0}\n", version::deno()));
            };
            {
                ::std::io::_eprint(
                    format_args!("Args: {0:?}\n", env::args().collect::<Vec<_>>()),
                );
            };
            {
                ::std::io::_eprint(format_args!("\n"));
            };
            orig_hook(panic_info);
            std::process::exit(1);
        }),
    );
}
fn resolve_flags_and_init(args: Vec<std::ffi::OsString>) -> Result<Flags, AnyError> {
    let flags = match flags_from_vec(args) {
        Ok(flags) => flags,
        Err(
            err @ clap::Error { .. },
        ) if err.kind() == clap::error::ErrorKind::DisplayHelp
            || err.kind() == clap::error::ErrorKind::DisplayVersion => {
            let _ = err.print();
            std::process::exit(0);
        }
        Err(err) => exit_for_error(AnyError::from(err)),
    };
    if flags.unstable_config.legacy_flag_enabled {
        #[allow(clippy::print_stderr)]
        if match flags.subcommand {
            DenoSubcommand::Check(_) => true,
            _ => false,
        } {
            {
                ::std::io::_eprint(
                    format_args!(
                        "⚠\u{fe0f}  {0}\n",
                        colors::yellow(
                            "The `--unstable` flag is not needed for `deno check` anymore.",
                        ),
                    ),
                );
            };
        } else {
            {
                ::std::io::_eprint(
                    format_args!(
                        "⚠\u{fe0f}  {0}\n",
                        colors::yellow(
                            "The `--unstable` flag is deprecated and will be removed in Deno 2.0. Use granular `--unstable-*` flags instead.\nLearn more at: https://docs.deno.com/runtime/manual/tools/unstable_flags",
                        ),
                    ),
                );
            };
        }
    }
    let default_v8_flags = match flags.subcommand {
        DenoSubcommand::Lsp => {
            <[_]>::into_vec(
                #[rustc_box]
                ::alloc::boxed::Box::new(["--max-old-space-size=3072".to_string()]),
            )
        }
        _ => {
            if *DENO_FUTURE {
                <[_]>::into_vec(
                    #[rustc_box]
                    ::alloc::boxed::Box::new([
                        "--no-harmony-import-assertions".to_string(),
                    ]),
                )
            } else {
                <[_]>::into_vec(
                    #[rustc_box]
                    ::alloc::boxed::Box::new([
                        "--harmony-import-assertions".to_string(),
                        "--no-maglev".to_string(),
                    ]),
                )
            }
        }
    };
    init_v8_flags(&default_v8_flags, &flags.v8_flags, get_v8_flags_from_env());
    deno_core::JsRuntime::init_platform(None);
    util::logger::init(flags.log_level);
    Ok(flags)
}
#[allow(clippy::print_stderr)]
fn exit_with_message(message: &str, code: i32) -> ! {
    {
        ::std::io::_eprint(
            format_args!(
                "{0}: {1}\n",
                colors::red_bold("error"),
                message.trim_start_matches("error: "),
            ),
        );
    };
    std::process::exit(code);
}
fn exit_for_error(error: AnyError) -> ! {
    let mut error_string = {
        let res = ::alloc::fmt::format(format_args!("{0:?}", error));
        res
    };
    let mut error_code = 1;
    if let Some(e) = error.downcast_ref::<JsError>() {
        error_string = format_js_error(e);
    } else if let Some(SnapshotFromLockfileError::IntegrityCheckFailed(e)) = error
        .downcast_ref::<SnapshotFromLockfileError>()
    {
        error_string = e.to_string();
        error_code = 10;
    }
    exit_with_message(&error_string, error_code);
}
/// Ensure that the subcommand runs in a task, rather than being directly executed. Since some of these
/// futures are very large, this prevents the stack from getting blown out from passing them by value up
/// the callchain (especially in debug mode when Rust doesn't have a chance to elide copies!).
#[inline(always)]
fn spawn_subcommand<F: Future<Output = T> + 'static, T: SubcommandOutput>(
    f: F,
) -> JoinHandle<Result<i32, AnyError>> {
    deno_core::unsync::spawn(async move { f.map(|r| r.output()).await }.boxed_local())
}
async fn run_subcommand(flags: Flags) -> Result<i32, AnyError> {
    let handle = match flags.subcommand.clone() {
        DenoSubcommand::Add(add_flags) => {
            spawn_subcommand(async { tools::registry::add(flags, add_flags).await })
        }
        DenoSubcommand::Bench(bench_flags) => {
            spawn_subcommand(async {
                if bench_flags.watch.is_some() {
                    tools::bench::run_benchmarks_with_watch(flags, bench_flags).await
                } else {
                    tools::bench::run_benchmarks(flags, bench_flags).await
                }
            })
        }
        DenoSubcommand::Bundle(bundle_flags) => {
            spawn_subcommand(async { tools::bundle::bundle(flags, bundle_flags).await })
        }
        DenoSubcommand::Doc(doc_flags) => {
            spawn_subcommand(async { tools::doc::doc(flags, doc_flags).await })
        }
        DenoSubcommand::Eval(eval_flags) => {
            spawn_subcommand(async { tools::run::eval_command(flags, eval_flags).await })
        }
        DenoSubcommand::Cache(cache_flags) => {
            spawn_subcommand(async move {
                let factory = CliFactory::from_flags(flags)?;
                let emitter = factory.emitter()?;
                let main_graph_container = factory.main_module_graph_container().await?;
                main_graph_container
                    .load_and_type_check_files(&cache_flags.files)
                    .await?;
                emitter.cache_module_emits(&main_graph_container.graph()).await
            })
        }
        DenoSubcommand::Check(check_flags) => {
            spawn_subcommand(async move {
                let factory = CliFactory::from_flags(flags)?;
                let main_graph_container = factory.main_module_graph_container().await?;
                main_graph_container.load_and_type_check_files(&check_flags.files).await
            })
        }
        DenoSubcommand::Compile(compile_flags) => {
            spawn_subcommand(async {
                tools::compile::compile(flags, compile_flags).await
            })
        }
        DenoSubcommand::Coverage(coverage_flags) => {
            spawn_subcommand(async {
                tools::coverage::cover_files(flags, coverage_flags).await
            })
        }
        DenoSubcommand::Fmt(fmt_flags) => {
            spawn_subcommand(async move { tools::fmt::format(flags, fmt_flags).await })
        }
        DenoSubcommand::Init(init_flags) => {
            spawn_subcommand(async {
                tokio::task::yield_now().await;
                tools::init::init_project(init_flags)
            })
        }
        DenoSubcommand::Info(info_flags) => {
            spawn_subcommand(async { tools::info::info(flags, info_flags).await })
        }
        DenoSubcommand::Install(install_flags) => {
            spawn_subcommand(async {
                tools::installer::install_command(flags, install_flags).await
            })
        }
        DenoSubcommand::Jupyter(jupyter_flags) => {
            spawn_subcommand(async {
                tools::jupyter::kernel(flags, jupyter_flags).await
            })
        }
        DenoSubcommand::Uninstall(uninstall_flags) => {
            spawn_subcommand(async { tools::installer::uninstall(uninstall_flags) })
        }
        DenoSubcommand::Lsp => spawn_subcommand(async { lsp::start().await }),
        DenoSubcommand::Lint(lint_flags) => {
            spawn_subcommand(async {
                if lint_flags.rules {
                    tools::lint::print_rules_list(
                        lint_flags.json,
                        lint_flags.maybe_rules_tags,
                    );
                    Ok(())
                } else {
                    tools::lint::lint(flags, lint_flags).await
                }
            })
        }
        DenoSubcommand::Repl(repl_flags) => {
            spawn_subcommand(async move { tools::repl::run(flags, repl_flags).await })
        }
        DenoSubcommand::Run(run_flags) => {
            spawn_subcommand(async move {
                if run_flags.is_stdin() {
                    tools::run::run_from_stdin(flags).await
                } else {
                    tools::run::run_script(
                            WorkerExecutionMode::Run,
                            flags,
                            run_flags.watch,
                        )
                        .await
                }
            })
        }
        DenoSubcommand::Serve(serve_flags) => {
            spawn_subcommand(async move {
                tools::run::run_script(
                        WorkerExecutionMode::Serve,
                        flags,
                        serve_flags.watch,
                    )
                    .await
            })
        }
        DenoSubcommand::Task(task_flags) => {
            spawn_subcommand(async {
                tools::task::execute_script(flags, task_flags).await
            })
        }
        DenoSubcommand::Test(test_flags) => {
            spawn_subcommand(async {
                if let Some(ref coverage_dir) = test_flags.coverage_dir {
                    if test_flags.clean {
                        let _ = std::fs::remove_dir_all(coverage_dir);
                    }
                    std::fs::create_dir_all(coverage_dir)
                        .with_context(|| {
                            let res = ::alloc::fmt::format(
                                format_args!("Failed creating: {0}", coverage_dir),
                            );
                            res
                        })?;
                    env::set_var(
                        "DENO_UNSTABLE_COVERAGE_DIR",
                        PathBuf::from(coverage_dir).canonicalize()?,
                    );
                }
                if test_flags.watch.is_some() {
                    tools::test::run_tests_with_watch(flags, test_flags).await
                } else {
                    tools::test::run_tests(flags, test_flags).await
                }
            })
        }
        DenoSubcommand::Completions(completions_flags) => {
            spawn_subcommand(async move {
                display::write_to_stdout_ignore_sigpipe(&completions_flags.buf)
            })
        }
        DenoSubcommand::Types => {
            spawn_subcommand(async move {
                let types = tsc::get_types_declaration_file_text();
                display::write_to_stdout_ignore_sigpipe(types.as_bytes())
            })
        }
        #[cfg(not(feature = "upgrade"))]
        DenoSubcommand::Upgrade(_) => {
            exit_with_message(
                "This deno was built without the \"upgrade\" feature. Please upgrade using the installation method originally used to install Deno.",
                1,
            )
        }
        DenoSubcommand::Vendor(vendor_flags) => {
            spawn_subcommand(async { tools::vendor::vendor(flags, vendor_flags).await })
        }
        DenoSubcommand::Publish(publish_flags) => {
            spawn_subcommand(async {
                tools::registry::publish(flags, publish_flags).await
            })
        }
    };
    handle.await?
}
pub fn main() {
    setup_panic_hook();
    util::unix::raise_fd_limit();
    util::windows::ensure_stdio_open();
    deno_runtime::deno_permissions::set_prompt_callbacks(
        Box::new(util::draw_thread::DrawThread::hide),
        Box::new(util::draw_thread::DrawThread::show),
    );
    let args: Vec<_> = env::args_os().collect();
    let future = async move {
        let flags = resolve_flags_and_init(args)?;
        run_subcommand(flags).await
    };
    match create_and_run_current_thread_with_maybe_metrics(future) {
        Ok(exit_code) => std::process::exit(exit_code),
        Err(err) => exit_for_error(err),
    }
}
use std::collections::HashMap;
#[allow(non_camel_case_types)]
const fn op_is_node_file() -> ::deno_core::_ops::OpDecl {
    #[allow(non_camel_case_types)]
    struct op_is_node_file {
        _unconstructable: ::std::marker::PhantomData<()>,
    }
    impl ::deno_core::_ops::Op for op_is_node_file {
        const NAME: &'static str = "op_is_node_file";
        const DECL: ::deno_core::_ops::OpDecl = ::deno_core::_ops::OpDecl::new_internal_op2(
            {
                const LITERAL: &'static [u8] = "op_is_node_file".as_bytes();
                const STR: ::deno_core::v8::OneByteConst = ::deno_core::FastStaticString::create_external_onebyte_const(
                    LITERAL,
                );
                let s: &'static ::deno_core::v8::OneByteConst = &STR;
                ("op_is_node_file", ::deno_core::FastStaticString::new(s))
            },
            false,
            false,
            0usize as u8,
            Self::v8_fn_ptr as _,
            Self::v8_fn_ptr_metrics as _,
            Some({
                use deno_core::v8::fast_api::Type;
                use deno_core::v8::fast_api::CType;
                deno_core::v8::fast_api::FastFunction::new_with_bigint(
                    &[Type::V8Value],
                    CType::Bool,
                    Self::v8_fn_ptr_fast as *const ::std::ffi::c_void,
                )
            }),
            Some({
                use deno_core::v8::fast_api::Type;
                use deno_core::v8::fast_api::CType;
                deno_core::v8::fast_api::FastFunction::new_with_bigint(
                    &[Type::V8Value, Type::CallbackOptions],
                    CType::Bool,
                    Self::v8_fn_ptr_fast_metrics as *const ::std::ffi::c_void,
                )
            }),
            ::deno_core::OpMetadata {
                ..::deno_core::OpMetadata::default()
            },
        );
    }
    impl op_is_node_file {
        pub const fn name() -> &'static str {
            "op_is_node_file"
        }
        #[allow(clippy::too_many_arguments)]
        extern "C" fn v8_fn_ptr_fast_metrics<'s>(
            this: deno_core::v8::Local<deno_core::v8::Object>,
            fast_api_callback_options: *mut deno_core::v8::fast_api::FastApiCallbackOptions<
                's,
            >,
        ) -> bool {
            let fast_api_callback_options: &'s mut _ = unsafe {
                &mut *fast_api_callback_options
            };
            let opctx: &'s _ = unsafe {
                &*(deno_core::v8::Local::<
                    deno_core::v8::External,
                >::cast(unsafe { fast_api_callback_options.data.data })
                    .value() as *const deno_core::_ops::OpCtx)
            };
            deno_core::_ops::dispatch_metrics_fast(
                opctx,
                deno_core::_ops::OpMetricsEvent::Dispatched,
            );
            let res = Self::v8_fn_ptr_fast(this);
            deno_core::_ops::dispatch_metrics_fast(
                opctx,
                deno_core::_ops::OpMetricsEvent::Completed,
            );
            res
        }
        #[allow(clippy::too_many_arguments)]
        extern "C" fn v8_fn_ptr_fast<'s>(
            this: deno_core::v8::Local<deno_core::v8::Object>,
        ) -> bool {
            #[cfg(debug_assertions)]
            let _reentrancy_check_guard = deno_core::_ops::reentrancy_check(
                &<Self as deno_core::_ops::Op>::DECL,
            );
            let result = { Self::call() };
            result as _
        }
        #[inline(always)]
        fn slow_function_impl<'s>(
            info: &'s deno_core::v8::FunctionCallbackInfo,
        ) -> usize {
            #[cfg(debug_assertions)]
            let _reentrancy_check_guard = deno_core::_ops::reentrancy_check(
                &<Self as deno_core::_ops::Op>::DECL,
            );
            let mut rv = deno_core::v8::ReturnValue::from_function_callback_info(info);
            let result = { Self::call() };
            deno_core::_ops::RustToV8RetVal::to_v8_rv(result, &mut rv);
            return 0;
        }
        extern "C" fn v8_fn_ptr<'s>(info: *const deno_core::v8::FunctionCallbackInfo) {
            let info: &'s _ = unsafe { &*info };
            Self::slow_function_impl(info);
        }
        extern "C" fn v8_fn_ptr_metrics<'s>(
            info: *const deno_core::v8::FunctionCallbackInfo,
        ) {
            let info: &'s _ = unsafe { &*info };
            let args = deno_core::v8::FunctionCallbackArguments::from_function_callback_info(
                info,
            );
            let opctx: &'s _ = unsafe {
                &*(deno_core::v8::Local::<deno_core::v8::External>::cast(args.data())
                    .value() as *const deno_core::_ops::OpCtx)
            };
            deno_core::_ops::dispatch_metrics_slow(
                opctx,
                deno_core::_ops::OpMetricsEvent::Dispatched,
            );
            let res = Self::slow_function_impl(info);
            if res == 0 {
                deno_core::_ops::dispatch_metrics_slow(
                    opctx,
                    deno_core::_ops::OpMetricsEvent::Completed,
                );
            } else {
                deno_core::_ops::dispatch_metrics_slow(
                    opctx,
                    deno_core::_ops::OpMetricsEvent::Error,
                );
            }
        }
    }
    impl op_is_node_file {
        #[inline(always)]
        fn call() -> bool {
            false
        }
    }
    <op_is_node_file as ::deno_core::_ops::Op>::DECL
}
fn foo() {
    ///
    /// An extension for use with the Deno JS runtime.
    /// To use it, provide it as an argument when instantiating your runtime:
    ///
    /// ```rust,ignore
    /// use deno_core::{ JsRuntime, RuntimeOptions };
    ///
    ///let mut extensions = vec![deno_tsc::init_ops_and_esm()];
    /// let mut js_runtime = JsRuntime::new(RuntimeOptions {
    ///   extensions,
    ///   ..Default::default()
    /// });
    /// ```
    ///
    #[allow(non_camel_case_types)]
    pub struct deno_tsc {}
    impl deno_tsc {
        fn ext() -> ::deno_core::Extension {
            #[allow(unused_imports)]
            use ::deno_core::Op;
            ::deno_core::Extension {
                name: "deno_tsc",
                deps: &[],
                js_files: {
                    const JS: &'static [::deno_core::ExtensionFileSource] = &[
                        ::deno_core::ExtensionFileSource::loaded_during_snapshot(
                            "ext:deno_tsc/00_typescript.js",
                            "/Users/tbess/src/qronos/backend/rust/tsc/00_typescript.js",
                        ),
                        ::deno_core::ExtensionFileSource::loaded_during_snapshot(
                            "ext:deno_tsc/99_main_compiler.js",
                            "/Users/tbess/src/qronos/backend/rust/tsc/99_main_compiler.js",
                        ),
                    ];
                    ::std::borrow::Cow::Borrowed(JS)
                },
                esm_files: {
                    const JS: &'static [::deno_core::ExtensionFileSource] = &[];
                    ::std::borrow::Cow::Borrowed(JS)
                },
                lazy_loaded_esm_files: {
                    const JS: &'static [::deno_core::ExtensionFileSource] = &[];
                    ::std::borrow::Cow::Borrowed(JS)
                },
                esm_entry_point: {
                    const V: ::std::option::Option<&'static ::std::primitive::str> = ::std::option::Option::None;
                    V
                },
                ops: ::std::borrow::Cow::Owned(
                    <[_]>::into_vec(
                        #[rustc_box]
                        ::alloc::boxed::Box::new([{ op_is_node_file() }]),
                    ),
                ),
                external_references: ::std::borrow::Cow::Borrowed(&[]),
                global_template_middleware: ::std::option::Option::None,
                global_object_middleware: ::std::option::Option::None,
                op_state_fn: ::std::option::Option::None,
                middleware_fn: ::std::option::Option::None,
                enabled: true,
            }
        }
        #[inline(always)]
        #[allow(unused_variables)]
        fn with_ops_fn(ext: &mut ::deno_core::Extension) {}
        #[inline(always)]
        #[allow(unused_variables)]
        fn with_state_and_middleware(
            ext: &mut ::deno_core::Extension,
            op_crate_libs: HashMap<&'static str, PathBuf>,
            build_libs: Vec<&'static str>,
            path_dts: PathBuf,
        ) {
            {
                #[doc(hidden)]
                struct Config {
                    pub op_crate_libs: HashMap<&'static str, PathBuf>,
                    pub build_libs: Vec<&'static str>,
                    pub path_dts: PathBuf,
                }
                let config = Config {
                    op_crate_libs,
                    build_libs,
                    path_dts,
                };
                let state_fn: fn(&mut ::deno_core::OpState, Config) = |state, options| {
                    state.put(options.op_crate_libs);
                    state.put(options.build_libs);
                    state.put(options.path_dts);
                };
                ext.op_state_fn = ::std::option::Option::Some(
                    ::std::boxed::Box::new(move |state: &mut ::deno_core::OpState| {
                        state_fn(state, config);
                    }),
                );
            };
        }
        #[inline(always)]
        #[allow(unused_variables)]
        #[allow(clippy::redundant_closure_call)]
        fn with_customizer(ext: &mut ::deno_core::Extension) {}
        #[allow(dead_code)]
        /// Initialize this extension for runtime or snapshot creation. Use this
        /// function if the runtime or snapshot is not created from a (separate)
        /// snapshot, or that snapshot does not contain this extension. Otherwise
        /// use `init_ops()` instead.
        ///
        /// # Returns
        /// an Extension object that can be used during instantiation of a JsRuntime
        pub fn init_ops_and_esm(
            op_crate_libs: HashMap<&'static str, PathBuf>,
            build_libs: Vec<&'static str>,
            path_dts: PathBuf,
        ) -> ::deno_core::Extension {
            let mut ext = Self::ext();
            Self::with_ops_fn(&mut ext);
            Self::with_state_and_middleware(
                &mut ext,
                op_crate_libs,
                build_libs,
                path_dts,
            );
            Self::with_customizer(&mut ext);
            ext
        }
        #[allow(dead_code)]
        /// Initialize this extension for runtime or snapshot creation, excluding
        /// its JavaScript sources and evaluation. This is used when the runtime
        /// or snapshot is created from a (separate) snapshot which includes this
        /// extension in order to avoid evaluating the JavaScript twice.
        ///
        /// # Returns
        /// an Extension object that can be used during instantiation of a JsRuntime
        pub fn init_ops(
            op_crate_libs: HashMap<&'static str, PathBuf>,
            build_libs: Vec<&'static str>,
            path_dts: PathBuf,
        ) -> ::deno_core::Extension {
            let mut ext = Self::ext();
            Self::with_ops_fn(&mut ext);
            Self::with_state_and_middleware(
                &mut ext,
                op_crate_libs,
                build_libs,
                path_dts,
            );
            Self::with_customizer(&mut ext);
            ext.js_files = ::std::borrow::Cow::Borrowed(&[]);
            ext.esm_files = ::std::borrow::Cow::Borrowed(&[]);
            ext.esm_entry_point = ::std::option::Option::None;
            ext
        }
    }
}
