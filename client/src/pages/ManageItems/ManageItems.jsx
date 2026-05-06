import { useEffect, useState } from "react"
import {
    addItem,
    fetchItems,
    deleteItem,
    fetchItemById,
    updateItem
} from "../../service/ItemService.js"
import { fetchCategory } from "../../service/CategoryService.js"
import { useTheme } from "../../context/ThemeContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const ManageItems = () => {

    const { isDarkMode } = useTheme()
    const storedRole = localStorage.getItem("role") || "";
    const isAdmin = storedRole === "ROLE_ADMIN" || storedRole === "ADMIN";

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
        price: "",
        qty: "",
        categoryId: "",
        image: null
    }

    const [items, setItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState(initialFormState)
    const [editingItemId, setEditingItemId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // ================= FETCH DATA =================
    const loadItems = async () => {
        try {
            const response = await fetchItems()
            setItems(response.data)
            setFilteredItems(response.data)
        } catch (error) {
            console.error("Error loading items", error)
            toast.error("Failed to load items")
        }
    }

    const loadCategories = async () => {
        try {
            const response = await fetchCategory()
            setCategories(response.data)
        } catch (error) {
            console.error("Error loading categories", error)
            toast.error("Failed to load categories")
        }
    }
    useEffect(() => {
        if (!isAdmin) {
            toast.error("Access denied - admin only")
            return
        }
        loadItems()
        loadCategories()
    }, [isAdmin])



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
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase()) || 
            (item.categoryId && item.categoryId.toLowerCase().includes(value.toLowerCase()))
        )
        setFilteredItems(filtered)
    }

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const payload = new FormData()
        payload.append("name", formData.name)
        payload.append("description", formData.description)
        payload.append("price", formData.price)
        payload.append("qty", formData.qty)
        payload.append("categoryId", formData.categoryId)
        if (formData.image) {
            payload.append("image", formData.image)
        }

        try {
            if (editingItemId) {
                await updateItem(editingItemId, payload)
                toast.success("Item updated successfully")
            } else {
                await addItem(payload)
                toast.success("Item created successfully")
            }

            resetForm()
            loadItems()
        } catch (error) {
            console.error("Save item failed:", error)
            toast.error("Error saving item")
        } finally {
            setLoading(false)
        }
    }

    // ================= EDIT =================
    const handleEdit = async (itemId) => {
        try {
            const response = await fetchItemById(itemId)
            const data = response.data

            setEditingItemId(itemId)
            setFormData({
                name: data.name,
                description: data.description,
                price: data.price,
                qty: data.qty,
                categoryId: data.categoryId,
                image: null
            })
        } catch (error) {
            console.error("Error fetching item", error)
            toast.error("Failed to fetch item details")
        }
    }

    // ================= DELETE =================
    const handleDelete = async (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteItem(itemId)
                toast.success("Item deleted successfully")
                loadItems()
            } catch (error) {
                console.error("Error deleting item", error)
                toast.error("Failed to delete item")
            }
        }
    }

    // ================= RESET =================
    const resetForm = () => {
        setFormData(initialFormState)
        setEditingItemId(null)
    }

    // ================= HELPER =================
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.categoryId === categoryId);
        return category ? category.name : "Unknown";
    }

    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme={isDarkMode ? "dark" : "light"}
        />

        <div className={`container-fluid p-4 ${theme.container}`}>
          <div className="row g-4">
            {/* --- LEFT SECTION: FORM --- */}
            <div className="col-lg-4 col-md-5">
              <div
                className={`card rounded-4 sticky-top ${theme.card}`}
                style={{ top: "20px", zIndex: 1 }}
              >
                <div className={`card-header pt-4 px-4 ${theme.cardHeader}`}>
                  <h4 className="fw-bold text-primary mb-0">
                    {editingItemId ? "Edit Item" : "New Item"}
                  </h4>
                  <p className={`small mb-0 ${theme.textMuted}`}>
                    {editingItemId
                      ? "Update item details below"
                      : "Fill in the details to create a new item"}
                  </p>
                </div>
                <div className="card-body px-4 pb-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label
                        className={`form-label fw-semibold ${theme.label}`}
                      >
                        Item Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${theme.input}`}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        className={`form-label fw-semibold ${theme.label}`}
                      >
                        Description
                      </label>
                      <textarea
                        className={`form-control ${theme.input}`}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="2"
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <label
                          className={`form-label fw-semibold ${theme.label}`}
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${theme.input}`}
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label
                          className={`form-label fw-semibold ${theme.label}`}
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          className={`form-control ${theme.input}`}
                          name="qty"
                          value={formData.qty}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        className={`form-label fw-semibold ${theme.label}`}
                      >
                        Category
                      </label>
                      <select
                        className={`form-select ${theme.input}`}
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label
                        className={`form-label fw-semibold ${theme.label}`}
                      >
                        Cover Image
                      </label>
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
                        className={`btn btn-lg ${
                          editingItemId
                            ? "btn-warning text-white"
                            : "btn-primary"
                        }`}
                        disabled={loading || !isAdmin}
                      >
                        {loading
                          ? "Processing..."
                          : editingItemId
                          ? "Update Item"
                          : "Create Item"}
                      </button>

                      {editingItemId && (
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

            {/* --- RIGHT SECTION: LIST VIEW --- */}
            <div className="col-lg-8 col-md-7">
              <div className={`card rounded-4 h-100 ${theme.card}`}>
                <div
                  className={`card-header pt-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center ${theme.cardHeader}`}
                >
                  <h4 className="fw-bold mb-2 mb-md-0">All Items</h4>

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
                          <th className="ps-4 py-3">Item</th>
                          <th className="py-3">Category</th>
                          <th className="py-3">Price</th>
                          <th className="py-3">Qty</th>
                          <th className="py-3 text-center">Image</th>
                          <th className="text-end pe-4 py-3">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                            <tr key={item.itemId}>
                              <td className="ps-4 fw-semibold">
                                <div>{item.name}</div>
                                <small
                                  className={theme.textMuted}
                                  style={{
                                    maxWidth: "150px",
                                    display: "inline-block",
                                  }}
                                >
                                  <div className="text-truncate">
                                    {item.description || "-"}
                                  </div>
                                </small>
                              </td>

                              <td>
                                <span className="badge bg-secondary bg-opacity-25 text-body">
                                  {getCategoryName(item.categoryId)}
                                </span>
                              </td>

                              <td className="fw-bold text-success">
                                Rs.   
                                {item.price != null
                                  ? Number(item.price).toFixed(2)
                                  : "0.00"}
                              </td>

                              <td>
                                <span
                                  className={`badge ${
                                    item.qty > 10
                                      ? "bg-primary"
                                      : item.qty > 0
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                >
                                  {item.qty} in stock
                                </span>
                              </td>

                              <td className="text-center">
                                <div
                                  className={`mx-auto rounded-3 overflow-hidden border ${
                                    isDarkMode
                                      ? "border-secondary bg-dark"
                                      : "bg-light"
                                  }`}
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  {item.imgUrl ? (
                                    <img
                                      src={item.imgUrl}
                                      alt={item.name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                                      No Image
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="text-end pe-4">
                                {isAdmin && (
                                  <>
                                    <button
                                      className="btn btn-sm btn-primary me-2"
                                      onClick={() => handleEdit(item.itemId)}
                                    >
                                      Edit
                                    </button>

                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDelete(item.itemId)}
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
                              colSpan="6"
                              className={`text-center py-5 ${theme.textMuted}`}
                            >
                              No items found
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
}

export default ManageItems