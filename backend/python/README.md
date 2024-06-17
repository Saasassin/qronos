# Python Backend

## Local Dev

To setup local development environment, run:

```bash
bazel run //backend/python:main.venv
```

This will generate `.main.venv` in the root of the python directory with the full bazel provided python toolchain and dependencies.

## Adding deps

To add dependencies, add them to the `requirements.in` file and run:

```bash
bazel run //backend/python:requirements.update
```

Which will generate a new `requirements.txt` lock file.

If you're using gazelle, you should also run:

```bash
bazel run //backend/python:gazelle_python_manifest.update
```