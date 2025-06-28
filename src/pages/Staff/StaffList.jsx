import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingOverlay from "../../components/LoadingOverlay";

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
      fetchStaff(1); // Reset list
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/staff/search?q=${searchQuery}`
      );
      setStaff(res.data.data || []);
      setTotalPages(1); // Disable pagination while searching
    } catch (err) {
      setStaff([]);
      toast.error("No staff found");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#a997cb]">Staff Directory</h2>
        <Link
          to="/staffform"
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5] transition"
        >
          + Add Staff
        </Link>
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
                  <td colSpan="7" className="text-center py-8 text-gray-600">
                    Loading staff...
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
                    <td className="px-4 py-2 border">{cust.password}</td>
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
          <LoadingOverlay isLoading={loading} message="Loading staffs..." />
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-[#e7e3f5] text-[#a997cb] rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-[#a997cb] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
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
