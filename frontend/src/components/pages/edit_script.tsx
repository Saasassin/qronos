import { generateSlug } from "random-word-slugs";
import { IconContext } from "react-icons";

import { IoInformationCircleOutline } from "react-icons/io5";
import { VscOpenPreview, VscSave } from "react-icons/vsc";
import AlertComponent, { AlertType } from "../core/alert";

import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

// BEGIN: Needed in Vite environments
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { FaRegHourglass } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { Schedule, ScriptWithVersion } from "../../types/qronos";
import { CronDiv } from "../core/cron";
import {
  deleteSchedule,
  fetchSchedule,
  fetchScript,
  saveOrUpdateSchedule,
  saveOrUpdateScript,
} from "../services/Client";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      console.log("Returning json worker");
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      console.log("Returning css worker");
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      console.log("Returning html worker");
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      console.log("Returning ts worker");
      return new tsWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
loader.init().then((monaco) => {
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  });
});
// END: Needed in Vite environments

const EditScript = () => {
  //const [editorValue, setEditorValue] = useState<string>("");

  const monacoRef = useRef(null);
  const editorRef = useRef<any>(null);

  /**
   * This is a callback function that is called when the editor is mounted.
   */
  const handleEditorDidMount = (mountedEditor: any, mountedMonaco: any) => {
    //console.log("editor mounted");

    editorRef.current = mountedEditor;
    monacoRef.current = mountedMonaco;
  };

  // This is a callback function that is called when the editor content changes.
  const handleEditorChange = (value: any) => {
    formData.script_version.code_body = value;
    //setEditorValue(value);
    setIsDirtyForm(true);
  };

  const handleEditorValidation = (markers: any) => {
    //console.log("markers: ", markers);
    // TODO: if markers.length > 0, display error alert before saving.
  };

  // TODO: move some of these to settings.
  const editorOptions = {
    automaticLayout: true, //
    glyphMargin: true, // margin for symbols like error and warning
    lineNumbers: "on",
    folding: true,
    minimap: { enabled: true },
    wordWrap: "on",
    wrappingIndent: "indent",
    wrappingStrategy: "advanced",
    fontSize: 14,
    lineHeight: 16,
    formatOnType: true,
    formatOnPaste: true,
  };

  const [formData, setFormData] = useState<ScriptWithVersion>({
    script: {
      id: undefined,
      script_name: generateSlug(3, { format: "kebab" }),
      script_type: "RUNNABLE",
      created_at: undefined,
      updated_at: undefined,
      script_schedule: undefined,
    },
    script_version: {
      id: undefined,
      code_body:
        "// Welcome to Qronos script editor!\n\nfunction hello(foo: string) {\n\tconsole.log('Hello, ' + foo);\n}\n\nhello('world');\n",
      created_at: undefined,
    },
  });

  const [schedule, setSchedule] = useState<Schedule>({
    id: undefined,
    script_id: formData.script.id,
    cron_expression: "",
    created_at: undefined,
    updated_at: undefined,
  });

  // initialize alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(AlertType.SUCCESS);

  // initialize save button dirty state
  const [isDirty, setIsDirtyForm] = useState(false);

  // initialize whether we can schedule the script
  const [isCronable, setIsCronable] = useState(false);

  // initialize page header state
  const [pageTitle, setPageTitle] = useState("Create Script");

  const { id } = useParams();

  const cron_tooltip = isCronable ? "Schedule" : "Not a Runnable Script";

  useEffect(() => {
    if (id) {
      fetchScript(id).then((data) => {
        setFormData(data);

        if (id) {
          //console.log("Editing Script: ", data.script.script_name);
          setPageTitle("Edit Script");
          document.title = "Qronos | Edit Script";
          if (data.script.script_type === "RUNNABLE") {
            setIsCronable(true);
          } else {
            setIsCronable(false);
          }
        } else {
          //console.log("Creating Script");
          setPageTitle("Create Script");
          document.title = "Qronos | Create Script";
        }
      });

      // fetch the schedule for this script
      fetchSchedule(id).then((data) => {
        if (data) {
          setSchedule(data);
        } else {
          setSchedule({
            id: undefined,
            script_id: id,
            cron_expression: "",
            created_at: undefined,
            updated_at: undefined,
          });
        }
      });
    }
  }, [id]);

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

  // This handles changes in the form fields, but NOT the editor.
  const handleChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      script: {
        ...formData.script,
        [name]: value,
      },
    });

    if (value === "RUNNABLE") {
      setIsCronable(true);
    } else {
      setIsCronable(false);
    }
    setIsDirtyForm(true);
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setIsDirtyForm(false);

    event.preventDefault();

    //console.log("Submitting data: ", formData);

    try {
      saveOrUpdateScript(formData).then(async (response) => {
        if (response.ok) {
          const responseData = await response.json();
          setFormData({
            ...formData,
            script: responseData.script,
            script_version: responseData.script_version,
          });

          // toggle the button to be visible if the script is runnable
          if (formData.script.script_type === "RUNNABLE") {
            setIsCronable(true);
          } else {
            setIsCronable(false);
          }

          displaySuccessAlert("Script Updated Successfully!");
        } else {
          displayErrorAlert("Script Save Error!" + response.statusText);
        }
      });
    } catch (error) {
      displayErrorAlert("Script Persistence Error!");
      console.error("Error:", error);
    }
  };

  const saveCronFn = (new_cron_expression: string) => {
    // close the drawer
    const cronModal = document.getElementById(
      "my-drawer-4"
    ) as HTMLInputElement;
    cronModal.checked = false;

    if (new_cron_expression === "") {
      displayErrorAlert("Cron Expression cannot be empty!");
      return;
    }

    schedule.cron_expression = new_cron_expression;
    saveOrUpdateSchedule(schedule);

    displaySuccessAlert("Schedule Updated Successfully!");
  };

  const deleteCronFn = () => {
    // close the drawer
    const cronModal = document.getElementById(
      "my-drawer-4"
    ) as HTMLInputElement;
    cronModal.checked = false;

    deleteSchedule(formData.script.id || "");

    displaySuccessAlert("Schedule Deleted Successfully!");
  };

  const showCronModal = () => {
    // open the drawer to show the cron modal htmlFor="my-drawer-4"
    const cronModal = document.getElementById(
      "my-drawer-4"
    ) as HTMLInputElement;

    cronModal.checked = true;
  };

  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>{pageTitle}</h1>

        <form className="mt-5">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="sm:col-span-1">
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                name="script_name"
                id="script_name"
                value={formData.script.script_name}
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
                  value={formData.script.script_type}
                  onChange={handleChange}
                  required
                >
                  <option value="RUNNABLE">Runnable Script</option>
                  <option value="API">HTTP API</option>
                </select>
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-circle btn-ghost btn-xs ml-3 group"
                >
                  <IconContext.Provider
                    value={{ className: "react-icon-button" }}
                  >
                    <IoInformationCircleOutline />
                  </IconContext.Provider>
                  <div className="invisible group-hover:visible z-50">
                    <div className="card bg-neutral text-neutral-content w-96">
                      <div className="card-body">
                        <h5 className="mb-0">Runnable Script</h5>
                        <p className="leading-normal">
                          A script that is triggered on a cron-like schedule or
                          executed on-demand.
                        </p>{" "}
                        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />{" "}
                        <h5 className="mb-0">HTTP API</h5>
                        <p className="leading-normal">
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
                <div className="tooltip" data-tip={`${cron_tooltip}`}>
                  <button
                    type="button"
                    className={`btn btn-primary join-item ${
                      isCronable ? "" : "btn-disabled"
                    }`}
                    onClick={() => showCronModal()}
                  >
                    <IconContext.Provider
                      value={{ className: "react-icon-button" }}
                    >
                      <FaRegHourglass />
                    </IconContext.Provider>
                  </button>
                </div>
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
                  className={`btn btn-primary join-item ${
                    isDirty ? "" : "btn-disabled"
                  }`}
                  onClick={handleSubmit}
                >
                  <IconContext.Provider
                    value={{ className: "react-icon-button" }}
                  >
                    <VscSave />
                  </IconContext.Provider>
                  Save
                </button>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="code_body"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              ></label>
              <Editor
                height="60vh"
                width="100%"
                options={editorOptions}
                theme="vs-dark"
                loading={<div>Reticulating Splines...</div>}
                defaultLanguage="typescript"
                defaultValue={formData.script_version?.code_body}
                value={formData.script_version?.code_body}
                name="code_body"
                id="code_body"
                onChange={(value: any) => {
                  handleEditorChange(value);
                }}
                onMount={(editor: any, monaco: any) => {
                  handleEditorDidMount(editor, monaco);
                }}
                onValidate={(markers: any) => {
                  handleEditorValidation(markers);
                }}
              />{" "}
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
                className={`btn btn-primary join-item ${
                  isDirty ? "" : "btn-disabled"
                }`}
                onClick={handleSubmit}
              >
                {" "}
                <IconContext.Provider
                  value={{ className: "react-icon-button" }}
                >
                  <VscSave />
                </IconContext.Provider>
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
        {/* BEGIN: CRON MODAL */}
        <div className="drawer drawer-end">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-4"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <div className="menu bg-base-200 text-base-content min-h-full w-1/2 p-4 mt-16">
              <CronDiv
                saveCronFn={saveCronFn}
                deleteCronFn={deleteCronFn}
                script_name={formData.script.script_name || ""}
                defaultValue={schedule?.cron_expression || ""}
              />
            </div>
          </div>
        </div>
        {/* END: CRON MODAL */}
      </div>
    </>
  );
};

export default EditScript;
