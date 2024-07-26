import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import {
  FaRegChartBar,
  FaRegHourglass,
  FaRunning,
  FaSortUp,
} from "react-icons/fa";
import { FaSortDown } from "react-icons/fa6";
import { IoCreateOutline } from "react-icons/io5";
import { LuPlug } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { Script } from "../../types/qronos";
import { formatDateAndTime } from "../dateutils";
import { deleteScript, fetchScripts } from "../services/Client";

const BrowseTable = () => {
  const [data, setData] = useState([]);
  const [selectedForDelete, setSelectedForDelete] = useState<Script>();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const columnHelper = createColumnHelper<Script>();
  const columns = [
    columnHelper.accessor("id", {
      header: "",
      enableSorting: false,

      cell: (row) => (
        <>
          <div className="join">
            <div className="tooltip" data-tip="Edit Script">
              <Link to={`/edit_script/${row.getValue()}`}>
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
                onClick={() => showDeleteModal(row.getValue())}
              >
                <RiDeleteBinLine />
              </button>{" "}
            </div>
          </div>
        </>
      ),
    }),
    columnHelper.accessor("script_name", {
      header: "Name",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("script_type", {
      header: "Type",
      cell: (row) => getScriptTypeIcon(row.getValue()),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (row) => formatDateAndTime(row.getValue()),
    }),
  ];

  const tableInstance = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    //getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: false, // disable the ability to remove sorting on columns
    state: { sorting },
  });

  useEffect(() => {
    console.log("sortby", tableInstance.getState().sorting);

    const sortState = tableInstance.getState().sorting;
    const sortDirection = sortState[0].desc ? "DESC" : "ASC"; // convert to server-side sort string

    fetchScripts(25, 0, sortState[0].id, sortDirection).then((data) => {
      setData(data);
    });
  }, [sorting]);

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
            <LuPlug />
          </div>
        </div>
      );
    }
  };

  const showDeleteModal = (script_id: string = "") => {
    const deleteModal = document.getElementById(
      "delete_modal"
    ) as HTMLDialogElement;
    deleteModal?.showModal();

    //find the script in the list 'scripts' and set it as selected for delete
    const script = data.find(
      (script: { id: string }) => script.id === script_id
    );
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

  return (
    <>
      <div className="overflow-x-auto mt-5">
        <table className="table table-zebra  border border-dashed border-neutral border-collapse">
          <thead>
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={
                      "text-lg " +
                      (header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : "")
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: (
                        <IconContext.Provider
                          value={{
                            className:
                              "react-icon-button inline-block pl-0 ml-0",
                          }}
                        >
                          <FaSortUp />
                        </IconContext.Provider>
                      ),
                      desc: (
                        <IconContext.Provider
                          value={{
                            className:
                              "react-icon-button inline-block pl-0 ml-0",
                          }}
                        >
                          <FaSortDown />
                        </IconContext.Provider>
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableInstance.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
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
      {/* BEGIN: DELETE MODAL */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* a button in here will close the form */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p className="py-4">
            Are you sure you want to delete `
            <b>{selectedForDelete?.script_name}</b>`?
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
    </>
  );
};

const BrowseScripts = () => {
  // const [data, setData] = useState([]);

  // useEffect(() => {
  //   fetchScripts().then((data) => {
  //     setData(data);
  //   });
  // }, []);

  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>Browse Scripts</h1>

        <div className="overflow-x-auto">
          <BrowseTable />
          {/* <BrowseTable data={data} /> */}
        </div>
      </div>
    </>
  );
};

export default BrowseScripts;
