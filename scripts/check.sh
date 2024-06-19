#!/usr/bin/env bash

set -euo pipefail

# Set script and workspace directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
WS_DIR=$(realpath "${WS_DIR:-$SCRIPT_DIR/..}")
BASENAME=$(basename "$WS_DIR")

cd "$WS_DIR"

# Define startup and common flags for Bazel
STARTUP_FLAGS=(
  "--output_base=$HOME/.qronos-rust-analyzer/${BASENAME}/output-base"
  "--output_user_root=$HOME/.qronos-rust-analyzer/${BASENAME}/user-root"
)

COMMON_FLAGS=(
  "--ui_event_filters=-info,-stdout,-stderr"
  "--symlink_prefix=$HOME/.qronos-rust-analyzer/${BASENAME}/symlinks"
)

# Query for all rust_* targets
CRATES=$(bazel "${STARTUP_FLAGS[@]}" query 'kind(rust_*, //...)')

# Build the queried crates with specified flags
bazel "${STARTUP_FLAGS[@]}" build "${COMMON_FLAGS[@]}" --config=rust_check --keep_going $CRATES
