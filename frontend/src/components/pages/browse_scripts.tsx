import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useReducer, useState } from "react";
import { FaRegChartBar, FaRegHourglass, FaRunning } from "react-icons/fa";
import { IoCreateOutline } from "react-icons/io5";
import { MdHttp } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { Script } from "../../types/qronos";
import { formatDateAndTime } from "../dateutils";
import { deleteScript, fetchScripts } from "../services/Client";

const BrowseTable = ({ data }: { data: any }) => {
  const rerender = useReducer(() => ({}), {})[1];

  const columnHelper = createColumnHelper<Script>();
  const columns = [
    columnHelper.accessor("id", {
      header: "",
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

  type ColumnSort = {
    id: string;
    desc: boolean;
  };
  type SortingState = ColumnSort[];

  const [selectedForDelete, setSelectedForDelete] = useState<Script>();
  const [sorting, setSorting] = useState<SortingState>([]); // can set initial sorting state here
  const tableInstance = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    //getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting,
    state: {
      sorting: [
        {
          id: "created_at",
          desc: true,
        },
      ] as SortingState,
    },
  });

  console.log(tableInstance.getState().sorting);

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
                  <th key={header.id} className="text-lg">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchScripts().then((data) => {
      setData(data);
    });
  }, []);

  return (
    <>
      <div className="ml-64 mt-16 p-4">
        <h1>Browse Scripts</h1>

        <div className="overflow-x-auto">
          {/* <BrowseTable columns={columns} data={data} /> */}
          <BrowseTable data={data} />
        </div>
      </div>
    </>
  );
};

export default BrowseScripts;
