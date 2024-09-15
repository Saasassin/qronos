#include "request.h"
#include "v8.h"
#include "v8pp/class.hpp"
#include "v8pp/convert.hpp"
#include "v8pp/module.hpp"

// struct RequestInit {
//   std::string method;
//   v8::Local<Headers> headers;
//   v8::Local<ReadableStream> body;
//   std::string referrer;
//   std::string referrerPolicy;
//   RequestMode mode;
//   RequestCredentials credentials;
//   RequestCache cache;
//   RequestRedirect redirect;
//   std::string integrity;
//   bool keepalive = false;
//   v8::Local<AbortSignal> signal;
//   RequestDuplex duplex;
//   RequestPriority priority;
//   v8::Local<v8::Value> window;
// };

namespace request_init_fields {
static const char *method = "method";
static const char *headers = "headers";
static const char *body = "body";
static const char *referrer = "referrer";
static const char *referrerPolicy = "referrerPolicy";
static const char *mode = "mode";
static const char *credentials = "credentials";
static const char *cache = "cache";
static const char *redirect = "redirect";
static const char *integrity = "integrity";
static const char *keepalive = "keepalive";
static const char *signal = "signal";
static const char *duplex = "duplex";
static const char *priority = "priority";
static const char *window = "window";
} // namespace request_init_fields

template <> struct v8pp::convert<RequestInit> {
  using from_type = RequestInit;
  using to_type = v8::Local<v8::Value>;

  static bool is_valid(v8::Isolate *isolate, v8::Local<v8::Value> value);

  static to_type to_v8(v8::Isolate *isolate, RequestInit const &init);
  static from_type from_v8(v8::Isolate *isolate, v8::Local<v8::Value> value) {
    if (!is_valid(isolate, value)) {
      throw std::invalid_argument("Invalid RequestInit value");
    }

    v8::HandleScope scope(isolate);
    v8::Local<v8::Object> obj = value.As<v8::Object>();

    from_type result;
    result.method = v8pp::from_v8<std::string>(
        isolate, obj->Get(isolate->GetCurrentContext(),
                          v8pp::to_v8(isolate, request_init_fields::method))
                     .ToLocalChecked());
    return result;
  }
};

v8::Local<v8::FunctionTemplate> Request::ClassTemplate(v8::Isolate *isolate) {
  v8pp::class_<Request> Request_class(isolate);

  Request_class.ctor<std::string, RequestInit>();

  // Request_class.property("method", &Request::method)
  //     .property("url", &Request::url)
  //     .property("headers", &Request::headers)
  //     .property("destination", &Request::destination)
  //     .property("referrer", &Request::referrer)
  //     .property("referrerPolicy", &Request::referrerPolicy)
  //     .property("mode", &Request::mode)
  //     .property("credentials", &Request::credentials)
  //     .property("cache", &Request::cache)
  //     .property("redirect", &Request::redirect)
  //     .property("integrity", &Request::integrity)
  //     .property("keepalive", &Request::keepalive)
  //     .property("signal", &Request::signal)
  //     .property("duplex", &Request::duplex);

  Request_class.function("clone", &Request::clone);

  return Request_class.class_function_template();
}