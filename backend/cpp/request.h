#pragma once

#include "v8-function.h"
#include "v8-local-handle.h"
#include "v8-value.h"
#include <string>

// Forward declarations for types like Headers, AbortSignal, etc.
class Headers {};
class AbortSignal {};
class ReadableStream {};

// Enum declarations
enum class RequestDestination {
  NONE,
  AUDIO,
  AUDIOWORKLET,
  DOCUMENT,
  EMBED,
  FONT,
  FRAME,
  IFRAME,
  IMAGE,
  JSON,
  MANIFEST,
  OBJECT,
  PAINTWORKLET,
  REPORT,
  SCRIPT,
  SHAREDWORKER,
  STYLE,
  TRACK,
  VIDEO,
  WORKER,
  XSLT
};

enum class RequestMode { NAVIGATE, SAME_ORIGIN, NO_CORS, CORS };
enum class RequestCredentials { OMIT, SAME_ORIGIN, INCLUDE };
enum class RequestCache {
  DEFAULT,
  NO_STORE,
  RELOAD,
  NO_CACHE,
  FORCE_CACHE,
  ONLY_IF_CACHED
};
enum class RequestRedirect { FOLLOW, ERROR, MANUAL };
enum class RequestDuplex { HALF };
enum class RequestPriority { HIGH, LOW, AUTO };

struct RequestInit {
  std::string method;
  v8::Local<Headers> headers;
  v8::Local<ReadableStream> body;
  std::string referrer;
  std::string referrerPolicy;
  RequestMode mode;
  RequestCredentials credentials;
  RequestCache cache;
  RequestRedirect redirect;
  std::string integrity;
  bool keepalive = false;
  v8::Local<AbortSignal> signal;
  RequestDuplex duplex;
  RequestPriority priority;
  v8::Local<v8::Value> window;
};

class Request {
public:
  Request(std::string input, RequestInit init = RequestInit())
      : method_(init.method), url_(input), headers_(init.headers),
        destination_(RequestDestination::NONE), referrer_(init.referrer),
        referrerPolicy_(init.referrerPolicy), mode_(init.mode),
        credentials_(init.credentials), cache_(init.cache),
        redirect_(init.redirect), integrity_(init.integrity),
        keepalive_(init.keepalive), signal_(init.signal), duplex_(init.duplex),
        priority_(init.priority) {}

  // Not sure if we need this
  // Request(auto &&input, auto &&init = RequestInit())
  //     : method_(std::forward<decltype(init.method)>(init.method)),
  //       url_(std::forward<decltype(input)>(input)),
  //       headers_(std::forward<decltype(init.headers)>(init.headers)),
  //       destination_(RequestDestination::NONE),
  //       referrer_(std::forward<decltype(init.referrer)>(init.referrer)),
  //       referrerPolicy_(
  //           std::forward<decltype(init.referrerPolicy)>(init.referrerPolicy)),
  //       mode_(std::forward<decltype(init.mode)>(init.mode)),
  //       credentials_(
  //           std::forward<decltype(init.credentials)>(init.credentials)),
  //       cache_(std::forward<decltype(init.cache)>(init.cache)),
  //       redirect_(std::forward<decltype(init.redirect)>(init.redirect)),
  //       integrity_(std::forward<decltype(init.integrity)>(init.integrity)),
  //       keepalive_(std::forward<decltype(init.keepalive)>(init.keepalive)),
  //       signal_(std::forward<decltype(init.signal)>(init.signal)),
  //       duplex_(std::forward<decltype(init.duplex)>(init.duplex)),
  //       priority_(std::forward<decltype(init.priority)>(init.priority)) {}

  std::string method() const { return method_; }
  std::string url() const { return url_; }
  v8::Local<Headers> headers() const { return headers_; }
  RequestDestination destination() const { return destination_; }
  std::string referrer() const { return referrer_; }
  std::string referrerPolicy() const { return referrerPolicy_; }
  RequestMode mode() const { return mode_; }
  RequestCredentials credentials() const { return credentials_; }
  RequestCache cache() const { return cache_; }
  RequestRedirect redirect() const { return redirect_; }
  std::string integrity() const { return integrity_; }
  bool keepalive() const { return keepalive_; }
  v8::Local<AbortSignal> signal() const { return signal_; }
  RequestDuplex duplex() const { return duplex_; }

  Request *clone() const {
    return new Request(this->url_, RequestInit{method_,
                                               headers_,
                                               {},
                                               referrer_,
                                               referrerPolicy_,
                                               mode_,
                                               credentials_,
                                               cache_,
                                               redirect_,
                                               integrity_,
                                               keepalive_,
                                               signal_,
                                               duplex_,
                                               priority_,
                                               {}});
  }

  static v8::Local<v8::FunctionTemplate> ClassTemplate(v8::Isolate *isolate);

private:
  std::string method_;
  std::string url_;
  v8::Local<Headers> headers_;
  RequestDestination destination_;
  std::string referrer_;
  std::string referrerPolicy_;
  RequestMode mode_;
  RequestCredentials credentials_;
  RequestCache cache_;
  RequestRedirect redirect_;
  std::string integrity_;
  bool keepalive_;
  v8::Local<AbortSignal> signal_;
  RequestDuplex duplex_;
  RequestPriority priority_;
};
