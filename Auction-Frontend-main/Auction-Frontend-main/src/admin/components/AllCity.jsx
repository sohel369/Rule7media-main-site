import { TbCategoryPlus } from "react-icons/tb";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import {
  FaCaretUp,
  FaCaretDown,
  FaCaretRight,
  FaCaretLeft,
  FaEye,
  FaRegEdit,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTable, useSortBy, usePagination, useFilters } from "react-table";
import { Link } from "react-router-dom";

import { getAllCities, deleteCity } from "../../store/city/citySlice.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaFilePdf } from "react-icons/fa6";
const AllCategories = () => {
  const dispatch = useDispatch();
  const [filterInput, setFilterInput] = useState("");
  const [filterField, setFilterField] = useState("name");
  const { cities } = useSelector((state) => state.city);

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    setFilter(filterField, value);
    setFilterInput(value);
  };

  const handleDeleteCategory = (id) => {
    dispatch(deleteCity(id)).then(() => {
      dispatch(getAllCities());
    });
  };
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row: { original } }) => (
          <div className="flex gap-2">
            <button onClick={() => handleDeleteCategory(original.actions)}>
              <MdDeleteForever
                size={38}
                className=" inline mt-[-3px] text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger  px-[6px] py-[3px] transition-all"
              />
            </button>
            {/*  <Link to={`/admin/city/edit/${original.actions}`}>
              <FaRegEdit
                size={38}
                className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color  px-2 py-[5px] transition-all"
              />
            </Link> */}
          </div>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    dispatch(getAllCities());
  }, []);

  const data = React.useMemo(
    () =>
      Array.isArray(cities?.data)
        ? cities.data.map((item) => ({
            name: item.name,
            actions: item._id,
          }))
        : [],
    [cities],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    state: { pageIndex, pageSize },
    pageCount,
    gotoPage,
    setPageSize,
    setFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 8 },
    },
    useFilters,
    useSortBy,
    usePagination,
  );
  const printDocument = () => {
    const input = document.getElementById("divToPrint");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "JPEG", 0, 0);
      // Set the document's title
      pdf.setProperties({
        title: "All City",
      });
      // Save the PDF
      pdf.save("Allcities.pdf");
    });
  };

  return (
    <div
      className="px-7 py-4  bg-theme-bg text-slate-300 rounded-2xl h-[100vh]"
      id="divToPrint"
    >
      <div className="">
        <h2 className=" flex items-center justify-between text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5 ">
          City
          {/* <button
            onClick={printDocument}
            className="bg-color-danger items-center px-3 py-2 rounded-lg text-base font-medium inline-flex gap-2"
          >
            <FaFilePdf size={24} />
            Export PDF
          </button> */}
        </h2>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3  items-center gap-2  rounded-lg w-full "></div>
        </div>
      </div>

      <>
        <div className="flex flex-col gap-4  md:flex-row md:justify-between mt-10 md:items-center">
          <div className="flex gap-4">
            <select
              className="outline-none bg-theme-bg2 rounded-xl px-3 py-3 cursor-pointer border border-border-info-color focus:border-theme-color  transition-all"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              <option value="name">Name</option>
            </select>
            <input
              className="outline-none bg-theme-bg2 rounded-xl px-3 py-3 border border-border-info-color focus:border-theme-color w-full transition-all"
              value={filterInput}
              onChange={handleFilterChange}
              placeholder={"Search name"}
            />
          </div>
          <div>
            <Link
              className="text-white flex items-center gap-1 p-3 rounded-md bg-theme-color hover:bg-color-danger font-medium transition-all"
              to={`/admin/city/create-city`}
            >
              <TbCategoryPlus size={22} /> Create City
            </Link>
          </div>
        </div>
        <div className="overflow-auto px-4 rounded-2xl border border-border-info-color mt-4 ">
          <table
            {...getTableProps()}
            className="relative text-left min-w-[900px]  w-full border-separate border-spacing-x-0 border-spacing-y-4 "
          >
            <thead className="sticky top-0 table-header-group">
              {headerGroups.map((headerGroup, headerGroupIndex) => (
                <tr
                  className="table-row"
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroupIndex}
                >
                  {headerGroup.headers.map((column, columnIndex) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={columnIndex}
                      className="p-2 pr-5 select-none first:rounded-l-lg last:rounded-r-lg border-b border-border-info-color  hover:bg-theme-bg2   transition-all"
                    >
                      <div className="flex gap-4">
                        {column.render("Header")}
                        <span>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaCaretDown size={24} className="mt-[-2px]" />
                            ) : (
                              <FaCaretUp size={24} />
                            )
                          ) : null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="table-row-group" {...getTableBodyProps()}>
              {page &&
                page.map((row) => {
                  prepareRow(row);
                  const rowProps = row.getRowProps();
                  return (
                    <tr
                      {...rowProps}
                      {...row.getRowProps()}
                      key={row.id}
                      className="table-row bg-theme-bg-light rounded-3xl"
                    >
                      {row.cells.map((cell, cellIndex) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            key={cellIndex}
                            className="pl-2 pr-5"
                          >
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-4 my-4 items-center md:button:px-4 md:button:py-2 button:px-2 button:py-1 button:rounded-lg  ">
          <div className="flex justify-center items-center gap-4">
            <button
              className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
                pageIndex === 0 ? "bg-gray-500 hover:bg-gray-500" : ""
              }`}
              onClick={() => gotoPage(0)}
              disabled={pageIndex === 0 ? true : false}
            >
              <MdSkipPrevious size={18} />{" "}
            </button>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
                !canPreviousPage ? "bg-gray-500 hover:bg-gray-500" : ""
              }`}
            >
              <FaCaretLeft size={18} />
            </button>
            <span className="text-slate-300">
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageCount}{" "}
              </strong>
              {"  "}
            </span>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
                !canNextPage ? "bg-gray-500 hover:bg-gray-500" : ""
              }`}
            >
              <FaCaretRight size={18} />
            </button>
            <button
              className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
                pageIndex === pageCount - 1
                  ? "bg-gray-500 hover:bg-gray-500"
                  : ""
              }`}
              onClick={() => gotoPage(pageCount - 1)}
            >
              <MdSkipNext size={18} />{" "}
            </button>
          </div>

          <select
            className="outline-none hidden md:block bg-theme-bg2 rounded-xl px-4 py-3 cursor-pointer border border-border-info-color focus:border-theme-color  transition-all "
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[8, 12, 16, 20, 24, 28, 32, 36, 40].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </>
    </div>
  );
};

export default AllCategories;
