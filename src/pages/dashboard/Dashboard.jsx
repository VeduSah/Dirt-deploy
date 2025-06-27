// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaTruck,
  FaClock,
  FaChartLine,
  FaTshirt,
  FaWater,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import LoadingOverlay from "../../components/LoadingOverlay";

const Dashboard = () => {
  const [stats, setStats] = useState({
    newOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    todayExpected: 0,
    collectedOrders: 0,
  });

  const [loading, setLoading] = useState(true);

  const [apiData, setApiData] = useState({
    yearlySales: [],
    monthlySales: [],
    weeklyData: [],
  });

  const [deliveryData, setDeliveryData] = useState({
    pending: { orders: [], page: 1, totalPages: 1 },
    collected: { orders: [], page: 1, totalPages: 1 },
    delivered: { orders: [], page: 1, totalPages: 1 },
    todayExpectedDeliveries: { orders: [], page: 1, totalPages: 1 },
    todayReceivedOrders: { orders: [], page: 1, totalPages: 1 },
  });

  const [currentPages, setCurrentPages] = useState({
    pending: 1,
    collected: 1,
    delivered: 1,
    todayExpected: 1,
    todayReceived: 1,
  });

  const [activeView, setActiveView] = useState("sales");
  const [markLoading, setMarkLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Fetch sales stats
  useEffect(() => {
    const fetchSalesStats = async () => {
      try {
        const salesResponse = await axios.get(
          "https://dirt-off-backend-main.vercel.app/entry/stats/recent"
        );
        const salesData = salesResponse.data.data;

        const totalSalesCalculated = salesData.yearlySales.reduce(
          (acc, year) => acc + year.totalSales,
          0
        );

        setApiData({
          yearlySales: salesData.yearlySales,
          monthlySales: salesData.monthlySales,
          weeklyData: salesData.weeklyData,
        });

        setStats((prev) => ({ ...prev, totalSales: totalSalesCalculated }));
      } catch (error) {
        console.error("Error fetching sales stats:", error);
      }
    };

    fetchSalesStats();
  }, []);

  const fetchDeliverySummary = async () => {
    try {
      const summaryResponse = await axios.get(
        "https://dirt-off-backend-main.vercel.app/entry/stats"
      );
      const data = summaryResponse.data.data;

      setStats((prev) => ({
        ...prev,
        newOrders: data.todayReceivedCount || 0,
        todayExpected: data.todayExpectedCount || 0,
        pendingOrders: data.pendingCount || 0,
        collectedOrders: data.collectedCount || 0,
        deliveredOrders: data.deliveredCount || 0,
      }));
    } catch (error) {
      console.error("Error fetching delivery summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery summary
  useEffect(() => {
    fetchDeliverySummary();
  }, []);

  // Fetch detailed delivery data
  // useEffect(() => {
  //   const fetchDetailedDeliveryData = async () => {
  //     const types = [
  //       "pending",
  //       "collected",
  //       "delivered",
  //       "todayExpected",
  //       "todayReceived",
  //     ];

  //     types.forEach(async (type) => {
  //       try {
  //         const res = await axios.get(
  //           `https://dirt-off-backend-main.vercel.app/entry/pending/deliveries?type=${type}&page=1`
  //         );
  //         const key =
  //           type === "todayReceived"
  //             ? "todayReceivedOrders"
  //             : type === "todayExpected"
  //             ? "todayExpectedDeliveries"
  //             : type;
  //         setDeliveryData((prev) => ({ ...prev, [key]: res.data.data }));
  //       } catch (error) {
  //         console.error(`${type} background fetch failed:`, error);
  //       }
  //     });
  //   };

  //   fetchDetailedDeliveryData();
  // }, []);

  // Add this function after the existing functions
  const handleCardClick = async (viewType) => {
    setActiveView(viewType);
    setListLoading(true);
    const typeMap = {
      newOrders: "todayReceived",
      todayExpected: "todayExpected",
      pending: "pending",
      collected: "collected",
      delivered: "delivered",
    };

    const apiType = typeMap[viewType];
    if (apiType) {
      try {
        const data = await fetchDetailedData(apiType, 1);
        const key =
          apiType === "todayReceived"
            ? "todayReceivedOrders"
            : apiType === "todayExpected"
            ? "todayExpectedDeliveries"
            : apiType;
        setDeliveryData((prev) => ({ ...prev, [key]: data }));
        setCurrentPages((prev) => ({ ...prev, [apiType]: 1 }));
      } catch (error) {
        console.error(`Failed to fetch ${viewType} data:`, error);
      } finally {
        setListLoading(false);
      }
    }
  };

  // Add skeleton component
  const ListSkeleton = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 animate-pulse"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-6 bg-gray-300 rounded-full w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    ));

  const fetchDetailedData = async (type, page = 1) => {
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/entry/pending/deliveries?type=${type}&page=${page}`
      );
      return res.data.data;
    } catch (error) {
      console.error(`${type} API failed:`, error);
      return { orders: [], page: 1, totalPages: 1 };
    }
  };

  const handlePageChange = async (type, newPage) => {
    const data = await fetchDetailedData(type, newPage);
    const key =
      type === "todayReceived"
        ? "todayReceivedOrders"
        : type === "todayExpected"
        ? "todayExpectedDeliveries"
        : type;
    setDeliveryData((prev) => ({ ...prev, [key]: data }));
    setCurrentPages((prev) => ({ ...prev, [type]: newPage }));
  };

  // Add this function after the existing functions
  const handleMarkAsCollected = async (orderId) => {
    setMarkLoading(true);
    try {
      await axios.put(
        `https://dirt-off-backend-main.vercel.app/entry/update/${orderId}`,
        {
          status: "delivered",
        }
      );

      // Refresh the collected data if currently viewing collected orders
      if (activeView === "collected") {
        const collectedRes = await axios.get(
          `https://dirt-off-backend-main.vercel.app/entry/pending/deliveries?type=collected&page=${currentPages.collected}`
        );
        setDeliveryData((prev) => ({
          ...prev,
          collected: collectedRes.data.data,
        }));
      }
      // Refresh delivery summary
      await fetchDeliverySummary();

      // Update stats
      // setStats((prev) => ({
      //   ...prev,
      //   todayExpected: prev.todayExpected - 1,
      //   collectedOrders: prev.collectedOrders + 1,
      // }));
    } catch (error) {
      console.error("Failed to mark as collected:", error);
    } finally {
      setMarkLoading(false);
    }
  };

  // Add this function after handleMarkAsCollected
  const handleMarkPendingAsCollected = async (orderId) => {
    setMarkLoading(true);
    try {
      await axios.put(
        `https://dirt-off-backend-main.vercel.app/entry/update/${orderId}`,
        {
          status: "collected",
        }
      );

      // Refresh the pending data
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/entry/pending/deliveries?type=pending&page=${currentPages.pending}`
      );
      setDeliveryData((prev) => ({
        ...prev,
        pending: res.data.data,
      }));

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingOrders: prev.pendingOrders - 1,
        collectedOrders: prev.collectedOrders + 1,
      }));
    } catch (error) {
      console.error("Failed to mark as collected:", error);
    } finally {
      setMarkLoading(false);
    }
  };

  // Process data for charts
  const processWeeklyData = () => {
    return apiData.weeklyData.map((item) => item.totalSales);
  };

  const processMonthlyData = () => {
    const monthlyArray = new Array(12).fill(0);
    apiData.monthlySales.forEach((item) => {
      monthlyArray[item.month - 1] = item.totalSales;
    });
    return monthlyArray;
  };

  const processYearlyData = () => {
    return apiData.yearlySales.map((item) => ({
      year: item.year.toString(),
      sales: item.totalSales,
      color:
        item.year === 2025
          ? "#a997cb"
          : item.year === 2024
          ? "#8b5cf6"
          : "#7c3aed",
    }));
  };
  const weeklyChartData = processWeeklyData();
  const monthlyChartData = processMonthlyData();
  const yearlyChartData = processYearlyData();
  const maxWeeklySales = Math.max(...weeklyChartData, 1);
  const maxMonthlySales = Math.max(...monthlyChartData, 1);

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case "newOrders":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaShoppingCart className="text-purple-500" />
                New Orders
              </h3>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {deliveryData.todayReceivedOrders.count || 0} orders
              </span>
            </div>
            <div className="space-y-4">
              {listLoading ? (
                <ListSkeleton />
              ) : deliveryData.todayReceivedOrders.orders?.length > 0 ? (
                deliveryData.todayReceivedOrders.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-400 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold text-lg">
                          {(order.customer || "C").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {order.customer || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Receipt #{order.receiptNo}
                        </p>
                        <p className="text-xs text-purple-600 font-medium">
                          ₹{order.charges?.totalAmount || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        New
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaShoppingCart className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No new orders today</p>
                </div>
              )}
            </div>
            {deliveryData.todayReceivedOrders.totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() =>
                    handlePageChange(
                      "todayReceived",
                      currentPages.todayReceived - 1
                    )
                  }
                  disabled={currentPages.todayReceived === 1}
                  className="px-3 py-1 bg-purple-100 text-purple-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  {currentPages.todayReceived} of{" "}
                  {deliveryData.todayReceivedOrders.totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChange(
                      "todayReceived",
                      currentPages.todayReceived + 1
                    )
                  }
                  disabled={
                    currentPages.todayReceived ===
                    deliveryData.todayReceivedOrders.totalPages
                  }
                  className="px-3 py-1 bg-purple-100 text-purple-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      case "todayExpected":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                Today's Expected Deliveries
              </h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {deliveryData.todayExpectedDeliveries.orders?.length || 0}{" "}
                orders
              </span>
            </div>
            <div className="space-y-4">
              {deliveryData.todayExpectedDeliveries.orders?.length > 0 ? (
                deliveryData.todayExpectedDeliveries.orders.map(
                  (order, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-400 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-lg">
                            {(order.customer || "C").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {order.customer || "Customer"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Receipt #{order.receiptNo}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            Expected Today
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkPendingAsCollected(order._id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Mark Delivered
                      </button>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8">
                  <FaClock className="text-purple-500 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">
                    No deliveries expected for today
                  </p>
                </div>
              )}
            </div>
            {deliveryData.todayExpectedDeliveries.totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() =>
                    handlePageChange(
                      "todayExpected",
                      currentPages.todayExpected - 1
                    )
                  }
                  disabled={currentPages.todayExpected === 1}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  {currentPages.todayExpected} of{" "}
                  {deliveryData.todayExpectedDeliveries.totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChange(
                      "todayExpected",
                      currentPages.todayExpected + 1
                    )
                  }
                  disabled={
                    currentPages.todayExpected ===
                    deliveryData.todayExpectedDeliveries.totalPages
                  }
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      case "delivered":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaTruck className="text-green-500" />
                Delivered Orders
              </h3>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {deliveryData.delivered.count || 0} orders
              </span>
            </div>
            <div className="space-y-4">
              {listLoading ? (
                <ListSkeleton />
              ) : deliveryData.delivered.orders?.length > 0 ? (
                deliveryData.delivered.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center  px-4 py-2  bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-400 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-lg">
                          {(order.customer || "C").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {order.customer || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Receipt #{order.receiptNo}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          ₹{order.charges?.totalAmount || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm bg-green-600 text-white px-3 py-1 rounded-full">
                        Delivered
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaTruck className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No delivered orders</p>
                </div>
              )}
            </div>
            {deliveryData.delivered.totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() =>
                    handlePageChange("delivered", currentPages.delivered - 1)
                  }
                  disabled={currentPages.delivered === 1}
                  className="px-3 py-1 bg-green-100 text-green-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  {currentPages.delivered} of{" "}
                  {deliveryData.delivered.totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChange("delivered", currentPages.delivered + 1)
                  }
                  disabled={
                    currentPages.delivered === deliveryData.delivered.totalPages
                  }
                  className="px-3 py-1 bg-green-100 text-green-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      case "pending":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaSpinner className="text-yellow-500" />
                Pending Orders
              </h3>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                {deliveryData.pending.count || 0} orders
              </span>
            </div>
            <div className="space-y-4">
              {listLoading ? (
                <ListSkeleton />
              ) : deliveryData.pending.orders?.length > 0 ? (
                deliveryData.pending.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-400 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                        <span className="text-yellow-700 font-bold text-lg">
                          {(order.customer || "C").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {order.customer || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Receipt #{order.receiptNo}
                        </p>
                        <p className="text-xs text-yellow-500 font-medium">
                          In Progress
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkPendingAsCollected(order._id)}
                      className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                    >
                      Mark Collected
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaSpinner className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No pending orders</p>
                </div>
              )}
            </div>
            {deliveryData.pending.totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() =>
                    handlePageChange("pending", currentPages.pending - 1)
                  }
                  disabled={currentPages.pending === 1}
                  className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  {currentPages.pending} of {deliveryData.pending.totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChange("pending", currentPages.pending + 1)
                  }
                  disabled={
                    currentPages.pending === deliveryData.pending.totalPages
                  }
                  className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      case "collected":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaTshirt className="text-orange-500" />
                Collected Orders
              </h3>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                {deliveryData.collected.count || 0} orders
              </span>
            </div>
            <div className="space-y-4">
              {listLoading ? (
                <ListSkeleton />
              ) : deliveryData.collected.orders?.length > 0 ? (
                deliveryData.collected.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center  px-4 py-2  bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-400 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                        <span className="text-orange-700 font-bold text-lg">
                          {(order.customer || "C").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {order.customer || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Receipt #{order.receiptNo}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">
                          {order.pickupAndDelivery?.pickupDate
                            ? new Date(
                                order.pickupAndDelivery.pickupDate
                              ).toLocaleDateString()
                            : "Ready for delivery"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsCollected(order._id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Mark Delivered
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaTshirt className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No orders collected yet
                  </p>
                </div>
              )}
            </div>
            {deliveryData.collected.totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() =>
                    handlePageChange("collected", currentPages.collected - 1)
                  }
                  disabled={currentPages.collected === 1}
                  className="px-3 py-1 bg-orange-100 text-orange-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  {currentPages.collected} of{" "}
                  {deliveryData.collected.totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChange("collected", currentPages.collected + 1)
                  }
                  disabled={
                    currentPages.collected === deliveryData.collected.totalPages
                  }
                  className="px-3 py-1 bg-orange-100 text-orange-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      default: // sales
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Sales Analytics
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Sales Graph */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Weekly Sales
                </h4>
                <div className="h-64 bg-purple-50 rounded-lg p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="280"
                        y2={40 + i * 30}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Y-axis labels */}
                    {(() => {
                      const weeklyChartData = processWeeklyData();
                      const maxWeeklySales = Math.max(...weeklyChartData, 1);
                      const maxLabel = Math.ceil(maxWeeklySales / 100) * 100;
                      return [
                        maxLabel,
                        maxLabel * 0.8,
                        maxLabel * 0.6,
                        maxLabel * 0.4,
                        maxLabel * 0.2,
                        0,
                      ].map((val, i) => (
                        <text
                          key={i}
                          x="30"
                          y={45 + i * 25}
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      ));
                    })()}

                    {/* Line graph */}
                    {(() => {
                      const weeklyChartData = processWeeklyData();
                      const maxWeeklySales = Math.max(...weeklyChartData, 1);
                      return (
                        <polyline
                          fill="none"
                          stroke="url(#weeklyGradient)"
                          strokeWidth="3"
                          points={weeklyChartData
                            .map(
                              (val, i) =>
                                `${60 + i * 30},${
                                  170 - (val / maxWeeklySales) * 120
                                }`
                            )
                            .join(" ")}
                        />
                      );
                    })()}

                    {/* Data points */}
                    {(() => {
                      const weeklyChartData = processWeeklyData();
                      const maxWeeklySales = Math.max(...weeklyChartData, 1);
                      return weeklyChartData.map((val, i) => (
                        <circle
                          key={i}
                          cx={60 + i * 30}
                          cy={170 - (val / maxWeeklySales) * 120}
                          r="4"
                          fill="#a997cb"
                        />
                      ));
                    })()}

                    {/* X-axis labels */}
                    {apiData.weeklyData.map((item, i) => (
                      <text
                        key={i}
                        x={60 + i * 30}
                        y="190"
                        fontSize="8"
                        fill="#6b7280"
                        textAnchor="middle"
                      >
                        {new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </text>
                    ))}

                    <defs>
                      <linearGradient
                        id="weeklyGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#a997cb" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Monthly Sales Graph */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Monthly Sales 2025
                </h4>
                <div className="h-64 bg-purple-50 rounded-lg p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="280"
                        y2={40 + i * 30}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Y-axis labels */}
                    {(() => {
                      const maxLabel = Math.ceil(maxMonthlySales / 500) * 500;
                      return [
                        maxLabel,
                        maxLabel * 0.8,
                        maxLabel * 0.6,
                        maxLabel * 0.4,
                        maxLabel * 0.2,
                        0,
                      ].map((val, i) => (
                        <text
                          key={i}
                          x="30"
                          y={50 + i * 25}
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      ));
                    })()}

                    {/* Bar chart for monthly data */}
                    {monthlyChartData.map((val, i) => {
                      const barHeight = (val / maxMonthlySales) * 120;
                      return (
                        <rect
                          key={i}
                          x={50 + i * 18}
                          y={170 - barHeight}
                          width="15"
                          height={barHeight}
                          fill={`url(#monthlyGradient${i})`}
                          rx="2"
                        />
                      );
                    })}
                    {/* Month labels */}
                    {[
                      "J",
                      "F",
                      "M",
                      "A",
                      "M",
                      "J",
                      "J",
                      "A",
                      "S",
                      "O",
                      "N",
                      "D",
                    ].map((month, i) => (
                      <text
                        key={i}
                        x={57 + i * 18}
                        y="190"
                        fontSize="8"
                        fill="#6b7280"
                        textAnchor="middle"
                      >
                        {month}
                      </text>
                    ))}

                    <defs>
                      {monthlyChartData.map((_, i) => (
                        <linearGradient
                          key={i}
                          id={`monthlyGradient${i}`}
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#a997cb" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      ))}
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Yearly Sales Graph */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Yearly Performance
                </h4>
                <div className="h-64 bg-purple-50 rounded-lg p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="280"
                        y2={40 + i * 30}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Pie chart for yearly data */}
                    <g transform="translate(150, 100)">
                      {yearlyChartData.map((data, i) => {
                        const totalSales = yearlyChartData.reduce(
                          (acc, item) => acc + item.sales,
                          0
                        );
                        const radius = 60;
                        const angle = (data.sales / totalSales) * 360;

                        // Calculate cumulative angle for this slice
                        let cumulativeAngle = 0;
                        for (let j = 0; j < i; j++) {
                          cumulativeAngle +=
                            (yearlyChartData[j].sales / totalSales) * 360;
                        }

                        const startAngle = cumulativeAngle * (Math.PI / 180);
                        const endAngle =
                          (cumulativeAngle + angle) * (Math.PI / 180);

                        const x1 = Math.cos(startAngle) * radius;
                        const y1 = Math.sin(startAngle) * radius;
                        const x2 = Math.cos(endAngle) * radius;
                        const y2 = Math.sin(endAngle) * radius;

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        return (
                          <g key={i}>
                            <path
                              d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                              fill={data.color}
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={Math.cos((startAngle + endAngle) / 2) * 40}
                              y={Math.sin((startAngle + endAngle) / 2) * 40}
                              fontSize="10"
                              fill="white"
                              textAnchor="middle"
                            >
                              {data.year}
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* Legend */}
                    <g transform="translate(20, 170)">
                      {yearlyChartData.map((item, i) => (
                        <g key={i} transform={`translate(${i * 80}, 0)`}>
                          <circle cx="5" cy="5" r="4" fill={item.color} />
                          <text x="15" y="9" fontSize="8" fill="#6b7280">
                            {item.year}: ₹{(item.sales / 1000).toFixed(0)}k
                          </text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 px-0">
      <LoadingOverlay
        isLoading={loading || markLoading}
        message={
          markLoading ? "Updating order status..." : "Loading dashboard data..."
        }
      />
      <div className="p-6 bg-gradient-to-br from-purple-100 via-white to-purple-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTshirt className="text-[#a997cb]" />
            Laundry Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your laundry business
            today.
          </p>
        </div>

        {/* Stats Cards - 5 Cards */}
        <div className="space-y-6 mb-8">
          {/* First Row - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New Orders */}
            <div
              onClick={() => handleCardClick("newOrders")}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    New Orders
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.newOrders}
                  </h3>
                  <p className="text-purple-500 text-xs mt-1">
                    ↗ +12% from yesterday
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaShoppingCart className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Today's Expected Deliveries */}
            <div
              onClick={() => handleCardClick("todayExpected")}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Today's Expected
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.todayExpected || 0}
                  </h3>
                  <p className="text-purple-500 text-xs mt-1">
                    Deliveries today
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaClock className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div
              onClick={() => handleCardClick("pending")}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Pending Orders
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.pendingOrders}
                  </h3>
                  <p className="text-purple-500 text-xs mt-1">In progress</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaSpinner className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Collected Orders */}
            <div
              onClick={() => handleCardClick("collected")}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Collected Orders
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.collectedOrders}
                  </h3>
                  <p className="text-purple-500 text-xs mt-1">
                    Ready for pickup
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaTshirt className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Total Deliveries */}
            <div
              onClick={() => handleCardClick("delivered")}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Deliveries
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.deliveredOrders}
                  </h3>
                  <p className="text-purple-500 text-xs mt-1">
                    ↗ +8% from yesterday
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaTruck className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Total Sales */}
            <div
              onClick={() => setActiveView("sales")}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Sales
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    ₹{stats.totalSales.toLocaleString()}
                  </h3>
                  <p className="text-purple-600 text-xs mt-1">
                    ↗ +15% from last month
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaChartLine className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderContent()}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FaShoppingCart className="text-[#a997cb] text-2xl mb-2" />
              <span className="text-sm font-medium">New Order</span>
            </button>

            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FaTruck className="text-[#8a82b5] text-2xl mb-2" />
              <span className="text-sm font-medium">Delivery</span>
            </button>

            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FaTshirt className="text-purple-600 text-2xl mb-2" />
              <span className="text-sm font-medium">Inventory</span>
            </button>

            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FaChartLine className="text-purple-500 text-2xl mb-2" />
              <span className="text-sm font-medium">Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
