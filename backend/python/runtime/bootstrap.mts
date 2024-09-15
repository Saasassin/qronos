// Import the user function from foo.js
// import userFunction from "./script.ts";

const userFunction = (await import("./script.ts")).default;

try {
  // Read the request JSON from stdin
  const decoder = new TextDecoder();
  let requestJson = "";
  for await (const chunk of Deno.stdin.readable) {
    requestJson += decoder.decode(chunk);
  }

  // Parse the request JSON
  const requestData = JSON.parse(requestJson);

  // Reconstruct the Request object
  const { method, headers, url, body } = requestData;
  const requestHeaders = new Headers(headers);
  const request = new Request(url, {
    method,
    headers: requestHeaders,
    body: body ? body : undefined,
  });

  // Call the user function
  const response = await userFunction(request);

  // Serialize the Response object
  const responseStatus = response.status;
  const responseHeadersObj = {};
  for (const [key, value] of response.headers?.entries() || []) {
    responseHeadersObj[key] = value;
  }
  const responseData = {
    status: response.status || 200,
    headers: responseHeadersObj,
    body: response.body,
  };

  // Output the response JSON to stdout
  console.log(JSON.stringify(responseData));
} catch (e) {
  // Output errors to stderr and exit with code 1
  console.error(e);
  Deno.exit(1);
}
