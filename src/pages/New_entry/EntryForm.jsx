import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ModalCustomer from "../customer/ModalCoustomer";

const EntryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer: "",
    customerId: "",
    customerPhone: "",
    status: "pending",
    products: [
      { productName: "", quantity: 1, unitPrice: 0, amount: 0, taxPer: 0 },
    ],
    charges: { subtotal: 0, taxAmount: 0, totalAmount: 0 },
    taxPercent: 0,
    pickupAndDelivery: {
      pickupType: "Self",
      deliveryType: "Self",
      pickupAddress: "",
      deliveryAddress: "",
      pickupDate: "",
      expectedDeliveryDate: "",
    },
  });
  const services = [];
  // const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);

  useEffect(() => {
    const savedFormData = sessionStorage.getItem("entryFormData");
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
      sessionStorage.removeItem("entryFormData"); // Clear after retrieving
    }
    // Fetch services, customers, products once on mount
    // const fetchServices = async () => {
    //   try {
    //     const res = await axios.get(
    //       "https://dirt-off-backend-main.vercel.app/service"
    //     );
    //     if (Array.isArray(res.data.data)) setServices(res.data.data);
    //   } catch {
    //     toast.error("Failed to fetch services");
    //   }
    // };

    const fetchCustomers = async () => {
      try {
        const res = await axios.get(
          "https://dirt-off-backend-main.vercel.app/custdirt"
        );
        if (Array.isArray(res.data.data)) setCustomers(res.data.data);
      } catch {
        toast.error("Failed to fetch customers");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "https://dirt-off-backend-main.vercel.app/product"
        );
        if (Array.isArray(res.data.data)) setProducts(res.data.data);
      } catch {
        toast.error("Failed to fetch products");
      }
    };

    // fetchServices();
    fetchCustomers();
    fetchProducts();
  }, []); // empty dependency means only runs once

  // Fetch entry data only once services have loaded and id is present
  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://dirt-off-backend-main.vercel.app/entry/${id}`
        );
        const entryData = res.data.data;

        // Map products to include taxPer from the tax field
        const productsWithTax = entryData.products.map((p) => ({
          ...p,
          taxPer: p.tax || 0,
        }));

        // Use the charges directly from the API response
        setFormData({
          ...entryData,
          products: productsWithTax,
          // No need to recalculate charges as they're already in the response
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleAddCustomer = async (newCustomer) => {
    try {
      const res = await axios.post(
        "https://dirt-off-backend-main.vercel.app/custdirt/create",
        newCustomer
      );
      const addedCustomer = res.data.data;

      setCustomers((prev) => [...prev, addedCustomer]);
      setFormData((prev) => ({
        ...prev,
        customer: addedCustomer.firstName + " " + addedCustomer.lastName,
        customerId: addedCustomer._id,
        customerPhone: addedCustomer.phone || "", // Add this line
        pickupAndDelivery: {
          ...prev.pickupAndDelivery,
          pickupAddress: addedCustomer.address || "",
          deliveryAddress: addedCustomer.address || "",
          pickupDate: new Date().toISOString().split("T")[0],
          expectedDeliveryDate: new Date().toISOString().split("T")[0],
        },
      }));

      setShowCustomerPopup(false);
      // toast.success("Customer added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add customer");
    }
  };

  const recalculateCharges = (products) => {
    const subtotal = products.reduce((acc, p) => acc + p.amount, 0);

    // Calculate tax amount based on each product's tax percentage and amount
    const taxAmount = products.reduce((acc, p) => {
      const productTaxAmount = (p.amount * (p.taxPer || 0)) / 100;
      return acc + productTaxAmount;
    }, 0);

    const totalAmount = subtotal + taxAmount;
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    let selectedProduct = { ...newProducts[index] };

    if (field === "productName") {
      const productData = products.find((p) => p.name === value);
      const defaultCharge = productData?.ServiceCharge?.[0]?.charge || 0;
      const productTax = productData?.tax || 0; // Get the tax from the product

      selectedProduct = {
        ...selectedProduct,
        productName: value,
        unitPrice: defaultCharge,
        amount: selectedProduct.quantity * defaultCharge,
        taxPer: productTax,
      };
      setFormData((prev) => ({
        ...prev,
        taxPercent: productTax,
        charges: recalculateCharges(
          prev.products.map((p, i) => (i === index ? selectedProduct : p)),
          productTax
        ),
      }));
    } else if (field === "unitPrice" || field === "quantity") {
      selectedProduct = {
        ...selectedProduct,
        [field]: Number(value),
      };
      selectedProduct.amount =
        selectedProduct.quantity * selectedProduct.unitPrice;
    } else if (field === "taxPer") {
      // Add explicit handling for tax changes
      selectedProduct = {
        ...selectedProduct,
        taxPer: parseFloat(value) || 0,
      };
    }

    newProducts[index] = selectedProduct;

    const charges = recalculateCharges(newProducts, formData.taxPercent);

    setFormData((prev) => ({
      ...prev,
      products: newProducts,
      charges,
    }));
  };

  const handleServiceChange = (e) => {
    const selectedService = services.find(
      (s) => s.serviceName === e.target.value
    );
    const taxPercent = selectedService?.taxPercent || 0;
    const charges = recalculateCharges(formData.products, taxPercent);

    setFormData((prev) => ({
      ...prev,
      service: e.target.value,
      taxPercent,
      charges,
    }));
  };
  const handleAddProduct = () => {
    // Create a new product object
    const newProduct = {
      productName: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxPer: 0,
    };
    const updatedProducts = [...formData.products, newProduct];
    setFormData({
      ...formData,
      products: updatedProducts,
    });
  };

  const handleRemoveProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    const charges = recalculateCharges(newProducts, formData.taxPercent);
    setFormData((prev) => ({ ...prev, products: newProducts, charges }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customer") {
      if (value === "add_new") {
        setShowCustomerPopup(true);
        return;
      }

      const selectedCustomer = customers.find(
        (c) => `${c.firstName} ${c.lastName}` === value
      );

      setFormData((prev) => ({
        ...prev,
        customer: value,
        customerId: selectedCustomer?._id || "",
        customerPhone: selectedCustomer?.phone || "", // Add this line
        pickupAndDelivery: {
          ...prev.pickupAndDelivery,
          pickupAddress: selectedCustomer?.address || "",
          deliveryAddress: selectedCustomer?.address || "",
        },
      }));
    } else if (
      name === "pickupType" ||
      name === "deliveryType" ||
      name === "pickupDate" ||
      name === "expectedDeliveryDate"
    ) {
      setFormData((prev) => ({
        ...prev,
        pickupAndDelivery: {
          ...prev.pickupAndDelivery,
          [name]: value,
        },
      }));
    } else if (name === "pickupAddress" || name === "deliveryAddress") {
      setFormData((prev) => ({
        ...prev,
        pickupAndDelivery: {
          ...prev.pickupAndDelivery,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = id
      ? `https://dirt-off-backend-main.vercel.app/entry/update/${id}`
      : "https://dirt-off-backend-main.vercel.app/entry/create";
    const method = id ? "put" : "post";

    try {
      await axios[method](url, formData);
      toast.success(id ? "Entry updated!" : "Entry added!");
      navigate("/entrylist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {showCustomerPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              {/* <h2 className="text-xl font-semibold text-[#a997cb]">
                Add New Customer
              </h2> */}
              <button
                onClick={() => setShowCustomerPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ModalCustomer
              isPopup={true}
              onSubmitSuccess={handleAddCustomer}
              onCancel={() => setShowCustomerPopup(false)}
            />
          </div>
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/entrylist")}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-gradient-to-br from-purple-100 via-white to-purple-50 shadow p-6 rounded-lg space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-700">
          {id ? "Edit Entry Form" : "New Entry Form"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Customer Name *
            </label>
            <select
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Customer</option>
              <option value="add_new" className="font-bold text-theme-black ">
                ➕ Add New Customer
              </option>
              {customers.map((customer) => (
                <option
                  key={customer._id}
                  value={`${customer.firstName} ${customer.lastName}`}
                >
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Products</h3>
          {formData.products.map((product, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end mb-3"
            >
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Product *
                </label>
                <select
                  value={product.productName}
                  onChange={(e) =>
                    handleProductChange(index, "productName", e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((prod) => (
                    <option key={prod._id} value={prod.name}>
                      {prod.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Service *
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleServiceChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.serviceName}>
                      {service.serviceName}
                    </option>
                  ))}
                </select>
              </div> */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={product.quantity}
                  onChange={(e) =>
                    handleProductChange(index, "quantity", e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Unit Price
                </label>
                <input
                  type="number"
                  value={product.unitPrice}
                  onChange={(e) =>
                    handleProductChange(index, "unitPrice", e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={product.amount}
                  readOnly
                  className="w-full border px-2 py-1 rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tax %
                </label>
                <input
                  type="number"
                  value={product.taxPer || 0}
                  onChange={(e) => {
                    const newProducts = [...formData.products];
                    newProducts[index] = {
                      ...product,
                      taxPer: parseFloat(e.target.value) || 0,
                    };
                    const charges = recalculateCharges(newProducts);
                    setFormData((prev) => ({
                      ...prev,
                      products: newProducts,
                      charges,
                    }));
                  }}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddProduct}
            className="text-theme-purple text-sm font-medium mt-2 hover:text-theme-purple-dark transition"
          >
            + Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Subtotal</label>
            <input
              type="number"
              value={formData.charges.subtotal}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Tax Amount
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={formData.charges.taxAmount}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              value={formData.charges.totalAmount}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Pickup Type
            </label>
            <select
              name="pickupType"
              value={formData.pickupAndDelivery.pickupType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="Self">Self</option>
              <option value="Agent">Agent</option>
              <option value="Courier">Courier</option>
            </select>
            {(formData.pickupAndDelivery.pickupType === "Agent" ||
              formData.pickupAndDelivery.pickupType === "Courier") && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Pickup Address
                </label>
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAndDelivery.pickupAddress || ""}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter pickup address"
                />
              </div>
            )}
            {/* <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupAndDelivery.pickupDate || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div> */}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Delivery Type
            </label>
            <select
              name="deliveryType"
              value={formData.pickupAndDelivery.deliveryType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="Self">Self</option>
              <option value="Agent">Agent</option>
              <option value="Courier">Courier</option>
            </select>
            {(formData.pickupAndDelivery.deliveryType === "Agent" ||
              formData.pickupAndDelivery.deliveryType === "Courier") && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.pickupAndDelivery.deliveryAddress || ""}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter delivery address"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 w-[50%]">
          <label className="block text-sm text-gray-600 mb-1 ">
            Expected Delivery Date
          </label>
          <input
            type="date"
            name="expectedDeliveryDate"
            value={formData.pickupAndDelivery.expectedDeliveryDate || ""}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* <div>
            <select
              name="status"
              value={formData.status || "pending"}
              onChange={handleChange}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="collected">Collected</option>
            </select>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white transition
      ${
        loading
          ? "bg-theme-purple/60 cursor-not-allowed"
          : "bg-theme-purple hover:bg-theme-purple-dark cursor-pointer"
      }
      disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Saving..." : id ? "Update Entry" : "Add Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
