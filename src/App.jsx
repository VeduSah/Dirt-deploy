import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";

import Home from "./pages/Home";
import Login from "./pages/Login";
import LaundryBill from "./pages/LaudryBill/LaundryBill";
import CustomerForm1 from "./pages/CustomerForm";
import CustomerList1 from "./pages/CustomerList";
import InvoiceForm from "./pages/InvoiceForm";
import CustomerList from "./pages/customer/CustomerList";
import CustomerForm from "./pages/customer/CustomerForm";

import ProductList from "./pages/product/ProductList";
import ProductForm from "./pages/product/ProductForm";
// import ProductUpdate from "./pages/product/ProductUpdate"
import StaffList from "./pages/Staff/StaffList";
import StaffForm from "./pages/Staff/StaffForm";

import ServiceForm from "./pages/services/ServiceForm";
import ServiceList from "./pages/services/ServiceList";

import EntryForm from "./pages/New_entry/EntryForm";
import EntryList from "./pages/New_entry/EntryList";
import QrSection from "./pages/QrSection";
import Dashboard from "./pages/dashboard/Dashboard";
import CSV from "./pages/CSV";
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("dashboard");
  const currentUser = localStorage.getItem("currentUser");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const moduleAssigned = JSON.parse(localStorage.getItem("module"));

  const userRole = localStorage.getItem("userRole");
  console.log("Stored userRole in App:", userRole);
  console.log("userRole === 'admin':", userRole === "admin");
  const [forceRender, setForceRender] = useState(0);

  console.log("Current userRole:", userRole);
  console.log("Current path:", location.pathname);

  const [ml, setML] = useState(false);
  console.log(name);
  const handleLogout = async () => {
    try {
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  console.log(currentUser);

  useEffect(() => {
    const currentUserRole = localStorage.getItem("userRole");
    console.log(
      "useEffect - userRole:",
      currentUserRole,
      "path:",
      location.pathname
    );

    if (!currentUser && !location.pathname.includes("/LaundryBill")) {
      navigate("/login");
      // }
      // else if (currentUser && location.pathname === "/") {
      //   const userRole = localStorage.getItem("userRole");
      //   if (userRole === "admin") {
      //     navigate("/dashboard");
      //   } else {
      //     navigate("/entrylist");
      //   }
    }
  }, [currentUser, location.pathname]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path === "/" || path === "/dashboard") {
      setActiveLink("dashboard");
    } else if (path.includes("/entry")) {
      setActiveLink("New Entry");
    } else if (path.includes("/customer")) {
      setActiveLink("Customer");
    } else if (path.includes("/product")) {
      setActiveLink("Product");
    } else if (path.includes("/staff")) {
      setActiveLink("Staff");
    } else if (path.includes("/service")) {
      setActiveLink("Services");
    }
  }, [location.pathname]);

  useEffect(() => {
    setForceRender((prev) => prev + 1);
  }, [userRole]);

  const setMl = () => {
    if (window.innerWidth < 1023) {
      if (ml == false) {
        setML(true);
      } else {
        setML(false);
      }
    }
  };
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {currentUser ? (
        <section className="bg-gray-100 dark:bg-gray-900">
          <aside
            className={
              ml
                ? "fixed top-0 z-10 ml-[0] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%] dark:bg-gray-800 dark:border-gray-700"
                : "fixed top-0 z-10 ml-[-100%] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%] dark:bg-gray-800 dark:border-gray-700"
            }
          >
            {/* <div className="p-4">
              <p className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full capitalize font-medium">
                {userRole}
              </p>
            </div> */}

            <div className=" overflow-y-auto z-60 h-[90vh] overflow-x-hidden">
              <div className="-mx-6 z-60 px-6 py-4">
                {window.innerWidth < 1023 && (
                  <div className="flex items-center justify-between">
                    <h5
                      onClick={() => setMl()}
                      className="z-60 flex justify-end text-2xl font-medium text-gray-600 lg:block dark:text-white"
                    >
                      <AiFillCloseCircle />
                    </h5>

                    <button
                      onClick={handleLogout}
                      className="group flex items-center space-x-4 rounded-md px-4 py-5    text-black  "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="group-hover:text-gray-700 dark:group-hover:text-white">
                        Logout
                      </span>
                    </button>
                  </div>
                )}
                {/* <h2 className="font-semibold text-xl mt-3">DirtOff</h2> */}
              </div>
              <div className="mt-8 text-center">
                <img
                  src="/Dirt_off_1.png"
                  alt="admin"
                  className="m-auto h-20 w-[11rem] object-contain lg:h-28 lg:w-[11rem]"
                />

                <p className="mb-4 text-xs sm:text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block capitalize font-medium">
                  {userRole}
                </p>

                <h5 className="mt-4 hidden text-xl font-semibold text-gray-600 lg:block dark:text-gray-300">
                  {name}
                </h5>
                <span className="hidden text-gray-400 lg:block">{role}</span>
              </div>

              {userRole === "admin" && (
                <ul className="mt-4 space-y-2 tracking-wide">
                  <li
                    onClick={() => {
                      setActiveLink("dashboard");
                      navigate("/dashboard"); // Change this from "/Dashboard" to "/dashboard"
                      setMl();
                    }}
                  >
                    <a
                      href="#"
                      aria-label="dashboard"
                      className={
                        activeLink == "dashboard"
                          ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
                          : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                      }
                    >
                      <svg
                        className="-ml-1 h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                          className="fill-current text-[#6c5a87]"
                        ></path>
                        <path
                          d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                          className="fill-current text-[#9a7ec9]"
                        ></path>
                        <path
                          d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                          className="fill-current text-[#8f72bb]"
                        ></path>
                      </svg>
                      <span className="-mr-1 font-medium">Dashboard</span>
                    </a>
                  </li>
                </ul>
              )}

              {/* <ul className="mt-8 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("LaudryBill");
                    navigate("/LaundryBill");
                    setMl();
                  }}
                >
                  <a
                    href="LaundryBill"
                    aria-label="Bill"
                    className={
                      activeLink == "/LaundryBill"
                   ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
      : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                    }
                  >
               <svg
    className="-ml-1 h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
      className="fill-current text-[#6c5a87]"
    ></path>
    <path
      d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
      className="fill-current text-[#9a7ec9]"
    ></path>
    <path
      d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
      className="fill-current text-[#8f72bb]"
    ></path>
  </svg>
                    <span className="-mr-1 font-medium">Laundry</span>
                  </a>
                </li>
              </ul> */}
              {/* <ul className="mt-8 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("CustomerForm");
                    navigate("/CustomerForm");
                    setMl();
                  }}
                >
                  <a
                    href="/CustomerForm"
                    aria-label="CustomerForm"
                    className={
                      activeLink == "CustomerForm"
                        ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="dark:fill-slate-600 fill-current text-cyan-400"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-cyan-200 group-hover:text-cyan-300"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current group-hover:text-sky-300"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">CustomerForm</span>
                  </a>
                </li>
              </ul>  */}
              {/* <ul className="mt-8 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("CustomerList");
                    navigate("/CustomerList");
                    setMl();
                  }}
                >
                  <a
                    href="/CustomerList"
                    aria-label="CustomerList"
                    className={
                      activeLink == "CustomerList"
                        ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="dark:fill-slate-600 fill-current text-cyan-400"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-cyan-200 group-hover:text-cyan-300"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current group-hover:text-sky-300"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">CustomerList</span>
                  </a>
                </li>
              </ul> */}
              {/* <ul className="mt-8 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("InvoiceForm");
                    navigate("/InvoiceForm");
                    setMl();
                  }}
                >
                  <a
                    href="/InvoiceForm"
                    aria-label="InvoiceForm"
                    className={
                      activeLink == "CustomerList"
                        ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="dark:fill-slate-600 fill-current text-cyan-400"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-cyan-200 group-hover:text-cyan-300"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current group-hover:text-sky-300"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">InvoiceForm</span>
                  </a>
                </li>
              </ul> */}
              <ul className="mt-4 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("New Entry");
                    navigate("/entrylist");
                    setMl();
                  }}
                >
                  <a
                    href="#"
                    aria-label="New Entry"
                    className={
                      activeLink === "New Entry"
                        ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#6c5a87]"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-[#9a7ec9]"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#8f72bb]"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">New Entry</span>
                  </a>
                </li>
              </ul>
              <ul className="mt-4 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("Customer");
                    navigate("/customerlist");
                    setMl();
                  }}
                >
                  <a
                    href="#"
                    aria-label="Customer"
                    className={
                      activeLink == "Customer"
                        ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#6c5a87]"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-[#9a7ec9]"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#8f72bb]"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">Customer</span>
                  </a>
                </li>
              </ul>
              <ul className="mt-4 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("Product");
                    navigate("/productlist");
                    setMl();
                  }}
                >
                  <a
                    href="#"
                    aria-label="Product"
                    className={
                      activeLink == "Product"
                        ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#6c5a87]"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-[#9a7ec9]"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#8f72bb]"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">Products</span>
                  </a>
                </li>
              </ul>
              {userRole === "admin" && (
                <ul className="mt-4 space-y-2 tracking-wide">
                  <li
                    onClick={() => {
                      setActiveLink("Staff");
                      navigate("/stafflist");
                      setMl();
                    }}
                  >
                    <a
                      href="#"
                      aria-label="Staff"
                      className={
                        activeLink == "Staff"
                          ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
                          : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                      }
                    >
                      <svg
                        className="-ml-1 h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                          className="fill-current text-[#6c5a87]"
                        ></path>
                        <path
                          d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                          className="fill-current text-[#9a7ec9]"
                        ></path>
                        <path
                          d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                          className="fill-current text-[#8f72bb]"
                        ></path>
                      </svg>
                      <span className="-mr-1 font-medium">Staff</span>
                    </a>
                  </li>
                </ul>
              )}

              {/* <ul className="mt-4 space-y-2 tracking-wide">
                <li
                  onClick={() => {
                    setActiveLink("Services");
                    navigate("/servicelist");
                    setMl();
                  }}
                >
                  <a
                    href="#"
                    aria-label="Services"
                    className={
                      activeLink == "Services"
                        ? "relative flex items-center space-x-4 rounded-xl bg-[#a997cb] px-1 py-2 text-black"
                        : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600 hover:bg-[#e1d9f7]"
                    }
                  >
                    <svg
                      className="-ml-1 h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#6c5a87]"
                      ></path>
                      <path
                        d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                        className="fill-current text-[#9a7ec9]"
                      ></path>
                      <path
                        d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                        className="fill-current text-[#8f72bb]"
                      ></path>
                    </svg>
                    <span className="-mr-1 font-medium">Services</span>
                  </a>
                </li>
              </ul> */}
            </div>

            <div className="-mx-6 md:flex hidden items-center justify-between border-t px-6 pt-4 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="group flex items-center space-x-4 rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="group-hover:text-gray-700 dark:group-hover:text-white">
                  Logout
                </span>
              </button>
            </div>
          </aside>
          <div className="ml-auto mb-6 lg:w-[75%] xl:w-[80%] 2xl:w-[85%]">
            <div
              className={
                window.innerWidth < 768
                  ? " sticky md:z-50 top-0 h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 lg:py-2.5"
                  : "sticky  md:z-50 top-0 h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 lg:py-2.5"
              }
            >
              <div className="flex items-center justify-between space-x-4 px-4 2xl:container h-full">
                <h5
                  hidden
                  className="text-2xl font-medium text-gray-600 lg:block dark:text-white"
                >
                  {activeLink.toLocaleUpperCase()}
                </h5>
                <h5
                  onClick={() => setMl()}
                  className="text-2xl lg:hidden font-medium text-gray-600  dark:text-white"
                >
                  <AiOutlineMenu />
                </h5>
                <div className="p-4 lg:hidden">
                  <p className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full capitalize font-medium">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pt-6 bg-white">
              <Routes>
                <Route
                  path="/"
                  element={
                    userRole === "admin" ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/entrylist" replace />
                    )
                  }
                />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/LaundryBill" element={<LaundryBill />} />
                <Route path="/LaundryBill/:id" element={<LaundryBill />} />
                <Route path="/CustomerForm" element={<CustomerForm />} />
                <Route path="/CustomerList1" element={<CustomerList1 />} />
                <Route path="/invoice/:customerId" element={<InvoiceForm />} />
                <Route path="/InvoiceForm" element={<InvoiceForm />} />
                <Route path="/customerlist" element={<CustomerList />} />
                <Route path="/customerform" element={<CustomerForm />} />
                <Route path="/customerform/:id" element={<CustomerForm />} />

                <Route path="/productlist" element={<ProductList />} />
                <Route path="/productform" element={<ProductForm />} />
                <Route path="/productform/:id" element={<ProductForm />} />

                <Route path="/stafflist" element={<StaffList />} />
                <Route path="/staffform" element={<StaffForm />} />
                <Route path="/staffform/:id" element={<StaffForm />} />

                <Route path="/servicelist" element={<ServiceList />} />
                <Route path="/serviceform" element={<ServiceForm />} />
                <Route path="/serviceform/:id" element={<ServiceForm />} />

                <Route path="/entrylist" element={<EntryList />} />
                <Route path="/entryform" element={<EntryForm />} />
                <Route path="/entryform/:id" element={<EntryForm />} />
                <Route path="/qr-tags/:id" element={<QrSection />} />
              </Routes>
            </div>
          </div>
        </section>
      ) : (
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/LaundryBill" element={<LaundryBill />} />
            <Route path="/LaundryBill/:id" element={<LaundryBill />} />
          </Routes>
        </>
      )}
    </>
  );
};

export default App;
