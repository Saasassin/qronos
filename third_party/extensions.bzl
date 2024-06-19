load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_file")

def _third_party(_mctx):
    http_file(
        name = "librusty_v8_release_x86_64-unknown-linux-gnu",
        downloaded_file_path = "librusty_v8_release_x86_64-unknown-linux-gnu.a",
        sha256 = "d25d394167d62021534ad07401518c033076f0c14e7b8907ed8e664fa0b1bc67",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.44.3/librusty_v8_release_x86_64-unknown-linux-gnu.a"],
    )

    http_file(
        name = "librusty_v8_release_x86_64-apple-darwin",
        downloaded_file_path = "librusty_v8_release_x86_64-apple-darwin.a",
        sha256 = "7f4941adac98368ee2bc2a9e25c605e443049e6ae01fea872e87cccdb509f8eb",
        urls = ["https://github.com/denoland/rusty_v8/releases/download/v0.44.3/librusty_v8_release_x86_64-apple-darwin.a"],
    )

third_party = module_extension(
    implementation = _third_party,
)
