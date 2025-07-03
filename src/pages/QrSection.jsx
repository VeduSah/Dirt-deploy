// In QrSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "/src/assets/pcs.png";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import Loader from "/src/pages/Loader";

const QrSection = () => {
  const { id } = useParams(); // Get the entry ID from URL
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const invoiceUrl = entry
    ? `${window.location.origin}/LaundryBill/${entry._id}`
    : "";
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;

      try {
        const res = await axios.get(
          `https://dirt-off-backend-main.vercel.app/entry/${id}`
        );
        console.log("Entry data:", res.data.data);
        console.log("Products:", res.data.data.products);
        setEntry(res.data.data);
      } catch (err) {
        console.error("Failed to fetch entry data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const today = new Date().toLocaleDateString();

  if (loading)
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    );
  if (!entry) return <div>Entry not found</div>;

  // Create an array of tags based on product quantities
  const tags = [];
  entry.products.forEach((product) => {
    for (let i = 0; i < product.quantity; i++) {
      tags.push({
        ...product,
        index: i,
        totalQuantity: product.quantity,
      });
    }
  });

  return (
    <div>
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
      <div className="container mx-auto p-4 w-[300px]" ref={printRef}>
        {/* <h1 className="text-2xl font-bold mb-4 text-[#a997cb]">Item Tags</h1> */}
        <div className="grid grid-cols-1 gap-4">
          {tags.map((tag, tagIndex) => (
            <div
              key={tagIndex}
              className="flex flex-col items-center p-4 border-b border-gray-200 rounded-lg"
            >
              {/* Logo */}
              <img src={logo} alt="DirtOff Logo" className="h-10 mb-3" />

              {/* Details */}
              <div className="text-center w-full">
                <p className="font-bold text-lg">{entry.receiptNo || "N/A"}</p>
                <p className="text-gray-700 text-xl">{entry.customer}</p>
                <div className="flex items-center justify-center gap-2 px-2">
                  <p className="text-gray-800 font-medium">{tag.productName}</p>
                  <p className="text-gray-600 text-2xl">
                    {(entry.service || "")
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()}
                  </p>
                  {/* Always show the count */}
                  <p className="text-2xl text-black inline-block">
                    {tag.index + 1}/{tag.totalQuantity}
                  </p>
                </div>

                {/* Date */}
                {/* Date and QR Code in one section */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-gray-500 text-sm">{today}</p>
                  <QRCodeSVG value={invoiceUrl} size={80} level="M" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QrSection;
