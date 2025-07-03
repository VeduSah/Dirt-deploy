import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    ServiceCharge: [{ service: "", charge: "", tax: 0 }],
  });

  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(
          "https://dirt-off-backend-main.vercel.app/service"
        );
        setAllServices(res.data.data);
      } catch (err) {
        toast.error("Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `https://dirt-off-backend-main.vercel.app/product/${id}`
          );
          setFormData(res.data.data);
        } catch (err) {
          toast.error("Failed to load product data");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleServiceChargeChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.ServiceCharge];

    // Convert tax to number
    if (name === "tax") {
      updated[index][name] = parseFloat(value) || 0;
    } else {
      updated[index][name] = value;
    }

    setFormData((prev) => ({
      ...prev,
      ServiceCharge: updated,
    }));
  };

  // Add this function
  const addServiceCharge = () => {
    setFormData((prev) => ({
      ...prev,
      ServiceCharge: [
        ...prev.ServiceCharge,
        { service: "", charge: "", tax: 0 },
      ],
    }));
  };

  const removeServiceCharge = (index) => {
    const updated = [...formData.ServiceCharge];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      ServiceCharge: updated,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create a deep copy of formData with tax values converted to numbers
    const dataToSubmit = {
      name: formData.name,
      ServiceCharge: formData.ServiceCharge.map((item) => ({
        service: item.service,
        charge: parseFloat(item.charge) || 0,
        tax: parseFloat(item.tax) || 0, // Include tax for each service charge
      })),
      tax: parseFloat(formData.ServiceCharge[0].tax) || 0, // Keep the top-level tax
    };

    const url = id
      ? `https://dirt-off-backend-main.vercel.app/product/update/${id}`
      : "https://dirt-off-backend-main.vercel.app/product/create";
    const method = id ? "put" : "post";

    try {
      await axios[method](url, dataToSubmit);
      toast.success(
        id ? "Product updated successfully!" : "Product added successfully!"
      );
      navigate("/productlist");
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
          onClick={() => navigate("/productlist")}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-gradient-to-br from-purple-100 via-white to-purple-50 shadow p-6 rounded-lg space-y-4"
      >
        <h2 className="text-xl font-semibold text-[#a997cb] mb-4">
          {id ? "Edit Product" : "Add Product"}
        </h2>

        {/* Product name and first service in one row */}
        <div className="grid grid-cols-1 sm:grid-col gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#a997cb]">
              Product Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-[#a997cb]">
              Service
            </label>
            <input
              list={`services-list-0`}
              name="service"
              value={formData.ServiceCharge[0].service}
              onChange={(e) => handleServiceChargeChange(0, e)}
              required
              placeholder="Select or type a service"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <datalist id={`services-list-0`}>
              {allServices.map((service) => (
                <option key={service._id} value={service.serviceName} />
              ))}
            </datalist>
          </div> */}
        </div>

        {/* Charge for first service */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#a997cb]">
              Tax
            </label>
            <input
              name="tax"
              type="number"
              value={formData.tax}
              onChange={(e) => handleServiceChargeChange(0, e)}
              placeholder="Tax percentage"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a997cb]">
              Charge
            </label>
            <input
              name="charge"
              type="number"
              value={formData.ServiceCharge[0].charge}
              onChange={(e) => handleServiceChargeChange(0, e)}
              required
              placeholder="Amount"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Additional services */}
        {/* Additional services */}
        <div className="space-y-4">
          {formData.ServiceCharge.slice(1).map((item, index) => {
            // Adjust index to account for the first service being handled separately
            const actualIndex = index + 1;
            return (
              <div key={actualIndex} className="border-t pt-4">
                {/* Service row */}
                <div className="grid grid-cols-1 sm:grid-col gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a997cb]">
                      Product Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-[#a997cb]">
                      Service
                    </label>
                    <input
                      list={`services-list-${actualIndex}`}
                      name="service"
                      value={item.service}
                      onChange={(e) =>
                        handleServiceChargeChange(actualIndex, e)
                      }
                      required
                      placeholder="Select or type a service"
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    <datalist id={`services-list-${actualIndex}`}>
                      {allServices.map((service) => (
                        <option key={service._id} value={service.serviceName} />
                      ))}
                    </datalist>
                  </div> */}
                </div>

                {/* Tax and charge row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a997cb]">
                      Tax
                    </label>
                    <input
                      name="tax"
                      type="number"
                      value={item.tax || 0}
                      onChange={(e) =>
                        handleServiceChargeChange(actualIndex, e)
                      }
                      placeholder="Tax percentage"
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#a997cb]">
                      Charge
                    </label>
                    <input
                      name="charge"
                      type="number"
                      value={item.charge}
                      onChange={(e) =>
                        handleServiceChargeChange(actualIndex, e)
                      }
                      required
                      placeholder="Amount"
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeServiceCharge(actualIndex)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addServiceCharge}
            className="text-[#a997cb] text-sm hover:underline"
          >
            + Add Another Service
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
