import 'bootstrap-icons/font/bootstrap-icons.css'
import { NavLink, Link } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext.jsx"

const Menubar = () => {

    const { isDarkMode, toggleTheme } = useTheme() // <-- Theme state

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">

                {/* Brand */}

                <Link className="navbar-brand fw-bold" to="/dashboard">
                    <i className="bi bi-box-seam me-2"></i>
                    POS-System
                </Link>

                {/* Toggle Button (Mobile) */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Menu Items */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-lg-center">

                        <li className="nav-item">
                            <Link className="nav-link active" to={"/dashboard"}>
                                <i className="bi bi-house-door me-1"></i>
                                Dashboard
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/explore">
                                <i className="bi bi-grid me-1"></i>
                                Explore
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/items">
                                <i className="bi bi-gear me-1"></i>
                                Manage Items
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/category">
                                <i className="bi bi-gear me-1"></i>
                                Manage Categories
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/users">
                                <i className="bi bi-people me-1"></i>
                                Manage Users
                            </Link>
                        </li>


                        {/* Theme Toggle Button */}
                        <li className="nav-item ms-lg-3">
                            <button
                                className={`btn btn-sm ${isDarkMode ? "btn-light text-dark" : "btn-dark text-white"}`}
                                onClick={toggleTheme}
                            >
                                {isDarkMode ? "Light Mode" : "Dark Mode"}
                            </button>
                        </li>

                        {/* Button */}
                        <li className="nav-item ms-lg-3">
                            <button className="btn btn-outline-light btn-sm">
                                <i className="bi bi-box-arrow-in-right me-1"></i>
                                Login
                            </button>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Menubar
