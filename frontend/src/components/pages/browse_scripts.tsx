import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { GrCaretNext, GrCaretPrevious } from "react-icons/gr";
import { IoCreateOutline } from "react-icons/io5";
import { LuPlug } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import "react-js-cron/dist/styles.css";
import { Link } from "react-router-dom";
import { Script } from "../../types/qronos";
import { CronDiv } from "../core/cron";
import { formatDateAndTime } from "../dateutils";
import {
  deleteScript,
  fetchScripts,
  fetchScriptsCount,
} from "../services/Client";

const BrowseTable = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [selectedForDelete, setSelectedForDelete] = useState<Script>();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 5, //default page size
  });
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
              <button
                className="btn btn-sm btn-neutral join-item"
                onClick={() => showCronModal(row.getValue())}
              >
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
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: false, // disable the ability to remove sorting on columns
    state: { sorting, pagination },
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: count,
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
  });

  useEffect(() => {
    const sortState = tableInstance.getState().sorting;
    const sortDirection = sortState[0].desc ? "DESC" : "ASC"; // convert to server-side sort string

    fetchScriptsCount().then((count) => {
      setCount(count);
      fetchScripts(
        tableInstance.getState().pagination.pageSize,
        tableInstance.getState().pagination.pageSize *
          tableInstance.getState().pagination.pageIndex,
        sortState[0].id,
        sortDirection
      ).then((data) => {
        setData(data);
      });
    });
  }, [sorting, pagination]);

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

  const showCronModal = (script_id: string = "") => {
    const cronModal = document.getElementById(
      "cron_modal"
    ) as HTMLDialogElement;
    cronModal?.showModal();
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
        <p className="float-right text-xs mr-2 mt-3 text-neutral-500 ">
          Page {tableInstance.getState().pagination.pageIndex + 1} of{" "}
          {tableInstance.getPageCount()}. Showing{" "}
          {tableInstance.getState().pagination.pageSize} of{" "}
          {tableInstance.getRowCount()} scripts.
        </p>
        <div className="join justify-center w-full mt-4">
          <button
            className="join-item btn"
            onClick={() => tableInstance.previousPage()}
            disabled={!tableInstance.getCanPreviousPage()}
          >
            <GrCaretPrevious />
          </button>
          <button
            className="join-item btn"
            onClick={() => tableInstance.nextPage()}
            disabled={!tableInstance.getCanNextPage()}
          >
            <GrCaretNext />
          </button>
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

      {/* BEGIN: CRON MODAL */}
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-primary"
          >
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="menu bg-base-200 text-base-content min-h-full w-1/2 p-4 mt-16">
            <CronDiv />
          </div>
        </div>
      </div>
      {/* END: CRON MODAL */}
    </>
  );
};

const BrowseScripts = () => {
  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>Browse Scripts</h1>

        <div className="overflow-x-auto">
          <BrowseTable />
        </div>
      </div>
    </>
  );
};

export default BrowseScripts;
