import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const limit = 10;

  const fetchProducts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/product/pagination?page=${pageNumber}&limit=${limit}`
      );
      setProducts(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/product/search?q=${searchQuery}`
      );
      setProducts(res.data.data || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) fetchProducts(page);
  }, [page, isSearching]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `https://dirt-off-backend-main.vercel.app/product/delete/${id}`
      );
      toast.success("Product deleted successfully");
      fetchProducts(page);
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-2 border">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </td>
      <td className="px-4 py-2 border">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-4 py-2 border">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 py-2 border">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-4 py-2 border">
        <div className="flex justify-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-8"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </td>
    </tr>
  );

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-[100%] mx-auto px-4 py-4 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#a997cb]">
          Products Directory
        </h2>
        <Link
          to="/productform"
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5] transition"
        >
          + Add Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center mb-6 space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
        {/* <button
          onClick={searchProducts}
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5]"
        >
          Search
        </button> */}
        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery("");
              setIsSearching(false);
              fetchProducts(1);
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      <>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[#e7e3f5] shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-[#e7e3f5] text-[#a997cb]">
              <tr>
                <th className="px-4 py-2 border text-center">S No.</th>
                <th className="text-left px-4 py-2 border">Product Name</th>
                <th className="text-left px-4 py-2 border">Charge</th>
                <th className="text-left px-4 py-2 border">Tax</th>
                <th className="text-center px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod, index) => (
                  <tr key={prod._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {isSearching ? index + 1 : (page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-2 border">{prod.name}</td>
                    <td className="px-4 py-2 border">
                      {prod.ServiceCharge.map((sc, idx) => (
                        <span key={idx}>
                          ₹{sc.charge}
                          {idx < prod.ServiceCharge.length - 1 && ", "}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-2 border">
                      {prod.ServiceCharge.map((sc, idx) => (
                        <span key={idx}>
                          {prod.tax || 0}%
                          {idx < prod.ServiceCharge.length - 1 && ", "}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <Link
                        to={`/productform/${prod._id}`}
                        className="text-sm text-[#a997cb] hover:text-[#8a82b5] inline-flex hover:underline mr-4"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id)}
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
        {!isSearching && !loading && products.length > 0 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
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
        )}
      </>
    </div>
  );
};

export default ProductList;
