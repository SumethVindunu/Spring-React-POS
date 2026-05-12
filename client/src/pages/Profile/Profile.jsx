import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { Package, DollarSign, ShoppingCart, User, Calendar } from "lucide-react";

const Profile = () => {
    const { isDarkMode } = useTheme();

    const username = localStorage.getItem("username") || "Unknown User";
    const role = localStorage.getItem("role") || "No Role";

    const [allUserOrders, setAllUserOrders] = useState([]);
    const [userStats, setUserStats] = useState({
        totalOrders: 0,
        totalSpent: 0
    });
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        fetchUserOrderStats();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [dateFrom, dateTo, allUserOrders]);

    const fetchUserOrderStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/api/v1.0/admin/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userOrders = (res.data || []).filter(
                o => o.cashierName === username
            );

            setAllUserOrders(userOrders);
            calculateStats(userOrders);
        } catch (err) {
            console.error("Failed to fetch user stats", err);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = allUserOrders;

        if (dateFrom) {
            filtered = filtered.filter(o => new Date(o.createDate) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter(o => new Date(o.createDate) <= new Date(dateTo));
        }

        calculateStats(filtered);
    };

    const calculateStats = (orders) => {
        const totalSpent = orders.reduce(
            (sum, o) => sum + (Number(o.totalAmount) || 0), 0
        );

        setUserStats({
            totalOrders: orders.length,
            totalSpent: totalSpent
        });
    };

    const clearFilters = () => {
        setDateFrom("");
        setDateTo("");
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const theme = {
        container: isDarkMode ? "bg-dark min-vh-100" : "bg-light min-vh-100",
        card: isDarkMode ? "bg-secondary bg-opacity-10 border border-secondary text-white" : "bg-white border-0 shadow-sm",
        textMuted: isDarkMode ? "text-white-50" : "text-muted",
        statCard: isDarkMode ? "bg-dark border border-secondary" : "bg-white border-0 shadow-sm",
    };

    return (
        <div className={`p-4 ${theme.container}`}>
            <div className="container">
                <h3 className="fw-bold mb-4">My Profile</h3>

                {/* User Info Card */}
                <div className={`card rounded-4 p-4 mb-4 ${theme.card}`}>
                    <div className="d-flex align-items-center mb-4">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-4">
                            <User size={48} className="text-primary" />
                        </div>
                        <div className="ms-4">
                            <h4 className="fw-bold mb-1">{username}</h4>
                            <span className={`badge ${role === "ROLE_ADMIN" || role === "ADMIN" ? "bg-danger" : "bg-info"} text-uppercase`}>
                                {role}
                            </span>
                        </div>
                    </div>

                    <hr className={isDarkMode ? "border-secondary" : ""} />

                    <div className="row g-4 mt-2">
                        <div className="col-md-6">
                            <h6 className={`fw-semibold ${theme.textMuted}`}>Email / Username</h6>
                            <p className="fs-5">{username}</p>
                        </div>
                        <div className="col-md-6">
                            <h6 className={`fw-semibold ${theme.textMuted}`}>Account Role</h6>
                            <p className="fs-5 text-capitalize">{role.toLowerCase().replace("role_", "")}</p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <button
                            className="btn btn-danger px-4"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Logout
                        </button>
                    </div>
                </div>

                {/* User Order Stats */}
                <div className={`card rounded-4 p-4 ${theme.card}`}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                        <h5 className="fw-bold mb-0">
                            <Package size={20} className="me-2" />
                            My Order Statistics
                        </h5>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                            <div className={`d-flex align-items-center gap-2 p-2 rounded-3 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-light"}`}>
                                {/* <Calendar size={16} className={theme.textMuted} /> */}
                                <input
                                    type="date"
                                    className={`form-control form-control-sm border-0 ${theme.textMuted}`}
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    style={{ width: "130px", background: "transparent" }}
                                />
                                <span className={theme.textMuted}>-</span>
                                <input
                                    type="date"
                                    className={`form-control form-control-sm border-0 ${theme.textMuted}`}
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    style={{ width: "130px", background: "transparent" }}
                                />
                                <button
                                    className="btn btn-sm btn-outline-secondary rounded-pill px-2"
                                    onClick={clearFilters}
                                >
                                    <small>Clear</small>
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <p className={theme.textMuted}>Loading...</p>
                    ) : (
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className={`card rounded-4 p-4 ${theme.statCard}`}>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                            <ShoppingCart size={28} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className={theme.textMuted}>Total Orders</p>
                                            <h2 className="fw-bold mb-0" style={{ color: "#3b82f6" }}>
                                                {userStats.totalOrders}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className={`card rounded-4 p-4 ${theme.statCard}`}>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                            <DollarSign size={28} className="text-success" />
                                        </div>
                                        <div>
                                            <p className={theme.textMuted}>Total Sales</p>
                                            <h2 className="fw-bold mb-0" style={{ color: isDarkMode ? "#4ade80" : "#16a34a" }}>
                                                Rs. {userStats.totalSpent.toFixed(2)}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;