import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const CustomerForm = ({ isPopup = false, onSubmitSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromEntryForm = location.state?.fromEntryForm;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `https://dirt-off-backend-main.vercel.app/custdirt/${id}`
          );
          setFormData(res.data.data);
        } catch (err) {
          toast.error("Failed to load customer data");
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = id
      ? `https://dirt-off-backend-main.vercel.app/custdirt/update/${id}`
      : "https://dirt-off-backend-main.vercel.app/custdirt/create";

    const method = id ? "put" : "post";

    try {
      const res = await axios[method](url, formData);

      if (fromEntryForm && onSubmitSuccess) {
        onSubmitSuccess(formData);
        return;
      }

      toast.success(
        id ? "Customer updated successfully!" : "Customer added successfully!"
      );
      navigate("/customerlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (fromEntryForm) {
              navigate("/entryform");
            } else {
              navigate("/customerlist");
            }
          }}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          ← Back
        </button>{" "}
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white shadow p-6 rounded-lg space-y-4"
      >
        <h2 className="text-xl font-semibold text-theme-purple mb-4">
          {id ? "Edit Customer" : "Add Customer"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone *
            </label>
            <input
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              pattern="[6-9]\d{9}"
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              name="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleChange}
              pattern="\d{6}"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="6-digit code"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-theme-purple text-white px-5 py-2 rounded hover:bg-theme-purple-dark transition disabled:opacity-50"
        >
          {loading ? "Saving..." : id ? "Update Customer" : "Add Customer"}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
