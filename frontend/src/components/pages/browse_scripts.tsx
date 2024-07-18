import { useEffect, useState } from "react";
import { FaRegChartBar, FaRegHourglass, FaRunning } from "react-icons/fa";
import { IoCreateOutline } from "react-icons/io5";
import { MdHttp } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { Scripts } from "../../types/qronos";
import { fetchScripts } from "../services/Client";

const ScriptTable = ({ scripts }: { scripts: Scripts }) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<keyof Scripts[0]>("created_at");

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
  scripts = sortedScripts;

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

  const formatDateAndTime = (date: any) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
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
                    <button className="btn btn-sm btn-neutral join-item">
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
    </div>
  );
};

const BrowseScripts = () => {
  const [scripts, setScripts] = useState<Scripts>([]);
  useEffect(() => {
    fetchScripts().then((data) => {
      setScripts(data);
    });
  }, []);

  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>Browse Scripts</h1>

        <div className="overflow-x-auto">
          <ScriptTable scripts={scripts} />
        </div>
      </div>
    </>
  );
};

export default BrowseScripts;
