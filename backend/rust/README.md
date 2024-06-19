# Qronos Runtime

The runtime is responsible for accepting HTTP requests and executing the appropriate script in a secure environment.

## Local Dev

Building is easy, just run:

```bash
bazel build //backend/rust:qronos_runtime
```

To setup IDE tooling integrated with bazel run the following:

```bash
bazel run @rules_rust//tools/rust_analyzer:gen_rust_project
bazel build -c opt //backend/rust:qronos_runtime
```

This will generate a `rust-project.json` at the root of your workspace which `rust-analyzer` uses to provide intellisense. The optimized build is required to allow rust procedural macros to be built, if you don't do the optimized build, you will see errors about missing .dylib or .so files when you try to edit rust files.