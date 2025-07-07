import React, { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "/src/pages/Loader";
import { useParams, useNavigate } from "react-router-dom";

const LaundryBill = () => {
  const { id } = useParams();
  const printRef = useRef();
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const res = await axios.get(
          `https://dirt-off-backend-main.vercel.app/entry/${id}`
        );
        const entry = res.data.data;
        setBillData(entry);

        // Now fetch customer details by customerId
        if (entry.customerId) {
          const customerRes = await axios.get(
            `https://dirt-off-backend-main.vercel.app/custdirt/${entry.customerId}`
          );
          setCustomerInfo(customerRes.data.data);
        }
      } catch (error) {
        toast.error("Failed to load bill data");
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 1mm;
      }
      @media print {
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #print-root {
          width: 100%;
          max-width: 170mm;
          margin: auto;
          box-sizing: border-box;
          page-break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  if (loading)
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    );
  if (!billData)
    return (
      <p className="text-center mt-10 text-red-600">No bill data available.</p>
    );

  const {
    customer,
    service,
    products,
    charges,
    pickupAndDelivery,
    createdAt,
    receiptNo, // Use the receiptNo from the bill data
  } = billData;
  console.log("sabdj" + billData.receiptNo);
  // Dummy placeholders
  const logoUrl = "/Dirt_off_1.png";
  const partyDetails = {
    address:
      "LIG 450 A, SIDDHARTH NAGAR, Taramandal Road, Siddharth Enclave Sub Post Office,  SIDDHARTH ENCLAVE, Gorakhpur, Gorakhpur, Uttar Pradesh, 273017",
    name: "DIRTOFF",
    phone: "7311196660",
    email: "team.dirtoff@gmail.com",
    gstin: " 09AAYFD0845J1ZV",
  };

  const dateOfCollecting = new Date(createdAt).toLocaleDateString();
  const dateOfDelivering = new Date().toLocaleDateString();
  const terms = "No refund after payment.";

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrint}
          className="bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          Print Invoice
        </button>

        <button
          onClick={() => navigate("/entrylist")}
          className="bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition"
        >
          ← Back
        </button>
      </div>

      <div ref={printRef} className="w-full" id="print-root">
        {/* Tax Invoice on Top */}
        <div className="flex justify-center mb-2">
          <p className="text-xl font-semibold">Tax Invoice</p>
        </div>

        {/* Smaller Logo */}
        <img src={logoUrl} className="h-16 mb-4" alt="Logo" />

        <p className="text-sm text-gray-600 mb-1 leading-relaxed">
          <span className="font-semibold">Billing Address: </span>
          {partyDetails.address}
        </p>

        <p className="text-sm text-gray-600 mb-1 leading-relaxed">
          <span className="font-semibold">Name: </span>
          {partyDetails.name}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <spam className="font-semibold">Phone No.: </spam>{" "}
          {partyDetails.phone}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <spam className="font-semibold">Email ID: </spam>
          {partyDetails.email}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <spam className="font-semibold"> GSTIN No.: </spam>{" "}
          {partyDetails.gstin}
        </p>

        <hr className="border-2 border-gray-300 mb-6" />

        <div className="flex flex-col md:flex-row md:justify-between text-sm mb-6 space-y-4 md:space-y-0">
          <div>
            <p>
              <span className="font-semibold">Customer Details:</span>
            </p>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {customerInfo.firstName} {customerInfo.lastName}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {customerInfo?.address || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Phone No.:</span>{" "}
              {customerInfo?.phone || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Email ID:</span>{" "}
              {customerInfo?.email || "N/A"}
            </p>
          </div>
          <div className="md:text-right">
            <p>
              <span className="font-semibold">Receipt No.:</span>{" "}
              {billData.receiptNo}
            </p>
            <p>
              <span className="font-semibold">Date of Collecting:</span>{" "}
              {dateOfCollecting}
            </p>
            <p>
              <span className="font-semibold">Date of Delivering:</span>{" "}
              {dateOfDelivering}
            </p>
          </div>
        </div>

        <hr className="border-2 border-gray-300 mb-6" />

        <h2
          className="text-center mb-5 p-3 text-lg font-bold text-white"
          style={{ backgroundColor: "#a997cb" }}
        >
          {"Laundry / Dry Cleaning"}
        </h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full table-auto border border-collapse text-sm min-w-[500px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="border px-2 py-2 text-left">S.No.</th>
                <th className="border px-2 py-2 text-left">Description</th>
                <th className="border px-2 py-2 text-left">Qty</th>
                <th className="border px-2 py-2 text-left">Price/Unit</th>
                <th className="border px-2 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{item.productName}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                  <td className="border px-2 py-1">₹{item.unitPrice}</td>
                  <td className="border px-2 py-1">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm space-y-1 mb-6 flex justify-between">
          <div>
            <p>
              <span className="font-semibold">Pickup Type:</span>{" "}
              {pickupAndDelivery.pickupType}
            </p>
            <p>
              <span className="font-semibold">Delivery Type:</span>{" "}
              {pickupAndDelivery.deliveryType}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Sub Total:</span> ₹
              {charges.subtotal}
            </p>
            <p>
              <span className="font-semibold">Tax Amount:</span> ₹
              {charges.taxAmount}
            </p>
            <p className="text-xl font-bold">
              Total Amount: ₹{charges.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="pt-4 text-sm flex justify-between">
          <p>
            <span className="font-semibold">Terms & Condition:</span> {terms}
          </p>

          <p className="m-10 font-semibold">Seal & Signature</p>
        </div>

        <div className="  text-sm text-gray-600">
          <p>
            <span className="font-semibold">Bank Name:</span> State Bank of
            India (SBI)
          </p>
          <p>
            <span className="font-semibold">Account No:</span> 44217282471
          </p>
          <p>
            <span className="font-semibold">IFSC Code:</span> SBIN0016724
          </p>
          <p>
            <span className="font-semibold">Bank Type:</span> Public Sector Bank
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaundryBill;
