load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

V8_RELEASES = {
    "x86_64-unknown-linux-gnu": struct(
        downloaded_file_path = "librusty_v8_release_x86_64-unknown-linux-gnu.a.gz",
        sha256 = "a069673edf5bac694787371c6eef2d3a2a66ea88b2e18c8951bcac0fd2271bbc",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.94.0/librusty_v8_release_x86_64-unknown-linux-gnu.a.gz"],
    ),
    "x86_64-apple-darwin": struct(
        downloaded_file_path = "librusty_v8_release_x86_64-apple-darwin.a.gz",
        sha256 = "835519d5cf627c9218352164e9b2856942ddf793c804c9bc1d3721e9de2db7f6",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.94.0/librusty_v8_release_x86_64-apple-darwin.a.gz"],
    ),
    "aarch64-apple-darwin": struct(
        downloaded_file_path = "librusty_v8_release_aarch64-apple-darwin.a.gz",
        sha256 = "346cdabc76e30190084b7c6cfc9e03f1d42324137ee61152ae52fac1b48d1b63",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.94.0/librusty_v8_debug_aarch64-apple-darwin.a.gz"],
    ),
}

def _third_party(_mctx):
    for platform, info in V8_RELEASES.items():
        http_file(
            name = "librusty_v8_release_{platform}".format(platform = platform),
            downloaded_file_path = info.downloaded_file_path,
            sha256 = info.sha256,
            urls = info.urls,
        )

third_party = module_extension(
    implementation = _third_party,
)
