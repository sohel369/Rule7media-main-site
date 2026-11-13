import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import { Link } from "react-router-dom";
import { deleteUserById, getAllUsers } from "../../store/user/userSlice";
import {
  FaCaretUp,
  FaCaretDown,
  FaCaretRight,
  FaCaretLeft,
  FaEye,
  FaRegEdit,
} from "react-icons/fa";
import { MdDeleteForever, MdSkipPrevious, MdSkipNext } from "react-icons/md";

const UserListByType = ({ type, verified, newUsers }) => {
  const dispatch = useDispatch();
  const { allUser, isLoading, isError, message } = useSelector(
    (state) => state.user,
  );

  const [filterInput, setFilterInput] = useState("");
  const [filterField, setFilterField] = useState("firstName");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const filteredData = React.useMemo(() => {
    let users = Array.isArray(allUser?.data) ? allUser.data : [];
    if (type) {
      users = users.filter((user) => user.userType === type);
    }
    if (verified) {
      users = users.filter((user) => user.paymentVerified === true);
    }
    if (newUsers) {
      users = users.filter(
        (user) =>
          new Date(user.createdAt).getTime() >
          new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
      );
    }
    return users.map((user) => ({
      profilePicture:
        user.profilePicture ||
        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg", // Fallback image
      firstName: user.firstName || "N/A",
      userType: user.userType || "N/A",
      paymentVerified: user.paymentVerified ? "Verified" : "Unverified",
      actions: user._id,
    }));
  }, [allUser, type, verified, newUsers]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Picture",
        accessor: "profilePicture",
        Cell: ({ value }) => (
          <img
            src={value}
            alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            className="object-cover"
          />
        ),
      },
      {
        Header: "Name",
        accessor: "firstName",
      },
      {
        Header: "Type",
        accessor: "userType",
        Cell: ({ value }) => <span className="capitalize">{value}</span>,
      },
      {
        Header: "Verified",
        accessor: "paymentVerified",
        Cell: ({ value }) => (
          <span
            className={`py-1 px-2 border rounded-lg ${
              value === "Unverified"
                ? "text-orange-500 border-orange-500"
                : "text-green-500 border-green-500"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row: { original } }) => (
          <div className="flex gap-2">
            <Link to={`/admin/users/profile/${original.actions}`}>
              <FaEye
                size={38}
                className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
              />
            </Link>
            <button
              onClick={() =>
                dispatch(deleteUserById(original.actions)).then(() =>
                  dispatch(getAllUsers()),
                )
              }
            >
              <MdDeleteForever
                size={38}
                className="inline mt-[-3px] text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger px-[6px] py-[3px] transition-all"
              />
            </button>
            <Link to={`/admin/users/edit/${original.actions}`}>
              <FaRegEdit
                size={38}
                className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
              />
            </Link>
          </div>
        ),
      },
    ],
    [],
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
      data: filteredData,
      initialState: { pageSize: 8 },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    setFilter(filterField, value);
    setFilterInput(value);
  };

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (isError) return <div className="text-red-500">Error: {message}</div>;

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        {type
          ? type.charAt(0).toUpperCase() + type.slice(1) + "s"
          : verified
            ? "Verified Users"
            : "New Users"}
      </h2>

      <div className="mt-12">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="outline-none bg-theme-bg2 rounded-xl px-3 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all"
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="firstName">Select a field</option>
            <option value="firstName">Name</option>
            <option value="userType">Type</option>
            <option value="paymentVerified">Verified</option>
          </select>
          <input
            className="outline-none w-full md:w-[200px] bg-theme-bg2 rounded-xl px-3 py-3 border border-border-info-color focus:border-theme-color transition-all"
            value={filterInput}
            onChange={handleFilterChange}
            placeholder={`Search ${filterField}`}
          />
        </div>
        <div className="overflow-auto px-4 rounded-2xl border border-border-info-color mt-4 max-h-[500px]">
          <table
            {...getTableProps()}
            className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4"
          >
            <thead className="sticky top-0 bg-theme-bg table-header-group">
              {headerGroups.map((headerGroup, headerGroupIndex) => (
                <tr
                  className="table-row"
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroupIndex}
                >
                  {headerGroup.headers.map((column, i) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={i}
                      className="p-2 pr-5 select-none first:rounded-l-lg last:rounded-r-lg border-b border-border-info-color hover:bg-theme-bg2 transition-all"
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
                page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} key={i} className="border">
                      {row.cells.map((cell, j) => (
                        <td
                          className="pl-2 pr-5 border-b border-border-info-color pb-2"
                          {...cell.getCellProps()}
                          key={`${i}-${j}`}
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4 my-4 items-center">
        <div className="flex justify-center items-center gap-4">
          <button
            className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
              pageIndex === 0 ? "bg-gray-500 hover:bg-gray-500" : ""
            }`}
            onClick={() => gotoPage(0)}
            disabled={pageIndex === 0}
          >
            <MdSkipPrevious size={18} />
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
              {pageIndex + 1} of {pageCount}
            </strong>
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
              pageIndex === pageCount - 1 ? "bg-gray-500 hover:bg-gray-500" : ""
            }`}
            onClick={() => gotoPage(pageCount - 1)}
            disabled={pageIndex === pageCount - 1}
          >
            <MdSkipNext size={18} />
          </button>
        </div>
        <select
          className="outline-none bg-theme-bg2 rounded-xl px-4 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[8, 12, 16, 20, 24, 28, 32, 36, 40].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UserListByType;
