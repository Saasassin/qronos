# Qronos

Qronos is a self-hosted application for running and monitoring scripts written in Javacript and Python. Write scripts that act as APIs, scheduled tasks, webhooks, and more.

# Getting Started

TODO

# Developers

## Frontend

The frontend is in [./frontend](frontend) and contains the UI for Qronos. It also contains its own [README.md](./frontend/README.md) with more detailed developer instructions.

## Backend

The backend is composed of several components:

- [REST API](backend/python) - The Qronos API server that the UI interacts with. The API contains its own [README.md](backend/python/README.md) with more detailed developer instructions.
- [Scheduler](backend/scheduler) - The Qronos scheduler that runs scripts.
- [Script Runner](backend/runner) - The Qronos script runner that runs scripts in a sandboxed environment.

### Prerequisites

We make heavy use of Bazel for building and running the backend. You will need to install the following:

- [Bazelisk](https://github.com/bazelbuild/bazelisk/tree/master?tab=readme-ov-file#installation)

### IDE

#### Scala

- [Metals](https://scalameta.org/metals/docs/editors/vscode/)

This is all you need for basic intellisense and syntax highlighting. If you're having trouble with auto imports after importing the project, try running `bazel run //:bazel_bsp` and restarting metals or your editor.

## Build Everything

```bash
bazel build //...
```

## Run API

```bash
bazel run //backend/python:main
```

## Adding JVM dependencies

Add to the `artifacts` list in the `MODULE.bzl` file.

Run `REPIN=1 bazel run @mvn//:pin` to update the lockfile `maven_install.json`.
