"""Defines the platforms that the build system can target."""

PLATFORMS = {
    "linux_x86_64": struct(
        constraint_values = [
            "@platforms//os:linux",
            "@platforms//cpu:x86_64",
        ],
    ),
    "linux_aarch64": struct(
        constraint_values = [
            "@platforms//os:linux",
            "@platforms//cpu:aarch64",
        ],
    ),
}

PLATFORM_LABELS = ["//bazel/platforms:{}".format(platform) for platform in PLATFORMS]
