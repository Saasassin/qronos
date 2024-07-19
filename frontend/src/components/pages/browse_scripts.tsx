import { useEffect, useState } from "react";
import { FaRegChartBar, FaRegHourglass, FaRunning } from "react-icons/fa";
import { IoCreateOutline } from "react-icons/io5";
import { MdHttp } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { Script, Scripts } from "../../types/qronos";
import { formatDateAndTime } from "../dateutils";
import { deleteScript, fetchScripts } from "../services/Client";

const ScriptTable = () => {
  // = ({ scripts }: { scripts: Scripts }) => {

  useEffect(() => {
    fetchScripts().then((data) => {
      setScripts(data);
    });
  }, []);

  const [scripts, setScripts] = useState<Scripts>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<keyof Scripts[0]>("created_at");
  const [selectedForDelete, setSelectedForDelete] = useState<Script>();

  const handleSort = (field: keyof Scripts[0]) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedScripts = scripts.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortField] && b[sortField]
        ? a[sortField] > b[sortField]
          ? 1
          : -1
        : 0;
    } else {
      return a[sortField] && b[sortField]
        ? a[sortField] < b[sortField]
          ? 1
          : -1
        : 0;
    }
  });

  const showDeleteModal = (script_id: string) => {
    const deleteModal = document.getElementById(
      "delete_modal"
    ) as HTMLDialogElement;
    deleteModal?.showModal();

    // find the script in the list 'scripts' and set it as selected for delete
    const script = scripts.find((script) => script.id === script_id);
    if (script) {
      setSelectedForDelete(script);
    }
  };

  const confirmDeleteScript = (script_id: string) => {
    const deleteModal = document.getElementById(
      "delete_modal"
    ) as HTMLDialogElement;
    deleteModal?.close();

    console.log("Deleting script with id: ", script_id);
    deleteScript(script_id);

    window.location.reload();
  };

  const getScriptTypeIcon = (scriptType: string) => {
    if (scriptType === "RUNNABLE") {
      return (
        <div className="tooltip" data-tip="Runnable Script">
          <div className="badge badge-neutral">
            <FaRunning />
          </div>
        </div>
      );
    } else if (scriptType === "API") {
      return (
        <div className="tooltip" data-tip="HTTP API">
          <div className="badge badge-neutral">
            <MdHttp />
          </div>
        </div>
      );
    }
  };
  return (
    <div className="overflow-x-auto mt-5">
      <table className="table table-zebra  border border-dashed border-neutral border-collapse">
        <thead>
          <tr>
            <th className="text-lg"></th>
            <th className="text-lg">
              <a href="#" onClick={() => handleSort("script_name")}>
                Script Name
              </a>
            </th>
            <th className="text-lg">
              <a href="#" onClick={() => handleSort("script_type")}>
                Type
              </a>
            </th>
            <th className="text-lg">
              <a href="#" onClick={() => handleSort("created_at")}>
                Created
              </a>
            </th>
            <th className="text-lg">Next Run</th>
            <th className="text-lg">Last Run</th>
            <th className="text-lg"></th>
          </tr>
        </thead>
        <tbody>
          {scripts.map((script) => (
            <tr key={script.id} className="hover">
              <td>
                <div className="join">
                  <div className="tooltip" data-tip="Edit Script">
                    <Link to={`/edit_script/${script.id}`}>
                      <button className="btn btn-sm btn-neutral join-item">
                        <IoCreateOutline />
                      </button>
                    </Link>
                  </div>
                  <div className="tooltip" data-tip="Run History">
                    <button className="btn btn-sm btn-neutral join-item">
                      <FaRegChartBar />
                    </button>{" "}
                  </div>
                  <div className="tooltip" data-tip="Schedule">
                    <button className="btn btn-sm btn-neutral join-item">
                      <FaRegHourglass />
                    </button>{" "}
                  </div>
                  <div className="tooltip" data-tip="Delete">
                    <button
                      className="btn btn-sm btn-neutral join-item"
                      onClick={() =>
                        showDeleteModal(script.id ? script.id : "")
                      }
                    >
                      <RiDeleteBinLine />
                    </button>{" "}
                  </div>
                </div>
              </td>
              <td>{script.script_name}</td>
              <td className="justify-center justify-items-center justify-self-center content-center items-center self-center place-content-center place-items-center place-self-center">
                {getScriptTypeIcon(script.script_type)}
              </td>
              <td>{formatDateAndTime(script.created_at)}</td>
              <td>... </td>
              <td>...</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="join justify-center w-full mt-4">
        <button className="join-item btn btn-active">1</button>
        <button className="join-item btn ">2</button>
        <button className="join-item btn ">3</button>
        <button className="join-item btn ">4</button>
      </div>

      {/* BEGIN: DELETE MODAL */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* a button in here will close the form */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">
            Are you sure you want to delete {selectedForDelete?.script_name}?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={() =>
                confirmDeleteScript(
                  selectedForDelete?.id ? selectedForDelete.id : ""
                )
              }
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>
      {/* END: DELETE MODAL */}
    </div>
  );
};

const BrowseScripts = () => {
  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>Browse Scripts</h1>

        <div className="overflow-x-auto">
          <ScriptTable />
          {/* scripts={scripts} /> */}
        </div>
      </div>
    </>
  );
};

export default BrowseScripts;
