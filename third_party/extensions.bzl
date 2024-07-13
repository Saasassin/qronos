load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

V8_RELEASES = {
    "x86_64-unknown-linux-gnu": struct(
        downloaded_file_path = "librusty_v8_release_x86_64-unknown-linux-gnu.a.gz",
        sha256 = "64f51999985cbec560e1f39f94814c753a1ac6e8fc47d56dc8240b65bd37d615",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.97.1/librusty_v8_release_x86_64-unknown-linux-gnu.a.gz"],
    ),
    "x86_64-apple-darwin": struct(
        downloaded_file_path = "librusty_v8_release_x86_64-apple-darwin.a.gz",
        sha256 = "7065ceb2d08e76a68ea54d8b70e4f903425f9e4a03bd41e139c089f6fb12ec23",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.97.1/librusty_v8_release_x86_64-apple-darwin.a.gz"],
    ),
    "aarch64-apple-darwin": struct(
        downloaded_file_path = "librusty_v8_release_aarch64-apple-darwin.a.gz",
        sha256 = "0a590b8c42b90de47997362a65eef30c63191f4f00ed0d28c1d5d990d2ad05a9",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.97.1/librusty_v8_debug_aarch64-apple-darwin.a.gz"],
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
