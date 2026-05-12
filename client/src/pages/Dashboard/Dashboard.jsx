import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../context/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Package,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ORDERS_API = "http://localhost:8080/api/v1.0/admin/orders";
const ITEMS_API = "http://localhost:8080/api/v1.0/admin/items";

const Dashboard = () => {
  const { isDarkMode } = useTheme();

  const storedRole = localStorage.getItem("role") || "";
  const isAdmin =
    storedRole === "ROLE_ADMIN" || storedRole === "ADMIN";

  // ===== THEME =====
  const theme = {
    container: isDarkMode
      ? "bg-dark min-vh-100"
      : "bg-light min-vh-100",

    card: isDarkMode
      ? "bg-secondary bg-opacity-10 border border-secondary text-white"
      : "bg-white border-0 shadow-sm",

    cardHeader: isDarkMode
      ? "border-bottom border-secondary"
      : "border-bottom",

    input: isDarkMode
      ? "bg-dark text-white border-secondary"
      : "bg-light border",

    label: isDarkMode ? "text-white-50" : "text-muted",

    textMuted: isDarkMode
      ? "text-white-50"
      : "text-muted",

    table: isDarkMode
      ? "table table-dark table-hover align-middle"
      : "table table-hover align-middle",

    tableHead: isDarkMode
      ? "bg-dark text-white-50"
      : "bg-light text-secondary",

    statCard: isDarkMode
      ? "bg-dark border border-secondary"
      : "bg-white border-0 shadow-sm",

    chart: isDarkMode ? "#1f2937" : "#ffffff",

    text: isDarkMode ? "text-white" : "text-dark",

    modalBody: isDarkMode
      ? "bg-dark text-white"
      : "bg-white text-dark",

    modalContent: isDarkMode
      ? "bg-dark border-secondary"
      : "bg-white border-0",
  };

  // ===== STATE =====
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // ===== LOAD DATA =====
  const loadData = async () => {
    setLoading(true);

    try {
      const [ordersRes, itemsRes] = await Promise.all([
        axios.get(ORDERS_API, { timeout: 10000 }),
        axios.get(ITEMS_API, { timeout: 10000 }),
      ]);

      setOrders(ordersRes.data || []);
      setFilteredOrders(ordersRes.data || []);
      setItems(itemsRes.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===== LOW STOCK ITEMS =====
  const lowStockItems = useMemo(() => {
    return items
      .filter((item) => item.qty <= 10)
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 10);
  }, [items]);

  // ===== CHART DATA =====
  const chartData = useMemo(() => {
    return lowStockItems.map((item) => ({
      name:
        item.name?.length > 12
          ? item.name.substring(0, 12) + "..."
          : item.name,

      fullName: item.name,
      quantity: item.qty,
      price: item.price,
    }));
  }, [lowStockItems]);

  // ===== DAILY ORDERS DATA =====
  const dailyOrdersData = useMemo(() => {
    const dailyMap = {};

    filteredOrders.forEach((order) => {
      if (order.createDate) {
        const date = new Date(
          order.createDate
        ).toLocaleDateString();

        if (!dailyMap[date]) {
          dailyMap[date] = {
            date,
            orders: 0,
            revenue: 0,
          };
        }

        dailyMap[date].orders += 1;
        dailyMap[date].revenue +=
          Number(order.totalAmount) || 0;
      }
    });

    return Object.values(dailyMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredOrders]);

  // ===== FILTER ORDERS =====
  useEffect(() => {
    let result = orders;

    if (dateFrom) {
      result = result.filter(
        (o) =>
          new Date(o.createDate) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      result = result.filter(
        (o) =>
          new Date(o.createDate) <= new Date(dateTo)
      );
    }

    if (searchTerm) {
      const low = searchTerm.toLowerCase();

      result = result.filter(
        (o) =>
          String(o.orderId || "")
            .toLowerCase()
            .includes(low) ||
          String(o.cashierName || "")
            .toLowerCase()
            .includes(low) ||
          String(o.phoneNumber || "")
            .toLowerCase()
            .includes(low)
      );
    }

    setFilteredOrders(result);
  }, [orders, dateFrom, dateTo, searchTerm]);

  // ===== CLEAR FILTERS =====
  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // ===== TOTALS =====
  const totals = useMemo(() => {
    const totalOrders = filteredOrders.length;

    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    );

    const lowStockCount = items.filter(
      (item) => item.qty <= 10
    ).length;

    return {
      totalOrders,
      totalRevenue,
      lowStockCount,
    };
  }, [filteredOrders, items]);

  // ===== GENERATE PDF REPORT =====
  const generateReport = () => {
    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    // ===== HEADER =====
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
      "POS Sales Report",
      pageWidth / 2,
      15,
      {
        align: "center",
      }
    );

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Order Management System",
      pageWidth / 2,
      22,
      {
        align: "center",
      }
    );

    // ===== DATE RANGE =====
    const dateRangeText =
      dateFrom || dateTo
        ? `From: ${dateFrom || "Start"} To: ${
            dateTo || "Today"
          }`
        : "All Time";

    doc.setFontSize(10);

    doc.text(
      `Report Period: ${dateRangeText}`,
      14,
      30
    );

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      36
    );

    // ===== SUMMARY BOX =====
    doc.setFillColor(240, 240, 240);

    doc.rect(14, 40, pageWidth - 28, 25, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text("Summary", 20, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Total Orders: ${totals.totalOrders}`,
      20,
      55
    );

    doc.text(
      `Total Revenue: Rs. ${totals.totalRevenue.toFixed(
        2
      )}`,
      100,
      55
    );

    // ===== TABLE DATA =====
    const tableData = filteredOrders.map(
      (o, index) => [
        index + 1,
        o.orderId || "-",
        o.customerName || "-",
        o.phoneNumber || "-",
        (o.items || []).length,
        `Rs. ${Number(
          o.totalAmount || 0
        ).toFixed(2)}`,
        o.cashierName || "-",
        o.createDate
          ? new Date(
              o.createDate
            ).toLocaleDateString()
          : "-",
      ]
    );

    // ===== AUTO TABLE =====
    autoTable(doc, {
      startY: 70,

      head: [
        [
          "#",
          "Order ID",
          "Customer",
          "Phone",
          "Items",
          "Total",
          "Cashier",
          "Date",
        ],
      ],

      body: tableData,

      theme: "grid",

      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },

      styles: {
        fontSize: 8,
        cellPadding: 3,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // ===== FOOTER =====
    const pageCount =
      doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");

      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        {
          align: "center",
        }
      );
    }

    // ===== SAVE =====
    doc.save(
      `Sales_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );

    toast.success(
      "Report downloaded successfully!"
    );
  };

  // ===== DELETE ORDER =====
  const handleDeleteOrder = async (orderId) => {
    if (!isAdmin) {
      toast.error("Access denied - admin only");
      return;
    }

    if (!window.confirm("Delete this order?"))
      return;

    try {
      await axios.delete(
        `${ORDERS_API}/${orderId}`
      );

      toast.success("Order deleted");

      closeDetails();
      loadData();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete order");
    }
  };

  // ===== OPEN DETAILS =====
  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  // ===== CLOSE DETAILS =====
  const closeDetails = () => {
    setSelectedOrder(null);
    setShowDetails(false);
  };

  // ===== RENDER =====
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDarkMode ? "dark" : "light"}
      />

      <div
        className={`container-fluid p-4 ${theme.container}`}
      >
        {/* ===== HEADER ===== */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className={`fw-bold ${theme.text}`}>
              Dashboard
            </h2>

            <p className={theme.textMuted}>
              Overview of your store performance
            </p>
          </div>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div
              className={`d-flex align-items-center gap-2 p-2 rounded-3 ${
                isDarkMode
                  ? "bg-secondary bg-opacity-10"
                  : "bg-white shadow-sm"
              }`}
            >
              <Calendar
                size={16}
                className={theme.textMuted}
              />

              <input
                type="date"
                className={`form-control form-control-sm border-0 ${theme.input}`}
                value={dateFrom}
                onChange={(e) =>
                  setDateFrom(e.target.value)
                }
                style={{
                  width: "130px",
                  background: "transparent",
                }}
              />

              <span className={theme.textMuted}>
                -
              </span>

              <input
                type="date"
                className={`form-control form-control-sm border-0 ${theme.input}`}
                value={dateTo}
                onChange={(e) =>
                  setDateTo(e.target.value)
                }
                style={{
                  width: "130px",
                  background: "transparent",
                }}
              />

              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-2"
                onClick={clearFilters}
                title="Clear filters"
              >
                <small>Clear</small>
              </button>
            </div>

            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={loadData}
            >
              <TrendingUp
                size={18}
                className="me-1"
              />
              Refresh
            </button>

            <button
              className="btn btn-success rounded-pill px-4"
              onClick={generateReport}
            >
              <FileText
                size={18}
                className="me-1"
              />
              Get Report
            </button>
          </div>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div
              className={`card rounded-4 p-4 ${theme.statCard}`}
            >
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <ShoppingCart
                    size={28}
                    className="text-primary"
                  />
                </div>

                <div>
                  <p className={theme.textMuted}>
                    Total Orders
                  </p>

                  <h2
                    className="fw-bold mb-0"
                    style={{ color: "#3b82f6" }}
                  >
                    {totals.totalOrders}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`card rounded-4 p-4 ${theme.statCard}`}
            >
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <DollarSign
                    size={28}
                    className="text-success"
                  />
                </div>

                <div>
                  <p className={theme.textMuted}>
                    Total Revenue
                  </p>

                  <h2
                    className="fw-bold mb-0"
                    style={{
                      color: isDarkMode
                        ? "#4ade80"
                        : "#16a34a",
                    }}
                  >
                    Rs.{" "}
                    {totals.totalRevenue.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`card rounded-4 p-4 ${theme.statCard}`}
            >
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <AlertTriangle
                    size={28}
                    className="text-warning"
                  />
                </div>

                <div>
                  <p className={theme.textMuted}>
                    Low Stock Items
                  </p>

                  <h2 className="fw-bold mb-0 text-warning">
                    {totals.lowStockCount}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== LOW STOCK SECTION ===== */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div
              className={`card rounded-4 ${theme.card}`}
            >
              <div
                className={`card-header py-3 ${theme.cardHeader}`}
              >
                <h5
                  className={`fw-bold mb-0 ${theme.text}`}
                >
                  <AlertTriangle
                    size={20}
                    className="me-2 text-warning"
                  />
                  Low Stock Items (Qty ≤ 10)
                </h5>
              </div>

              <div className="card-body">
                {chartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={280}
                  >
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          isDarkMode
                            ? "#374151"
                            : "#e5e7eb"
                        }
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: isDarkMode
                            ? "#9ca3af"
                            : "#6b7280",

                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        tick={{
                          fill: isDarkMode
                            ? "#9ca3af"
                            : "#6b7280",
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode
                            ? "#1f2937"
                            : "#fff",

                          border: `1px solid ${
                            isDarkMode
                              ? "#374151"
                              : "#e5e7eb"
                          }`,

                          borderRadius: "8px",
                        }}
                        labelStyle={{
                          color: isDarkMode
                            ? "#fff"
                            : "#000",
                        }}
                      />

                      <Bar
                        dataKey="quantity"
                        name="Quantity"
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.quantity <= 5
                                  ? "#ef4444"
                                  : entry.quantity <=
                                    10
                                  ? "#f59e0b"
                                  : "#22c55e"
                              }
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-success">
                    <Package
                      size={48}
                      className="mb-3"
                    />

                    <p className="mb-0">
                      All items are well stocked!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== LOW STOCK LIST ===== */}
          <div className="col-lg-6">
            <div
              className={`card rounded-4 ${theme.card}`}
            >
              <div
                className={`card-header py-3 ${theme.cardHeader}`}
              >
                <h5
                  className={`fw-bold mb-0 ${theme.text}`}
                >
                  <Package size={20} className="me-2" />
                  Low Stock List
                </h5>
              </div>

              <div
                className="card-body p-0"
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                }}
              >
                {lowStockItems.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {lowStockItems.map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className={`list-group-item d-flex justify-content-between align-items-center ${theme.card}`}
                        >
                          <div>
                            <div
                              className={`fw-semibold ${theme.text}`}
                            >
                              {item.name}
                            </div>

                            <small
                              className={
                                theme.textMuted
                              }
                            >
                              Rs.{" "}
                              {Number(
                                item.price
                              ).toFixed(2)}
                            </small>
                          </div>

                          <span
                            className={`badge rounded-pill ${
                              item.qty <= 5
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {item.qty} left
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-success">
                    No low stock items
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== ORDERS SECTION ===== */}
        <div
          className={`card rounded-4 ${theme.card}`}
        >
          <div
            className={`card-header py-3 ${theme.cardHeader}`}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h5
                className={`fw-bold mb-0 ${theme.text}`}
              >
                <ShoppingCart
                  size={20}
                  className="me-2"
                />
                Orders ({filteredOrders.length})
              </h5>

              <div className="d-flex align-items-center gap-2">
                <p className={`mb-0 ${theme.text}`}>
                  Search Order
                </p>

                <input
                  type="text"
                  className={`form-control form-control-sm ${theme.input}`}
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  style={{ width: "200px" }}
                />
              </div>
            </div>
          </div>

          <div
            className="card-body p-0"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <div className="table-responsive">
              <table
                className={`table table-hover mb-0 ${theme.table}`}
              >
                <thead className={theme.tableHead}>
                  <tr>
                    <th className="ps-4 py-3">
                      Order ID
                    </th>

                    <th>Cashier</th>

                    <th>Items</th>

                    <th>Total</th>

                    <th className="text-center">
                      Actions
                    </th>

                    <th className="text-end pe-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((o) => (
                      <tr
                        key={o.orderId || o.id}
                        className="align-middle"
                      >
                        <td className="ps-4 fw-semibold">
                          #{o.orderId || o.id}
                        </td>

                        <td className={theme.textMuted}>
                          {o.cashierName || "-"}
                        </td>

                        <td>
                          {(o.items || []).length}
                        </td>

                        <td
                          className="fw-semibold"
                          style={{
                            color: isDarkMode
                              ? "#4ade80"
                              : "#16a34a",
                          }}
                        >
                          Rs.{" "}
                          {Number(
                            o.totalAmount || 0
                          ).toFixed(2)}
                        </td>

                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3"
                            onClick={() =>
                              openDetails(o)
                            }
                          >
                            View
                          </button>

                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                              onClick={() =>
                                handleDeleteOrder(
                                  o.orderId || o.id
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </td>

                        <td className="text-end pe-4">
                          {o.createDate
                            ? new Date(
                                o.createDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className={`text-center py-5 ${theme.textMuted}`}
                      >
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showDetails && selectedOrder && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            zIndex: 2000,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(5px)",
          }}
          onClick={closeDetails}
        >
          <div
            className={`card rounded-4 ${theme.modalContent} shadow-lg`}
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ===== HEADER ===== */}
            <div
              className={`p-4 border-bottom ${
                isDarkMode
                  ? "border-secondary"
                  : ""
              }`}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4
                    className={`fw-bold mb-1 ${theme.text}`}
                  >
                    Order Details
                  </h4>

                  <span
                    className={`badge ${
                      isDarkMode
                        ? "bg-secondary"
                        : "bg-primary"
                    }`}
                  >
                    #
                    {selectedOrder.orderId ||
                      selectedOrder.id}
                  </span>
                </div>

                <button
                  className="btn btn-sm btn-close"
                  onClick={closeDetails}
                ></button>
              </div>
            </div>

            {/* ===== BODY ===== */}
            <div
              className="p-4 flex-grow-1"
              style={{ overflowY: "auto" }}
            >
              {/* ===== CUSTOMER ===== */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className={`badge bg-info bg-opacity-20 ${
                      isDarkMode
                        ? "text-primary"
                        : "text-primary"
                    }`}
                  >
                    Customer
                  </span>
                </div>

                <div
                  className={`fw-semibold ${theme.text}`}
                >
                  {selectedOrder.customerName ||
                    "-"}
                </div>

                <small className={theme.textMuted}>
                  {selectedOrder.phoneNumber ||
                    "No phone"}
                </small>
              </div>

              {/* ===== ORDER INFO ===== */}
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-6">
                    <div
                      className={`p-3 rounded-3 ${
                        isDarkMode
                          ? "bg-secondary bg-opacity-10"
                          : "bg-light"
                      }`}
                    >
                      <small
                        className={theme.textMuted}
                      >
                        Created
                      </small>

                      <div
                        className={`fw-semibold ${theme.text}`}
                      >
                        {selectedOrder.createDate
                          ? new Date(
                              selectedOrder.createDate
                            ).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className={`p-3 rounded-3 ${
                        isDarkMode
                          ? "bg-secondary bg-opacity-10"
                          : "bg-light"
                      }`}
                    >
                      <small
                        className={theme.textMuted}
                      >
                        Cashier
                      </small>

                      <div
                        className={`fw-semibold ${theme.text}`}
                      >
                        {selectedOrder.cashierName ||
                          "-"}
                      </div>
                    </div>
                  </div>

                  {/* ===== FIXED CASH RECEIVED ===== */}
                  <div className="col-6">
                    <div
                      className={`p-3 rounded-3 ${
                        isDarkMode
                          ? "bg-secondary bg-opacity-10"
                          : "bg-light"
                      }`}
                    >
                      <small
                        className={theme.textMuted}
                      >
                        Cash Received
                      </small>

                      <div
                        className={`fw-semibold ${theme.text}`}
                      >
                        Rs.{" "}
                        {Number(
                          selectedOrder.cashReceived ||
                            0
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className={`p-3 rounded-3 ${
                        isDarkMode
                          ? "bg-secondary bg-opacity-10"
                          : "bg-light"
                      }`}
                    >
                      <small
                        className={theme.textMuted}
                      >
                        Change
                      </small>

                      <div
                        className={`fw-semibold ${theme.text}`}
                      >
                        Rs.{" "}
                        {Number(
                          selectedOrder.changeAmount ||
                            0
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== ITEMS ===== */}
              <div className="mb-3">
                <h6
                  className={`fw-bold mb-3 ${theme.text}`}
                >
                  Order Items (
                  {selectedOrder.items?.length ||
                    0}
                  )
                </h6>

                <div className="d-flex flex-column gap-2">
                  {(selectedOrder.items || []).map(
                    (it, idx) => (
                      <div
                        key={idx}
                        className={`d-flex justify-content-between align-items-center p-3 rounded-3 ${
                          isDarkMode
                            ? "bg-secondary bg-opacity-10"
                            : "bg-light"
                        }`}
                      >
                        <div>
                          <div
                            className={`fw-semibold ${theme.text}`}
                          >
                            {it.name}
                          </div>

                          <small
                            className={
                              theme.textMuted
                            }
                          >
                            Qty: {it.quantity} x Rs.{" "}
                            {Number(
                              it.price || 0
                            ).toFixed(2)}
                          </small>
                        </div>

                        <div
                          className="fw-bold"
                          style={{
                            color: "#0d6efd",
                          }}
                        >
                          Rs.{" "}
                          {(
                            Number(it.quantity) *
                            Number(it.price || 0)
                          ).toFixed(2)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div
              className={`p-4 border-top d-flex justify-content-between align-items-center ${
                isDarkMode
                  ? "border-secondary"
                  : ""
              }`}
            >
              <div>
                <small className={theme.textMuted}>
                  Total Amount
                </small>

                <div
                  className="fw-bold fs-4"
                  style={{ color: "#3b82f6" }}
                >
                  Rs.{" "}
                  {Number(
                    selectedOrder.totalAmount || 0
                  ).toFixed(2)}
                </div>
              </div>

              <button
                className="btn btn-secondary rounded-pill px-4"
                onClick={closeDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;