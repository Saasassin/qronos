import { useMonaco } from "@monaco-editor/react";
import { generateSlug } from "random-word-slugs";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { IoInformationCircleOutline } from "react-icons/io5";
import { VscOpenPreview, VscSave } from "react-icons/vsc";
import AlertComponent, { AlertType } from "../core/alert";
import { QronosEditor } from "../core/qronos_editor";

const CreateScript = () => {
  const monaco = useMonaco();

  const [formData, setFormData] = useState({
    id: undefined,
    script_name: generateSlug(3, { format: "kebab" }),
    script_type: "RUNNABLE",
    script_version: {
      code_body: "",
    },
  });

  // initialize alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(AlertType.SUCCESS);

  useEffect(() => {
    console.log("CreateScript mounted...");

    document.title = "Create Script | Qronos";

    // do conditional chaining
    monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    // or make sure that it exists by other ways
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
    }
  }, [monaco]);

  const displaySuccessAlert = (message: string) => {
    setAlertType(AlertType.SUCCESS);
    setAlertMessage(message);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const displayErrorAlert = (message: string) => {
    setAlertType(AlertType.ERROR);
    setAlertMessage(message);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const handleChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const code_body = monaco?.editor.getModels()[0].getValue() ?? "";

    const form_submit_data = {
      script: {
        id: formData.id,
        script_name: formData.script_name,
        script_type: formData.script_type,
      },
      script_version: {
        code_body: code_body,
      },
    };

    console.log("Submitting data: ", form_submit_data);

    try {
      if (!formData.id) {
        // CREATE
        const response = await fetch("http://localhost:8080/script", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form_submit_data),
        });

        const responseData = await response.json();

        if (response.ok) {
          displaySuccessAlert("Script Created Successfully!");
        } else {
          displayErrorAlert("Script Creation Error!");
        }

        // set formData.id to the new id
        setFormData({ ...formData, id: responseData.id });
      } else {
        // UPDATE
        const response = await fetch(
          `http://localhost:8080/script/${formData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form_submit_data),
          }
        );

        const data = await response.json();

        if (response.ok) {
          displaySuccessAlert("Script Updated Successfully!");
        } else {
          displayErrorAlert("Script Update Error!");
        }
      }
    } catch (error) {
      displayErrorAlert("Script Persistence Error!");
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
                value={formData.script_name}
                onChange={handleChange}
                required
              ></input>
            </div>
            <div className="sm:col-span-1">
              <div className="flex items-center justify-center">
                <select
                  className="select select-bordered w-full max-w-xs"
                  id="script_type"
                  name="script_type"
                  value={formData.script_type}
                  onChange={handleChange}
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

              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={handleSubmit}
              >
                {" "}
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
        <AlertComponent
          message={alertMessage}
          message_type={alertType}
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
        />
      </div>
    </>
  );
};

export default CreateScript;
