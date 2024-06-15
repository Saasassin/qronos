# Qronos

Repository for Qronos application - a self-hosted script runner.

## Frontend

The frontend is in [./frontend](frontend) and is currently built with `pnpm` and `vite`. This will need to be added to the bazel build so we can bundle the frontend/backend together in a single artifact, but they're separate for now.

## Prerequisites

- [Bazelisk](https://github.com/bazelbuild/bazelisk/tree/master?tab=readme-ov-file#installation)
- [pnpm](https://pnpm.io/installation)

## IDE

### Scala

- [Metals](https://scalameta.org/metals/docs/editors/vscode/)

This is all you need for basic intellisense and syntax highlighting. If you're having trouble with auto imports after importing the project, try running `bazel run //:bazel_bsp` and restarting metals or your editor.

### JS/TS

There's a list of handy extensions in the [frontend README](frontend/README.md).

## Build Everything

```bash
bazel build //...
```

## Run Backend

```bash
bazel run //backend/akka
```

## Adding JVM dependencies

Add to the `artifacts` list in the `MODULE.bzl` file.

Run `REPIN=1 bazel run @mvn//:pin` to update the lockfile `maven_install.json`.