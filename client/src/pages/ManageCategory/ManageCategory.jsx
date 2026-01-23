import { useEffect, useState } from "react"
import {
    addCategory,
    fetchCategory,
    deleteCategory,
    fetchCategoryById,
    updateCategory
} from "../../service/CategoryService.js"
import { useTheme } from "../../context/ThemeContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const ManageCategory = () => {

    const { isDarkMode } = useTheme()


    // Dynamic classes based on the boolean above
    const theme = {
        container: isDarkMode ? "bg-dark min-vh-100" : "bg-light min-vh-100",
        card: isDarkMode ? "bg-secondary bg-opacity-10 border border-secondary text-white" : "bg-white border-0 shadow-sm",
        cardHeader: isDarkMode ? "bg-transparent border-bottom border-secondary" : "bg-white border-0",
        input: isDarkMode ? "bg-dark text-white border-secondary placeholder-gray" : "bg-light border-0",
        label: isDarkMode ? "text-light" : "text-dark",
        textMuted: isDarkMode ? "text-white-50" : "text-muted",
        table: isDarkMode ? "table-dark table-striped" : "table-hover",
        tableHead: isDarkMode ? "text-white-50" : "bg-light text-secondary",
    }

    const initialFormState = {
        name: "",
        description: "",
        bgColor: "#ffffff",
        image: null
    }

    const [categories, setCategories] = useState([])
    const [filteredCategories, setFilteredCategories] = useState([])
    const [formData, setFormData] = useState(initialFormState)
    const [editingCategoryId, setEditingCategoryId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // ================= FETCH ALL =================
    const loadCategories = async () => {
        try {
            const response = await fetchCategory()
            setCategories(response.data)
            setFilteredCategories(response.data)
        } catch (error) {
            console.error("Error loading categories", error)
            toast.error("Failed to load categories")
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    // ================= INPUT HANDLERS =================
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] })
    }

    // ================= SEARCH =================
    const handleSearch = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        const filtered = categories.filter(cat =>
            cat.name.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredCategories(filtered)
    }

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const payload = new FormData()
        payload.append("name", formData.name)
        payload.append("description", formData.description)
        payload.append("bgColor", formData.bgColor)
        if (formData.image) {
            payload.append("image", formData.image)
        }

        try {
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, payload)
                toast.success("Category updated successfully")
            } else {
                await addCategory(payload)
                toast.success("Category created successfully")
            }

            resetForm()
            loadCategories()
        } catch (error) {
            console.error("Save category failed:", error)
            toast.error("Error saving category")
        } finally {
            setLoading(false)
        }
    }

    // ================= EDIT =================
    const handleEdit = async (categoryId) => {
        try {
            const response = await fetchCategoryById(categoryId)
            const data = response.data

            setEditingCategoryId(categoryId)
            setFormData({
                name: data.name,
                description: data.description,
                bgColor: data.bgColor,
                image: null
            })
        } catch (error) {
            console.error("Error fetching category", error)
            toast.error("Failed to fetch category")
        }
    }

    // ================= DELETE =================
    const handleDelete = async (categoryId) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(categoryId)
                toast.success("Category deleted successfully")
                loadCategories()
            } catch (error) {
                console.error("Error deleting category", error)
                toast.error("Failed to delete category")
            }
        }
    }

    // ================= RESET =================
    const resetForm = () => {
        setFormData(initialFormState)
        setEditingCategoryId(null)
    }

    return (
        <>
            {/* ===== TOAST CONTAINER ===== */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={isDarkMode ? "dark" : "light"}
            />

            <div className={`container-fluid p-4 ${theme.container}`}>
                <div className="row g-4">

                    {/* --- LEFT SECTION: FORM --- */}
                    <div className="col-lg-4 col-md-5">
                        <div className={`card rounded-4 sticky-top ${theme.card}`} style={{ top: "20px", zIndex: 1 }}>
                            <div className={`card-header pt-4 px-4 ${theme.cardHeader}`}>
                                <h4 className="fw-bold text-primary mb-0">
                                    {editingCategoryId ? "Edit Category" : "New Category"}
                                </h4>
                                <p className={`small mb-0 ${theme.textMuted}`}>
                                    {editingCategoryId ? "Update existing details below" : "Fill in the details to create a new category"}
                                </p>
                            </div>
                            <div className="card-body px-4 pb-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className={`form-label fw-semibold ${theme.label}`}>Category Name</label>
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
                                        <label className={`form-label fw-semibold ${theme.label}`}>Description</label>
                                        <textarea
                                            className={`form-control ${theme.input}`}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className={`form-label fw-semibold ${theme.label}`}>Theme Color</label>
                                        <input
                                            type="color"
                                            className="form-control form-control-color"
                                            name="bgColor"
                                            value={formData.bgColor}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className={`form-label fw-semibold ${theme.label}`}>Cover Image</label>
                                        <input
                                            type="file"
                                            className={`form-control ${theme.input}`}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button
                                            type="submit"
                                            className={`btn btn-lg ${editingCategoryId ? "btn-warning text-white" : "btn-primary"}`}
                                            disabled={loading}
                                        >
                                            {loading ? "Processing..." : editingCategoryId ? "Update Category" : "Create Category"}
                                        </button>

                                        {editingCategoryId && (
                                            <button
                                                type="button"
                                                className={`btn ${isDarkMode ? "btn-outline-light" : "btn-light text-muted"}`}
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

                    {/* --- RIGHT SECTION: LIST VIEW --- */}
                    <div className="col-lg-8 col-md-7">
                        <div className={`card rounded-4 h-100 ${theme.card}`}>
                            <div className={`card-header pt-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center ${theme.cardHeader}`}>
                                <h4 className="fw-bold mb-2 mb-md-0">All Categories</h4>

                                {/* ===== SEARCH INPUT ===== */}
                                <input
                                    type="text"
                                    className="form-control w-100 w-md-25 mt-2 mt-md-0"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className={`table align-middle mb-0 ${theme.table}`}>
                                        <thead className={theme.tableHead}>
                                        <tr>
                                            <th className="ps-4 py-3">Category</th>
                                            <th className="py-3">Description</th>
                                            <th className="py-3">Color</th>
                                            <th className="py-3 text-center">Image</th>
                                            <th className="text-end pe-4 py-3">Actions</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat) => (
                                                <tr key={cat.categoryId}>
                                                    <td className="ps-4 fw-semibold">{cat.name}</td>

                                                    <td className={theme.textMuted} style={{ maxWidth: "250px" }}>
                                                        <div className="text-truncate">
                                                            {cat.description || "-"}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className="rounded-circle border"
                                                                style={{ width: "16px", height: "16px", backgroundColor: cat.bgColor }}
                                                            />
                                                            <small className={theme.textMuted}>{cat.bgColor}</small>
                                                        </div>
                                                    </td>

                                                    <td className="text-center">
                                                        <div
                                                            className={`mx-auto rounded-3 overflow-hidden border ${
                                                                isDarkMode ? "border-secondary bg-dark" : "bg-light"
                                                            }`}
                                                            style={{ width: "60px", height: "60px" }}
                                                        >
                                                            {cat.imgUrl ? (
                                                                <img
                                                                    src={cat.imgUrl}
                                                                    alt={cat.name}
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="text-end pe-4">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() => handleEdit(cat.categoryId)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(cat.categoryId)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className={`text-center py-5 ${theme.textMuted}`}>
                                                    No categories found
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
    )
}

export default ManageCategory
