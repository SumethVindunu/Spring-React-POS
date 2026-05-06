import { useEffect, useState } from "react";
import {
  registerUser,
  fetchUsers,
  fetchUserById,
  updateUser,
  deleteUser,
} from "../../service/UserService.js";
import { useTheme } from "../../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageUser = () => {
  const { isDarkMode } = useTheme();
  const storedRole = localStorage.getItem("role") || "";
  const isAdmin = storedRole === "ROLE_ADMIN" || storedRole === "ADMIN";

  const theme = {
    container: isDarkMode ? "bg-dark min-vh-100" : "bg-light min-vh-100",
    card: isDarkMode
      ? "bg-secondary bg-opacity-10 border border-secondary text-white"
      : "bg-white border-0 shadow-sm",
    cardHeader: isDarkMode
      ? "bg-transparent border-bottom border-secondary"
      : "bg-white border-0",
    input: isDarkMode
      ? "bg-dark text-white border-secondary placeholder-gray"
      : "bg-light border-0",
    label: isDarkMode ? "text-light" : "text-dark",
    textMuted: isDarkMode ? "text-white-50" : "text-muted",
    table: isDarkMode ? "table-dark table-striped" : "table-hover",
    tableHead: isDarkMode ? "text-white-50" : "bg-light text-secondary",
  };

  const initialFormState = {
    name: "",
    email: "",
    password: "",
    role: "USER",
  };

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data || []);
      setFilteredUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users");
    }
  };
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Access denied - admin only");
      return;
    }
    loadUsers();
  }, [isAdmin]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(value.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      // send password only when creating or when provided during edit
      ...(formData.password ? { password: formData.password } : {}),
      role: formData.role,
    };

    try {
      if (editingUserId) {
        await updateUser(editingUserId, payload);
        toast.success("User updated successfully");
      } else {
        await registerUser(payload);
        toast.success("User created successfully");
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      console.error("Save user failed:", err);
      toast.error("Error saving user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (userId) => {
    try {
      const res = await fetchUserById(userId);
      const data = res.data;
      setEditingUserId(userId);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        password: "", // don't fill password
        role: data.role || "USER",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error fetching user", err);
      toast.error("Failed to fetch user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      console.error("Error deleting user", err);
      toast.error("Failed to delete user");
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingUserId(null);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDarkMode ? "dark" : "light"}
      />

      <div className={`container-fluid p-4 ${theme.container}`}>
        <div className="row g-4">
          <div className="col-lg-4 col-md-5">
            <div
              className={`card rounded-4 sticky-top ${theme.card}`}
              style={{ top: "20px", zIndex: 1 }}
            >
              <div className={`card-header pt-4 px-4 ${theme.cardHeader}`}>
                <h4 className="fw-bold text-primary mb-0">
                  {editingUserId ? "Edit User" : "New User"}
                </h4>
                <p className={`small mb-0 ${theme.textMuted}`}>
                  {editingUserId
                    ? "Update user details"
                    : "Fill details to create a new user"}
                </p>
              </div>

              <div className="card-body px-4 pb-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className={`form-label fw-semibold ${theme.label}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${theme.input}`}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className={`form-label fw-semibold ${theme.label}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${theme.input}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className={`form-label fw-semibold ${theme.label}`}>
                      Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${theme.input}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={
                        editingUserId
                          ? "Leave blank to keep existing password"
                          : ""
                      }
                      {...(!editingUserId && { required: true })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className={`form-label fw-semibold ${theme.label}`}>
                      Role
                    </label>
                    <select
                      className={`form-select ${theme.input}`}
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="ROLE_USER">ROLE_USER</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className={`btn btn-lg ${
                        editingUserId ? "btn-warning text-white" : "btn-primary"
                      }`}
                      disabled={loading || !isAdmin}
                    >
                      {loading
                        ? "Processing..."
                        : editingUserId
                        ? "Update User"
                        : "Create User"}
                    </button>

                    {editingUserId && (
                      <button
                        type="button"
                        className={`btn ${
                          isDarkMode
                            ? "btn-outline-light"
                            : "btn-light text-muted"
                        }`}
                        onClick={resetForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8 col-md-7">
            <div className={`card rounded-4 h-100 ${theme.card}`}>
              <div
                className={`card-header pt-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center ${theme.cardHeader}`}
              >
                <h4 className="fw-bold mb-2 mb-md-0">All Users</h4>

                <input
                  type="text"
                  className="form-control w-100 w-md-25 mt-2 mt-md-0"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className={`table align-middle mb-0 ${theme.table}`}>
                    <thead className={theme.tableHead}>
                      <tr>
                        <th className="ps-4 py-3">Name</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Role</th>
                        <th className="text-end pe-4 py-3">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u.userId || u.id || u.email}>
                            <td className="ps-4 fw-semibold">{u.name}</td>
                            <td className={theme.textMuted}>{u.email}</td>
                            <td>{u.role || "-"}</td>
                            <td className="text-end pe-4">
                              {isAdmin && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => handleEdit(u.userId || u.id)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      handleDelete(u.userId || u.id)
                                    }
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className={`text-center py-5 ${theme.textMuted}`}
                          >
                            No users found
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
    </>
  );
};

export default ManageUser;
