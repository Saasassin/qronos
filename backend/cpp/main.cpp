#include "libplatform/libplatform.h"
#include "v8-context.h"
#include "v8.h"
#include <cstdio>
#include <iostream>

// TODO: Be better
static std::unordered_map<int, std::string> module_paths;

v8::MaybeLocal<v8::Module> loadModule(const char *code, const char *name,
                                      v8::Local<v8::Context> cx);

v8::MaybeLocal<v8::Module> callResolve(v8::Local<v8::Context> context,
                                       v8::Local<v8::String> specifier,
                                       v8::Local<v8::Module> referrer);

v8::Local<v8::Module> checkModule(v8::MaybeLocal<v8::Module> maybeModule,
                                  v8::Local<v8::Context> cx);

v8::MaybeLocal<v8::Module>
callResolve(v8::Local<v8::Context> context, v8::Local<v8::String> specifier,
            v8::Local<v8::FixedArray> import_assertions,
            v8::Local<v8::Module> referrer);

v8::MaybeLocal<v8::Promise>
callDynamic(v8::Local<v8::Context> context,
            v8::Local<v8::Data> host_defined_options,
            v8::Local<v8::Value> resource_name, v8::Local<v8::String> specifier,
            v8::Local<v8::FixedArray> import_attributes);

char *readFile(const char *filename);

v8::Local<v8::Value> execModule(v8::Local<v8::Module> mod,
                                v8::Local<v8::Context> cx,
                                bool nsObject = false);

void JsPrint(const v8::FunctionCallbackInfo<v8::Value> &args) {
  for (int i = 0; i < args.Length(); i++) {
    v8::String::Utf8Value str(args.GetIsolate(), args[i]);
    printf("%s", *str);
  }
  printf("\n");
}

int main(int argc, char *argv[]) {
  v8::V8::InitializeICUDefaultLocation(argv[0]);
  v8::V8::InitializeExternalStartupData(argv[0]);
  auto platform = v8::platform::NewDefaultPlatform();
  v8::V8::InitializePlatform(platform.get());
  v8::V8::Initialize();

  v8::Isolate::CreateParams create_params;
  create_params.array_buffer_allocator =
      v8::ArrayBuffer::Allocator::NewDefaultAllocator();
  auto *isolate = v8::Isolate::New(create_params);

  // // Binding dynamic import() callback
  isolate->SetHostImportModuleDynamicallyCallback(callDynamic);

  // // Binding metadata loader callback
  // mIsolate->SetHostInitializeImportMetaObjectCallback(callMeta);

  {
    v8::Isolate::Scope isolate_scope(isolate);
    v8::HandleScope handle_scope(isolate);

    v8::TryCatch try_catch(isolate);

    auto global = v8::ObjectTemplate::New(isolate);
    global->Set(isolate, "print", v8::FunctionTemplate::New(isolate, JsPrint));

    auto context = v8::Context::New(isolate, nullptr, global);
    v8::Context::Scope context_scope(context);
    const auto *file_path = "backend/cpp/main.js";
    auto module =
        loadModule(readFile(file_path), file_path, context).ToLocalChecked();

    module_paths[module->ScriptId()] = file_path;
    auto result = execModule(checkModule(module, context), context);

    while (v8::platform::PumpMessageLoop(platform.get(), isolate))
      continue;

    if (result->IsPromise()) {
      v8::Local<v8::Promise> promise = result.As<v8::Promise>();

      auto promiseState = promise->State();
      switch (promiseState) {
      case v8::Promise::PromiseState::kPending:
        printf("Promise is pending\n");
        break;
      case v8::Promise::PromiseState::kFulfilled:
        printf("Promise is fulfilled\n");
        break;
      case v8::Promise::PromiseState::kRejected:
        printf("Promise is rejected\n");
        break;
      }
      printf(
          "Result: %s\n",
          *v8::String::Utf8Value(
              isolate, promise->Result()->ToString(context).ToLocalChecked()));
    } else {
      v8::String::Utf8Value utf8(isolate, result);
      printf("RESULT: %s\n", *utf8);
    }

    if (try_catch.HasCaught()) {
      v8::String::Utf8Value exception(isolate, try_catch.Exception());
      printf("Exception: %s\n", *exception);
    }
  }

  isolate->Dispose();
  v8::V8::Dispose();

  delete create_params.array_buffer_allocator;

  return 0;
}

char *readFile(const char *filename) {
  std::ifstream file;
  file.open(filename, std::ifstream::ate);
  char *contents;
  if (!file) {
    throw std::runtime_error("File not found");
  }

  size_t file_size = file.tellg();

  file.seekg(0);

  std::filebuf *file_buf = file.rdbuf();
  contents = new char[file_size + 1]();
  file_buf->sgetn(contents, file_size);
  file.close();

  return contents;
}

v8::MaybeLocal<v8::Module>
callResolve(v8::Local<v8::Context> context, v8::Local<v8::String> specifier,
            v8::Local<v8::FixedArray> import_assertions,
            v8::Local<v8::Module> referrer) {
  // Get module name from specifier (given name in import args)
  v8::String::Utf8Value str(context->GetIsolate(), specifier);

  auto referring_path = module_paths[referrer->ScriptId()];
  auto referring_dir = std::filesystem::path(referring_path).parent_path();

  auto full_path = referring_dir / *str;

  // make str relative to referring module

  // Return unchecked module
  return loadModule(readFile(full_path.c_str()), full_path.c_str(), context);
}

v8::Local<v8::Module> checkModule(v8::MaybeLocal<v8::Module> maybeModule,
                                  v8::Local<v8::Context> cx) {

  // Checking out
  v8::Local<v8::Module> mod;
  if (!maybeModule.ToLocal(&mod)) {
    printf("Error loading module!\n");
    exit(EXIT_FAILURE);
  }

  // Instantiating (including checking out depedencies). It uses callResolve
  // as callback: check #
  v8::Maybe<bool> result = mod->InstantiateModule(cx, callResolve);
  if (result.IsNothing()) {
    printf("\nCan't instantiate module.\n");
    exit(EXIT_FAILURE);
  }

  // Returning check-out module
  return mod;
}

v8::Local<v8::Value> execModule(v8::Local<v8::Module> mod,
                                v8::Local<v8::Context> cx, bool nsObject) {

  // Executing module with return value
  v8::Local<v8::Value> retValue;
  if (!mod->Evaluate(cx).ToLocal(&retValue)) {
    printf("Error evaluating module!\n");
    exit(EXIT_FAILURE);
  }

  if (nsObject)
    return mod->GetModuleNamespace();
  else
    return retValue;
}

v8::MaybeLocal<v8::Module> loadModule(const char *code, const char *name,
                                      v8::Local<v8::Context> cx) {

  v8::Local<v8::String> vcode =
      v8::String::NewFromUtf8(cx->GetIsolate(), code).ToLocalChecked();

  v8::ScriptOrigin origin(
      v8::String::NewFromUtf8(cx->GetIsolate(), name).ToLocalChecked(), 0, 0,
      false, -1, v8::Local<v8::Value>(), false, false, true);

  v8::Context::Scope context_scope(cx);
  v8::ScriptCompiler::Source source(vcode, origin);
  v8::MaybeLocal<v8::Module> mod;
  mod = v8::ScriptCompiler::CompileModule(cx->GetIsolate(), &source);

  return mod;
}

v8::MaybeLocal<v8::Promise>
callDynamic(v8::Local<v8::Context> context,
            v8::Local<v8::Data> host_defined_options,
            v8::Local<v8::Value> resource_name, v8::Local<v8::String> specifier,
            v8::Local<v8::FixedArray> import_attributes) {

  v8::Local<v8::Promise::Resolver> resolver =
      v8::Promise::Resolver::New(context).ToLocalChecked();
  v8::MaybeLocal<v8::Promise> promise(resolver->GetPromise());

  v8::String::Utf8Value name(context->GetIsolate(), specifier);
  auto referring_name = v8::String::Utf8Value(
      context->GetIsolate(), resource_name->ToString(context).ToLocalChecked());

  auto referring_dir = std::filesystem::path(*referring_name).parent_path();
  auto full_path = referring_dir / *name;
  v8::Local<v8::Module> mod = checkModule(
      loadModule(readFile(full_path.c_str()), full_path.c_str(), context),
      context);
  v8::Local<v8::Value> retValue = execModule(mod, context, true);

  auto result = resolver->Resolve(context, retValue);
  if (result.IsNothing()) {
    printf("Error resolving promise!\n");
    exit(EXIT_FAILURE);
  }
  return promise;
}