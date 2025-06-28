import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `https://dirt-off-backend-main.vercel.app/staff/${id}`
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
      ? `https://dirt-off-backend-main.vercel.app/staff/update/${id}`
      : "https://dirt-off-backend-main.vercel.app/staff/create";

    const method = id ? "put" : "post";

    try {
      await axios[method](url, formData);
      toast.success(
        id ? "Staff updated successfully!" : "Staff added successfully!"
      );
      navigate("/stafflist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasNumber && hasLower && hasUpper && hasSymbol;
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/stafflist")}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white shadow p-6 rounded-lg space-y-4"
      >
        <h2 className="text-xl font-semibold text-[#a997cb] mb-4">
          {id ? "Edit Staff" : "Add Staff"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
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
            <label className="block text-sm font-medium text-gray-600">
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
            <label className="block text-sm font-medium text-gray-600">
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
            <label className="block text-sm font-medium text-gray-600">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Password *
            </label>
            <input
              name="password"
              type="text"
              value={formData.password}
              onChange={handleChange}
              required
              className={`mt-1 block w-full border rounded px-3 py-2 text-sm ${
                formData.password && !validatePassword(formData.password)
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Must include: A-Z, a-z, 0-9, symbols"
            />
            {formData.password && !validatePassword(formData.password) && (
              <p className="text-red-500 text-xs mt-1">
                Password must contain uppercase, lowercase, number, and symbol
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          {loading ? "Saving..." : id ? "Update Staff" : "Add Staff"}
        </button>
      </form>
    </div>
  );
};

export default StaffForm;
