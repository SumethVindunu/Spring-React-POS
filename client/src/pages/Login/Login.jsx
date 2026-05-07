import { useState } from "react";
import { loginApi } from "../../service/AuthService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

const Login = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const theme = {
        container: isDarkMode ? "bg-dark text-white min-vh-100" : "bg-light text-dark min-vh-100",
        card: isDarkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-white border-0 shadow-sm",
        input: isDarkMode ? "bg-dark text-white border-secondary" : "bg-light border-0",
        label: isDarkMode ? "text-light" : "text-dark"
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await loginApi(formData);
            const data = response.data;
            
            // Save to localStorage
            localStorage.setItem("username", data.email);
            localStorage.setItem("role", data.role);
            localStorage.setItem("token", data.token);
            localStorage.setItem("name", data.name);

            toast.success("Login successful!");
            window.location.href = "/dashboard"; // Full reload to update Menubar safely
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`d-flex align-items-center justify-content-center ${theme.container}`}>
            <div className={`card p-5 rounded-4 ${theme.card}`} style={{ maxWidth: "450px", width: "100%" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Welcome Back</h2>
                    <p className={`small mb-0 ${isDarkMode ? 'text-white-50' : 'text-muted'}`}>
                        Please login to access your POS System
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={`form-label fw-semibold ${theme.label}`}>Email Address</label>
                        <input 
                            type="email" 
                            className={`form-control form-control-lg ${theme.input}`} 
                            name="email" 
                            placeholder="name@example.com"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className={`form-label fw-semibold ${theme.label}`}>Password</label>
                        <input 
                            type="password" 
                            className={`form-control form-control-lg ${theme.input}`} 
                            name="password" 
                            placeholder="********"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? "Signing in..." : "Login to Dashboard"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
