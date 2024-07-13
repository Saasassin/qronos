import { useMonaco } from "@monaco-editor/react";
import { generateSlug } from "random-word-slugs";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { IoInformationCircleOutline } from "react-icons/io5";
import { VscOpenPreview, VscSave } from "react-icons/vsc";
import { QronosEditor } from "../core/qronos_editor";

const CreateScript = () => {
  const monaco = useMonaco();

  const [formData, setFormData] = useState({
    script_name: "",
    script_type: "",
    script_version: {
      code_body: "",
    },
  });

  useEffect(() => {
    console.log("CreateScript mounted...");

    document.title = "Create Script | Qronos";

    // set the script name input value to a random slug
    const scriptNameInput = document.getElementById(
      "script_name"
    ) as HTMLInputElement;
    scriptNameInput.value = generateSlug(3, { format: "kebab" });

    // do conditional chaining
    monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    // or make sure that it exists by other ways
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
    }
  }, [monaco]);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const code_body = monaco?.editor.getModels()[0].getValue() ?? "";

    const Sdata = {
      script: {
        script_name: (
          document.getElementById("script_name") as HTMLInputElement
        ).value,
        script_type: (
          document.getElementById("script_type") as HTMLSelectElement
        ).value,
      },
      script_version: {
        code_body: code_body,
      },
    };

    try {
      const response = await fetch("http://localhost:8080/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Sdata),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Success:", data);
    } catch (error) {
      console.error("Error:", error);
    }
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
                //onChange={handleChange}
                required
              ></input>
            </div>
            <div className="sm:col-span-1">
              <div className="flex items-center justify-center">
                <select
                  className="select select-bordered w-full max-w-xs"
                  id="script_type"
                  name="script_type"
                  //                  onChange={handleChange}
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
                      <IconContext.Provider
                        value={{ className: "react-icon-button" }}
                      >
                        <IoInformationCircleOutline />
                      </IconContext.Provider>
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

              <button type="submit" className="btn btn-primary join-item">
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
