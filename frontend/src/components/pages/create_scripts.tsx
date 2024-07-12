import { generateSlug } from "random-word-slugs";
import { useEffect } from "react";
import { IconContext } from "react-icons";
import { VscOpenPreview, VscSave } from "react-icons/vsc";
import { QronosEditor } from "../core/qronos_editor";

const CreateScript = () => {
  useEffect(() => {
    console.log("CreateScript mounted...");

    document.title = "Create Script | Qronos";

    // set the script name input value to a random slug
    const scriptNameInput = document.getElementById(
      "script_name"
    ) as HTMLInputElement;
    scriptNameInput.value = generateSlug(3, { format: "kebab" });
  });

  const handleSubmit = () => {
    console.log("submitting form");
  };

  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>Create Script</h1>

        <form className="mt-5">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="sm:col-span-1">
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                name="script_name"
                id="script_name"
                onChange={() => {}} // TODO: check for uniqueness
                required
              ></input>
            </div>
            <div className="sm:col-span-1">
              <div className="flex items-center justify-center">
                <select
                  className="select select-bordered w-full max-w-xs"
                  id="script_type"
                  required
                >
                  <option value="RUNNABLE">Runnable Script</option>
                  <option value="API">HTTP API</option>
                </select>
                <div className="dropdown dropdown-end">
                  <div
                    className="tooltip"
                    data-tip="Click for Description of Script Types..."
                  >
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-circle btn-ghost btn-xs ml-3"
                    >
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    tabIndex={0}
                    className="card compact dropdown-content bg-base-100 rounded-box z-[1] w-64 shadow"
                  >
                    <div tabIndex={0} className="card-body">
                      <h3 className="card-title">Script Types</h3>
                      <div className="px-3">
                        <h5>Runnable Script</h5>
                        <p>
                          A script that is triggered on a cron-like schedule or
                          executed on-demand.
                        </p>
                        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />

                        <h5>HTTP API</h5>
                        <p>
                          A Script that will listen and respond to HTTP
                          requests.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-1">
              <div className="join float-right mr-5">
                <button className="btn join-item">
                  <IconContext.Provider
                    value={{ className: "react-icon-button" }}
                  >
                    <VscOpenPreview />
                  </IconContext.Provider>
                  Preview
                </button>

                <button
                  type="button"
                  className="btn btn-primary join-item"
                  onClick={handleSubmit}
                >
                  <IconContext.Provider
                    value={{ className: "react-icon-button" }}
                  >
                    <VscSave />
                  </IconContext.Provider>
                  {/* TODO: Save should be disabled unless dirty. */}
                  Save
                </button>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="code_body"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              ></label>
              <QronosEditor />
            </div>
          </div>

          <div className="sm:col-span-1 mt-5">
            <div className="join float-right mr-5">
              <button className="btn join-item">
                <IconContext.Provider
                  value={{ className: "react-icon-button" }}
                >
                  <VscOpenPreview />
                </IconContext.Provider>
                Preview
              </button>

              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={handleSubmit}
              >
                <IconContext.Provider
                  value={{ className: "react-icon-button" }}
                >
                  <VscSave />
                </IconContext.Provider>
                {/* TODO: Save should be disabled unless dirty. */}
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateScript;
