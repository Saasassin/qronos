load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

LIBV8_RELEASES = {
    "macos": struct(
        sha256 = "c0c76f37c58177b57e9fcda15ff539b9ab10a4530ecc11666d6113b0ac421cd6",
        urls = ["https://github.com/kuoruan/libv8/releases/download/v12.4.254.15/v8_macOS_arm64.tar.xz"],
        build_file = "//third_party:BUILD.v8.bazel",
    ),
    "linux": struct(
        sha256 = "524c581a14be213ddfa815fd22ccc344be9f19cce9b5b56f37b4e558b7d94604",
        urls = ["https://github.com/kuoruan/libv8/releases/download/v12.4.254.15/v8_Linux_x64.tar.xz"],
        build_file = "//third_party:BUILD.v8.bazel",
    ),
}

_DENO_BUILD = """
package(default_visibility = ["//visibility:public"])

exports_files(["deno"])
"""
DENO_RELEASES = {
    "aarch64-apple-darwin": struct(
        urls = ["https://github.com/denoland/deno/releases/download/v1.46.3/deno-aarch64-apple-darwin.zip"],
        sha256 = "e74f8ddd6d8205654905a4e42b5a605ab110722a7898aef68bc35d6e704c2946",
        build_file_content = _DENO_BUILD,
    ),
    # https://github.com/denoland/deno/releases/download/v1.46.3/denort-x86_64-unknown-linux-gnu.zip
    "x86_64-unknown-linux-gnu": struct(
        urls = ["https://github.com/denoland/deno/releases/download/v1.46.3/deno-x86_64-unknown-linux-gnu.zip"],
        sha256 = "39bb1d21ad19c16fcb14f9d58fb542c2bccf0cd92c19aee8127ac5112b48bf83",
        build_file_content = _DENO_BUILD,
    ),
}

def _third_party(_mctx):
    for platform, info in LIBV8_RELEASES.items():
        http_archive(
            name = "v8_{platform}".format(platform = platform),
            urls = info.urls,
            sha256 = info.sha256,
            build_file = info.build_file,
        )

    for platform, info in DENO_RELEASES.items():
        http_archive(
            name = "deno_{platform}".format(platform = platform),
            urls = info.urls,
            sha256 = info.sha256,
            build_file_content = info.build_file_content,
        )

    http_archive(
        name = "v8pp",
        urls = [
            "https://github.com/pmed/v8pp/archive/5759d79d4ce996fc87944eccdff9ffc811c1cda0.zip",
        ],
        sha256 = "832996bf2e36917967acea0c40ac3a21504363a068023c5dd0549d36a5edf9c8",
        strip_prefix = "v8pp-5759d79d4ce996fc87944eccdff9ffc811c1cda0",
        build_file = "//third_party:BUILD.v8pp.bazel",
    )

third_party = module_extension(
    implementation = _third_party,
)
