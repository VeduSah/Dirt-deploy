import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingOverlay from "../../components/LoadingOverlay";
import Loader from "../Loader";
import CSV from "../../pages/CSV";

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const limit = 10;

  const fetchStaff = async (pageNumber = 1) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/staff/pagination?page=${pageNumber}&limit=${limit}`
      );
      setStaff(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const searchStaff = async () => {
    if (!searchQuery.trim()) {
      fetchStaff(1);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/staff/search?q=${searchQuery}`
      );
      const sortedStaff = (res.data.data || []).sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );
      setStaff(sortedStaff);
      setTotalPages(1);
      setLoading(false);
    } catch (err) {
      toast.error("No results found");
      setStaff([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchStaff();
      } else {
        setIsSearching(false);
        fetchStaff(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearching) {
      fetchStaff(page);
    }
  }, [page, isSearching]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this staff member?"
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `https://dirt-off-backend-main.vercel.app/staff/delete/${id}`
      );
      toast.success("Staff deleted successfully");
      if (isSearching) {
        searchStaff();
      } else {
        fetchStaff(page);
      }
    } catch (err) {
      toast.error("Failed to delete staff");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Capital
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Small
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Symbol

    for (let i = 4; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  return (
    <div className="max-w-[100%] mx-auto px-4 py-4 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#a997cb]">Staff Directory</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Link
            to="/staffform"
            className="bg-[#a997cb] text-white px-4 py-3 rounded hover:bg-[#8a82b5] transition text-center w-full sm:w-auto"
          >
            + Add Staff
          </Link>
          <CSV type="staff" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center mb-6 space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search staff by name, phone, or email..."
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
        {/* <button
          onClick={searchStaff}
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5]"
        >
          Search
        </button> */}
        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery("");
              setIsSearching(false);
              setPage(1);
              fetchStaff(1);
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      <>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            {loading && (
              <div className="md:hidden flex justify-center items-center px-20 ml-10 py-16 rounded-lg  mb-4">
                <div className="text-center">
                  <Loader />
                  {/* <p className="text-gray-500 mt-2">Loading customers...</p> */}
                </div>
              </div>
            )}
            <thead className="bg-[#e6e1f1] text-[#a997cb]">
              <tr>
                <th className="text-center px-4 py-2 border">S No.</th>
                <th className="text-left px-4 py-2 border">First Name</th>
                <th className="text-left px-4 py-2 border">Last Name</th>
                <th className="text-left px-4 py-2 border">Phone</th>
                <th className="text-left px-4 py-2 border">Email</th>
                <th className="text-left px-4 py-2 border">Password</th>
                <th className="text-left px-4 py-2 border">Address</th>
                <th className="text-center px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8">
                    <div className="flex justify-center items-center w-full min-h-[100px] text-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {isSearching
                      ? `No staff found matching "${searchQuery}".`
                      : "No staff found."}
                  </td>
                </tr>
              ) : (
                staff.map((cust, index) => (
                  <tr key={cust._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {isSearching ? index + 1 : (page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-2 border">{cust.firstName}</td>
                    <td className="px-4 py-2 border">{cust.lastName}</td>
                    <td className="px-4 py-2 border">{cust.phone}</td>
                    <td className="px-4 py-2 border">{cust.email}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center justify-center gap-2">
                        {showPasswords[cust._id] ? (
                          <span
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                [cust._id]: false,
                              }))
                            }
                            className="cursor-pointer"
                          >
                            {cust.password}
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                [cust._id]: true,
                              }))
                            }
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FaEye />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-2 border">{cust.address}</td>
                    <td className="px-4 py-2 border text-center">
                      <Link
                        to={`/staffform/${cust._id}`}
                        className="text-sm text-[#a997cb] inline-flex hover:underline mr-4"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(cust._id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {/* Pagination */}
        {/* {!isSearching && !loading && staff.length > 0 && ( */}
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-[#e7e3f5] text-[#a997cb] rounded disabled:opacity-50"
          >
            Previous
          </button>

          {(() => {
            const maxVisible = 5;
            const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
            const endPage = Math.min(totalPages, startPage + maxVisible - 1);
            const adjustedStartPage = Math.max(1, endPage - maxVisible + 1);

            return Array.from(
              { length: endPage - adjustedStartPage + 1 },
              (_, i) => adjustedStartPage + i
            ).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded ${
                  page === pageNum
                    ? "bg-[#a997cb] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {pageNum}
              </button>
            ));
          })()}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 bg-[#e7e3f5] text-[#a997cb] rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        {/* )} */}
      </>
    </div>
  );
};

export default StaffList;
