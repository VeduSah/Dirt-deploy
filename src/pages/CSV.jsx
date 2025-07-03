import React from "react";
import axios from "axios";

const CSV = ({ type }) => {
  const CONFIG = {
    entries: {
      apiUrl: "https://dirt-off-backend-main.vercel.app/entry",
      filename: "entries",
      headers: [
        "Receipt No",
        "Customer",
        "Products",
        "Total Amount",
        "Pickup",
        "Delivery",
        "Status",
        "Date",
      ],
    },
    customers: {
      apiUrl: "https://dirt-off-backend-main.vercel.app/custdirt",
      filename: "customers",
      headers: [
        "First Name",
        "Last Name",
        "Phone",
        "Email",
        "Address",
        "Postal Code",
      ],
    },
    products: {
      apiUrl: "https://dirt-off-backend-main.vercel.app/product",
      filename: "products",
      headers: ["Product Name", "Charge", "Tax"],
    },
    staff: {
      apiUrl: "https://dirt-off-backend-main.vercel.app/staff",
      filename: "staff",
      headers: [
        "First Name",
        "Last Name",
        "Phone",
        "Email",
        "Password",
        "Address",
      ],
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return `'${dateString.substring(0, 10)}`; // Add single quote prefix
  };

  const formatData = (data, type) => {
    switch (type) {
      case "entries":
        return data.map((entry) => [
          entry.receiptNo || "N/A",
          entry.customer,
          entry.products.map((p) => p.productName).join("; "),
          entry.charges?.totalAmount?.toFixed(2) || "0",
          entry.pickupAndDelivery?.pickupType === "Self"
            ? "Self"
            : entry.pickupAndDelivery?.pickupAddress ||
              entry.pickupAndDelivery?.pickupType ||
              "",
          entry.pickupAndDelivery?.deliveryType === "Self"
            ? "Self"
            : entry.pickupAndDelivery?.deliveryAddress ||
              entry.pickupAndDelivery?.deliveryType ||
              "",
          entry.status || "pending",
          formatDate(entry.createdAt),
        ]);

      case "customers":
        return data.map((cust) => [
          cust.firstName,
          cust.lastName,
          `'${cust.phone}`,
          cust.email,
          cust.address,
          cust.postalCode,
        ]);

      case "products":
        return data.map((prod) => [
          prod.name,
          prod.ServiceCharge.map((sc) => `Rs${sc.charge}`).join(", "),
          `${prod.tax || 0}%`,
        ]);

      case "staff":
        return data.map((staff) => [
          staff.firstName,
          staff.lastName,
          `'${staff.phone}`,
          staff.email,
          staff.password,
          staff.address,
        ]);

      default:
        return [];
    }
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    const config = CONFIG[type];
    if (!config) return;

    try {
      const res = await axios.get(config.apiUrl);
      const data = res.data.data || [];
      const csvData = formatData(data, type);
      const csvContent = [config.headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      downloadCSV(csvContent, config.filename);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <button
      onClick={exportToCSV}
      className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition w-full sm:w-auto text-center"
    >
      Export CSV
    </button>
  );
};

export default CSV;
