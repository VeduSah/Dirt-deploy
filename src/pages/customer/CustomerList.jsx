import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Loader from "../Loader";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const limit = 10;
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const fetchCustomers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/custdirt/pagination?page=${pageNumber}&limit=${limit}`
      );
      setCustomers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch customers");
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    if (!searchQuery.trim()) {
      fetchCustomers(1);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/custdirt/search?q=${searchQuery}`
      );
      const sortedCustomers = (res.data.data || []).sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );
      setCustomers(sortedCustomers);
      setTotalPages(1);
      setLoading(false);
    } catch (err) {
      toast.error("No results found");
      setCustomers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers();
      } else {
        setIsSearching(false);
        fetchCustomers(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `https://dirt-off-backend-main.vercel.app/custdirt/delete/${id}`
      );
      toast.success("Customer deleted successfully");
      fetchCustomers(page);
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     if (searchQuery.trim()) {
  //       const filtered = customers
  //         .filter(
  //           (customer) =>
  //             customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //             customer.phone.includes(searchQuery)
  //         )
  //         .sort((a, b) => a.name.localeCompare(b.name));
  //       setFilteredCustomers(filtered);
  //     } else {
  //       setFilteredCustomers(
  //         customers.sort((a, b) => a.name.localeCompare(b.name))
  //       );
  //     }
  //   }, 500);

  //   return () => clearTimeout(timeoutId);
  // }, [searchQuery, customers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // const SkeletonRow = () => (
  //   <tr className="animate-pulse">
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-8"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-20"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-20"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-24"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-32"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-40"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="h-4 bg-gray-200 rounded w-16"></div>
  //     </td>
  //     <td className="px-4 py-2 border">
  //       <div className="flex justify-center space-x-2">
  //         <div className="h-4 bg-gray-200 rounded w-8"></div>
  //         <div className="h-4 bg-gray-200 rounded w-8"></div>
  //       </div>
  //     </td>
  //   </tr>
  // );

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-[100%] mx-auto px-4 py-4 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-theme-purple">
          Customer Directory
        </h2>
      </div>

      {/* Search Input */}
      <div className="flex items-center mb-6 space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder=" Search by customer or receipt no..."
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
        {/* <button
          onClick={searchEntries}
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5]"
        >
          Search
        </button> */}
        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery("");
              fetchEntries(1); // Reset to page 1 and refetch normal entries
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-theme-purple/20 text-theme-purple">
            <tr>
              <th className="text-center px-4 py-2 border whitespace-nowrap">
                S No.
              </th>
              <th className="text-left px-4 py-2 border whitespace-nowrap">
                First Name
              </th>
              <th className="text-left px-4 py-2 border whitespace-nowrap">
                Last Name
              </th>
              <th className="text-left px-4 py-2 border whitespace-nowrap">
                Phone
              </th>
              <th className="text-left px-4 py-2 border whitespace-nowrap">
                Email
              </th>
              <th className="text-left px-4 py-2 border whitespace-nowrap">
                Address
              </th>
              <th className="text-left px-4 py-2 border whitespace-nowrap">
                Postal Code
              </th>
              <th className="text-center px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <Loader />
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((cust, index) => (
                <tr key={cust._id} className="hover:bg-theme-purple/10">
                  <td className="px-4 py-2 border text-center">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-2 border">{cust.firstName}</td>
                  <td className="px-4 py-2 border">{cust.lastName}</td>
                  <td className="px-4 py-2 border">{cust.phone}</td>
                  <td className="px-4 py-2 border">{cust.email}</td>
                  <td className="px-4 py-2 border">{cust.address}</td>
                  <td className="px-4 py-2 border">{cust.postalCode}</td>
                  <td className="px-4 py-2 border text-center">
                    <Link
                      to={`/customerform/${cust._id}`}
                      className="text-sm text-theme-purple inline-flex hover:underline mr-4"
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

      {/* Pagination - only when not searching */}
      {/* {!isSearching && !loading && customers.length > 0 && ( */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        {/* <LoadingOverlay isLoading={loading} message="Loading customers..." /> */}
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
    </div>
  );
};

export default CustomerList;
