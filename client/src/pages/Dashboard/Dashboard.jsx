import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../context/ThemeContext";

const ORDERS_API = "http://localhost:8080/api/v1.0/admin/orders";

const Dashboard = () => {
const { isDarkMode } = useTheme();
const storedRole = localStorage.getItem("role") || "";
const isAdmin = storedRole === "ROLE_ADMIN" || storedRole === "ADMIN";


  // ===== MODERN THEME =====
  const theme = {
    container: isDarkMode
      ? "bg-dark text-light min-vh-100"
      : "bg-light text-dark min-vh-100",

    card: isDarkMode
      ? "bg-secondary bg-opacity-10 border border-secondary text-white shadow-lg"
      : "bg-white border-0 shadow-sm",

    cardHeader: isDarkMode
      ? "bg-transparent border-bottom border-secondary"
      : "bg-white border-0",

    input: isDarkMode
      ? "bg-dark text-white border-secondary"
      : "bg-light border-0 shadow-sm",

    label: isDarkMode ? "text-light" : "text-dark",

    textMuted: isDarkMode ? "text-white-50" : "text-muted",

    table: isDarkMode
      ? "table table-dark table-hover align-middle"
      : "table table-hover align-middle",

    tableHead: isDarkMode
      ? "text-white-50 border-bottom border-secondary"
      : "bg-light text-secondary",

    statCard: isDarkMode
      ? "bg-dark border border-secondary text-white shadow-sm"
      : "bg-light border-0 shadow-sm",

    modal: isDarkMode
      ? "bg-dark border border-secondary text-white"
      : "bg-white border-0 shadow-lg",
  };

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // ===== LOAD ORDERS =====
  const loadOrders = async () => {
    setLoading(true);

    try {
      const res = await axios.get(ORDERS_API, { timeout: 10000 });

      const data = res.data || [];

      setOrders(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ===== TOTALS =====
  const totals = useMemo(() => {
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce((sum, o) => {
      const val =
        Number(o.totalAmount || o.total || o.amount || 0) || 0;

      return sum + val;
    }, 0);

    // no status column -> pending set to 0
    const pending = 0;

    return {
      totalOrders,
      totalRevenue,
      pending,
    };
  }, [orders]);

  // ===== SEARCH =====
  const handleSearch = (e) => {
    const q = e.target.value || "";

    setSearchTerm(q);

    if (!q) {
      setFiltered(orders);
      return;
    }

    const low = q.toLowerCase();

    const result = orders.filter((o) => {
      return (
        String(o.orderId || o.id || "")
          .toLowerCase()
          .includes(low) ||
        String(o.customerName || o.customer?.name || "")
          .toLowerCase()
          .includes(low) ||
        String(o.phoneNumber || o.customer?.phone || "")
          .toLowerCase()
          .includes(low)
      );
    });

    setFiltered(result);
  };

  // ===== DETAILS =====
  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setShowDetails(false);
  };

  // ===== DELETE =====
  const handleDeleteOrder = async (orderId) => {
    if (!isAdmin) {
      toast.error("Access denied - admin only");
      return;
    }
  
    if (!window.confirm("Delete this order?")) return;
  
    try {
      await axios.delete(`${ORDERS_API}/${orderId}`);
  
      toast.success("Order deleted successfully");
  
      closeDetails();
      loadOrders();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete order");
    }
  };

  return (
    <>
      {/* ===== TOAST ===== */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDarkMode ? "dark" : "light"}
      />

      {/* ===== MAIN ===== */}
      <div className={`container-fluid p-4 ${theme.container}`}>
        <div className="row g-4">
          {/* ===== LEFT PANEL ===== */}
          <div className="col-lg-4 col-md-5">
            <div
              className={`card rounded-4 sticky-top ${theme.card}`}
              style={{ top: "20px", zIndex: 1 }}
            >
              <div className={`card-header pt-4 px-4 ${theme.cardHeader}`}>
                <h4 className="fw-bold text-primary mb-1">Orders Summary</h4>

                <p className={`small mb-0 ${theme.textMuted}`}>
                  Overview of recent orders
                </p>
              </div>

              <div className="card-body px-4 pb-4">
                {/* SEARCH */}
                <div className="mb-4">
                  <label className={`form-label fw-semibold ${theme.label}`}>
                    Search Orders
                  </label>

                  <input
                    type="text"
                    className={`form-control form-control-lg ${theme.input}`}
                    placeholder="Search by order id..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                {/* STATS */}
                <div className="row g-3">
                  <div className="col-6">
                    <div
                      className={`p-4 rounded-4 text-center ${theme.statCard}`}
                    >
                      <h6 className={theme.textMuted}>Total Orders</h6>

                      <h2 className="fw-bold text-primary">
                        {totals.totalOrders}
                      </h2>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className={`p-4 rounded-4 text-center ${theme.statCard}`}
                    >
                      <h6 className={theme.textMuted}>Pending</h6>

                      <h2 className="fw-bold text-warning">{totals.pending}</h2>
                    </div>
                  </div>

                  <div className="col-12">
                    <div
                      className={`p-4 rounded-4 text-center ${theme.statCard}`}
                    >
                      <h6 className={theme.textMuted}>Total Revenue</h6>

                      <h2 className="fw-bold text-success">
                        {totals.totalRevenue.toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                        })}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT PANEL ===== */}
          <div className="col-lg-8 col-md-7">
            <div className={`card rounded-4 ${theme.card}`}>
              <div
                className={`card-header pt-4 px-4 d-flex justify-content-between align-items-center ${theme.cardHeader}`}
              >
                <div>
                  <h4 className="fw-bold mb-0">Recent Orders</h4>

                  <small className={theme.textMuted}>
                    Updated: {new Date().toLocaleString()}
                  </small>
                </div>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className={theme.table}>
                    <thead className={theme.tableHead}>
                      <tr>
                        <th className="ps-4 py-3">Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th className="text-center">Actions</th>
                        <th className="text-end pe-4">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            Loading orders...
                          </td>
                        </tr>
                      ) : filtered.length > 0 ? (
                        filtered.map((o) => (
                          <tr key={o.orderId || o.id} className="align-middle">
                            <td className="ps-4 fw-semibold">
                              #{o.orderId || o.id}
                            </td>

                            <td className={theme.textMuted}>
                              {o.customerName || o.customer?.name || "-"}
                            </td>

                            <td>{(o.items || o.orderItems || []).length}</td>

                            <td className="fw-semibold text-success">
                              {Number(
                                o.totalAmount || o.total || o.amount || 0
                              ).toLocaleString(undefined, {
                                style: "currency",
                                currency: "USD",
                              })}
                            </td>

                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3"
                                onClick={() => openDetails(o)}
                              >
                                View
                              </button>

                              {isAdmin && (
                                <button
                                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                  onClick={() =>
                                    handleDeleteOrder(o.orderId || o.id)
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </td>

                            <td className="text-end pe-4">
                              {o.createDate || o.createdAt || o.date
                                ? new Date(
                                    o.createDate || o.createdAt || o.date
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
            className={`card rounded-4 p-4 ${theme.modal}`}
            style={{
              width: "90%",
              maxWidth: "850px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="fw-bold mb-1">Order Details</h3>

                <p className={theme.textMuted}>
                  #{selectedOrder.orderId || selectedOrder.id}
                </p>
              </div>

              <button
                className="btn btn-outline-secondary rounded-pill"
                onClick={closeDetails}
              >
                Close
              </button>
            </div>

            {/* CUSTOMER */}
            <div className="mb-4">
              <h6 className={`fw-bold ${theme.label}`}>Customer</h6>

              <div className={theme.textMuted}>
                {selectedOrder.customerName ||
                  selectedOrder.customer?.name ||
                  "-"}
              </div>
            </div>

            {/* MORE INFO */}
            <div className="mb-4">
              <h6 className={`fw-bold ${theme.label}`}>More Info</h6>

              <div className={`row ${theme.textMuted}`}>
                <div className="col-md-6 mb-2">
                  <div className="small">Phone</div>
                  <div className="fw-semibold">
                    {selectedOrder.phoneNumber ||
                      selectedOrder.customer?.phone ||
                      "-"}
                  </div>
                </div>

                <div className="col-md-6 mb-2">
                  <div className="small">Created</div>
                  <div className="fw-semibold">
                    {selectedOrder.createDate ||
                    selectedOrder.createdAt ||
                    selectedOrder.date
                      ? new Date(
                          selectedOrder.createDate ||
                            selectedOrder.createdAt ||
                            selectedOrder.date
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>

                <div className="col-md-6 mb-2">
                  <div className="small">Total Amount</div>
                  <div className="fw-semibold text-success">
                    {Number(
                      selectedOrder.totalAmount ||
                        selectedOrder.total ||
                        selectedOrder.amount ||
                        0
                    ).toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                </div>

                <div className="col-md-6 mb-2">
                  <div className="small">Cash Received</div>
                  <div className="fw-semibold">
                    {Number(
                      selectedOrder.cashReceivedived ||
                        selectedOrder.cashReceived ||
                        selectedOrder.cash ||
                        0
                    ).toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                </div>

                <div className="col-md-6 mb-2">
                  <div className="small">Change</div>
                  <div className="fw-semibold">
                    {Number(selectedOrder.changeAmount || 0).toLocaleString(
                      undefined,
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}
                  </div>
                </div>

                <div className="col-md-6 mb-2">
                  <div className="small">Cashier</div>
                  <div className="fw-semibold">
                    {selectedOrder.cashierName ||
                      selectedOrder.createdBy ||
                      "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mb-4">
              <h6 className={`fw-bold mb-3 ${theme.label}`}>Order Items</h6>

              <div className="list-group">
                {(selectedOrder.items || selectedOrder.orderItems || []).map(
                  (it, index) => (
                    <div
                      key={index}
                      className={`list-group-item rounded-3 mb-2 ${theme.card}`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">
                            {it.name || it.title || it.itemName}
                          </div>

                          <small className={theme.textMuted}>
                            Qty: {it.quantity || it.qty || 1}
                          </small>
                        </div>

                        <div className="fw-bold text-success">
                          {(
                            (it.quantity || 1) * Number(it.price || 0)
                          ).toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <div>
                <div className={`small ${theme.textMuted}`}>Cashier</div>

                <div className="fw-semibold">
                  {selectedOrder.cashierName || selectedOrder.createdBy || "-"}
                </div>
              </div>

              <div className="text-end">
                <div className={`small ${theme.textMuted}`}>Total Amount</div>

                <h3 className="fw-bold text-success mb-0">
                  {Number(
                    selectedOrder.totalAmount || selectedOrder.total || 0
                  ).toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;