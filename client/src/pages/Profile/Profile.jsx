import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Profile = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "Unknown User";
    const role = localStorage.getItem("role") || "No Role";
    const token = localStorage.getItem("token") || "";

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const theme = {
        container: isDarkMode ? "bg-dark text-white min-vh-100" : "bg-light text-dark min-vh-100",
        card: isDarkMode ? "bg-secondary bg-opacity-10 border border-secondary text-white" : "bg-white border-0 shadow-sm",
        textMuted: isDarkMode ? "text-white-50" : "text-muted"
    };

    return (
        <div className={`p-4 ${theme.container}`}>
            <div className="container">
                <h3 className="fw-bold mb-4">My Profile</h3>

                <div className={`card rounded-4 p-4 ${theme.card}`}>
                    <div className="d-flex align-items-center mb-4">
                        <i className="bi bi-person-circle text-primary" style={{ fontSize: "4rem" }}></i>
                        <div className="ms-4">
                            <h4 className="fw-bold mb-1">{username}</h4>
                            <span className="badge bg-primary text-uppercase">{role}</span>
                        </div>
                    </div>

                    <hr className={isDarkMode ? "border-secondary" : ""} />

                    <div className="row g-4 mt-2">
                        <div className="col-md-6">
                            <h6 className={`fw-semibold ${theme.textMuted}`}>Email Address</h6>
                            <p className="fs-5">{username}</p>
                        </div>
                        <div className="col-md-6">
                            <h6 className={`fw-semibold ${theme.textMuted}`}>Account Role</h6>
                            <p className="fs-5 text-capitalize">{role.toLowerCase()}</p>
                        </div>
                        <div className="col-12">
                            <h6 className={`fw-semibold ${theme.textMuted}`}>Active JWT Token</h6>
                            <div 
                                className={`p-3 rounded-3 text-break ${isDarkMode ? "bg-dark border border-secondary" : "bg-light border"}`}
                                style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                            >
                                {token || "No active token"}
                            </div>
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
            </div>
        </div>
    );
};

export default Profile;
