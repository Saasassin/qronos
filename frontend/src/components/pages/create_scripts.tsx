//import Editor from "@monaco-editor/react";
import { QronosMonacoEditor } from "../core/qronos_monaco_editor";

const CreateScript = () => {
  return (
    <>
      <div className="bg-white dark:bg-gray-900 p-0 m-0">
        <h1>Create Script</h1>

        <form>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-1">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Script Name
              </label>
              <input
                type="text"
                name="script_name"
                id="script_name"
                placeholder="Type script name"
                className="rounded-lg"
                required
              ></input>
            </div>
            <div className="w-full">
              <div className="flex items-center mb-4">
                <input
                  required
                  id="default-radio-1"
                  type="radio"
                  value=""
                  name="default-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                ></input>
                <div className="ms-2 text-sm">
                  <label
                    htmlFor="default-radio-1"
                    className="text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    HTTP API
                  </label>
                  <p
                    id="helper-radio-text"
                    className="text-xs font-normal text-gray-500 dark:text-gray-300"
                  >
                    Code that will listen and respond to HTTP requests.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-2"
                  type="radio"
                  value=""
                  name="default-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                ></input>
                <div className="ms-2 text-sm">
                  <label
                    htmlFor="default-radio-2"
                    className="text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    Runnable Script
                  </label>
                  <p
                    id="helper-radio-text"
                    className="text-xs font-normal text-gray-500 dark:text-gray-300"
                  >
                    Code that is triggered on a cron-like schedule.
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="sm:col-span-2">
              <label
                htmlFor="code_body"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Script Code
              </label>
              <textarea
                id="code_body"
                rows={22}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Script Body"
              ></textarea>
            </div> */}
            <div className="sm:col-span-2">
              <label
                htmlFor="code_body"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              ></label>
              <QronosMonacoEditor />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <button type="submit" className="form_button">
              <svg
                className="w-5 h-5 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm-.293 9.293a1 1 0 0 1 0 1.414L9.414 14l1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0Zm2.586 1.414a1 1 0 0 1 1.414-1.414l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414L14.586 14l-1.293-1.293Z"
                  clipRule="evenodd"
                />
              </svg>
              &nbsp; Save Script
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateScript;
