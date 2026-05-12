import { useState } from "react"
import CartItems from "../../components/CartItems/CartItems"
import CartSummary from "../../components/CartSummary/CartSummary"
import CategoryList from "../../components/CategoryList/CategoryList"
import CustomerForm from "../../components/CustomerForm/CustomerForm"
import ItemList from "../../components/ItemList/ItemList"
import { useTheme } from "../../context/ThemeContext"
import CheckoutModal from "../../components/CheckoutModal/CheckoutModal"
import { addOrder } from "../../service/OrderService"
import { jsPDF } from "jspdf"
import { Printer, Download } from "lucide-react"

const Explore = () => {

  const { isDarkMode } = useTheme()

  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [cash, setCash] = useState(0)
  const [itemRefreshKey, setItemRefreshKey] = useState(0)

  const [customer, setCustomer] = useState({
    name: "",
    phone: ""
  })

  const [lastOrder, setLastOrder] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // ADD TO CART
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find(ci => ci.itemId === item.itemId)

      if (!existing) {
        return [...prev, { ...item, qty: 1 }]
      }

      return prev.map(ci =>
        ci.itemId === item.itemId
          ? { ...ci, qty: ci.qty + 1 }
          : ci
      )
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId))
  }

  const increaseQty = (itemId) => {
    setCart(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    )
  }

  const decreaseQty = (itemId) => {
    setCart(prev =>
      prev
        .map(item =>
          item.itemId === itemId
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter(item => item.qty > 0)
    )
  }

  const total = cart.reduce((sum, it) => sum + it.qty * it.price, 0)

  // Generate PDF Receipt
  const generateReceipt = (orderData) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("POS RECEIPT", pageWidth / 2, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Your Store Name", pageWidth / 2, 28, { align: "center" })
    doc.text("123 Main Street, City", pageWidth / 2, 33, { align: "center" })
    doc.text("Tel: 077-1234567", pageWidth / 2, 38, { align: "center" })

    // Divider
    doc.setLineWidth(0.5)
    doc.line(10, 42, pageWidth - 10, 42)

    // Order Info
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(`Order #: ${orderData.orderId}`, 10, 50)
    doc.text(`Date: ${new Date(orderData.createDate).toLocaleString()}`, 10, 57)
    doc.text(`Cashier: ${orderData.cashierName}`, 10, 64)

    doc.setFont("helvetica", "normal")
    doc.text(`Customer: ${orderData.customerName || "Walk-in"}`, 10, 71)
    doc.text(`Phone: ${orderData.phoneNumber || "-"}`, 10, 78)

    // Divider
    doc.line(10, 82, pageWidth - 10, 82)

    // Items Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Item", 10, 89)
    doc.text("Qty", 110, 89)
    doc.text("Price", 135, 89)
    doc.text("Total", 165, 89)

    doc.line(10, 92, pageWidth - 10, 92)

    // Items
    doc.setFont("helvetica", "normal")
    let y = 99
    orderData.items.forEach((item, index) => {
      const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2)
      doc.text(item.name?.substring(0, 30) || "", 10, y)
      doc.text(String(item.quantity), 110, y)
      doc.text(`Rs. ${Number(item.price).toFixed(2)}`, 135, y)
      doc.text(`Rs. ${itemTotal}`, 165, y)
      y += 7
    })

    // Divider
    doc.line(10, y + 2, pageWidth - 10, y + 2)

    // Totals
    y += 12
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Subtotal:", 120, y)
    doc.text(`Rs. ${Number(orderData.totalAmount).toFixed(2)}`, 165, y)

    y += 8
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Cash Received:", 120, y)
    doc.text(`Rs. ${Number(orderData.cashReceivedived).toFixed(2)}`, 165, y)

    y += 7
    doc.text("Change:", 120, y)
    doc.text(`Rs. ${Number(orderData.changeAmount).toFixed(2)}`, 165, y)

    // Footer
    y += 15
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your purchase!", pageWidth / 2, y, { align: "center" })
    doc.text("Please come again!", pageWidth / 2, y + 6, { align: "center" })

    // Save
    doc.save(`Receipt_${orderData.orderId}.pdf`)
  }

  const processOrder = async () => {

    try {

      const cashierName = localStorage.getItem("username") || ""

      const payload = {
        customerName: customer.name,
        phoneNumber: customer.phone,

        cartItems: cart.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.qty
        })),

        totalAmount: total,
        cashReceivedived: cash,
        changeAmount: cash - total,
        cashierName
      }

      const response = await addOrder(payload)

      const orderData = {
        ...response.data,
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.qty
        }))
      }

      setLastOrder(orderData)
      setShowReceipt(true)

      setCart([])
      setCash(0)
      setShowCheckout(false)
      setCustomer({
        name: "",
        phone: ""
      })
      setItemRefreshKey(prev => prev + 1)

    } catch (error) {

      console.error("Order Error:", error)
      if (error.response) {
        console.error("Server response:", error.response.status, error.response.data)
        alert(`Failed to place order: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      } else {
        alert("Failed to place order")
      }
    }
  }

  const theme = {
    container: isDarkMode ? "bg-dark min-vh-100" : "bg-light min-vh-100",
    card: isDarkMode
      ? "bg-secondary bg-opacity-10 border border-secondary text-white"
      : "bg-white border-0 shadow-sm",
    cardHeader: isDarkMode
      ? "border-bottom border-secondary text-white"
      : "border-bottom text-dark"
  }

  return (
    <div className={`container-fluid p-4 ${theme.container}`}>
      <div className="row g-4">

        {/* LEFT */}
        <div className="col-lg-8">

          <div className={`card rounded-4 mb-4 ${theme.card}`}>
            <div className={`card-header px-4 py-3 ${theme.cardHeader}`}>
              <h5 className="fw-bold mb-0">Display Category</h5>
            </div>

            <div className="card-body px-4 py-3">
              <CategoryList
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
              />
            </div>
          </div>

          <div className={`card rounded-4 ${theme.card}`}>
            <div className={`card-header px-4 py-3 ${theme.cardHeader}`}>
              <h5 className="fw-bold mb-0">Display Items</h5>
            </div>

            <div className="card-body px-4 py-3">
              <ItemList
                selectedCategoryId={selectedCategoryId}
                onAddToCart={addToCart}
                cart={cart}
                refreshKey={itemRefreshKey}
              />
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-lg-4">

          <div className={`card rounded-4 mb-4 ${theme.card}`}>
            <div className={`card-header px-4 py-3 ${theme.cardHeader}`}>
              <h5 className="fw-bold mb-0">Cart Summary</h5>
            </div>

            <div className="card-body px-4 py-3">
              <CartSummary
                cart={cart}
                onCheckout={() => setShowCheckout(true)}
              />
            </div>
          </div>

          <div className={`card rounded-4 mb-4 ${theme.card}`}>
            <div className={`card-header px-4 py-3 ${theme.cardHeader}`}>
              <h5 className="fw-bold mb-0">Cart Items</h5>
            </div>

            <div className="card-body px-4 py-3">
              <CartItems
                cart={cart}
                isDarkMode={isDarkMode}
                onRemove={removeFromCart}
                onIncrease={increaseQty}
                onDecrease={decreaseQty}
              />
            </div>
          </div>

          <div className={`card rounded-4 ${theme.card}`}>
            <div className={`card-header px-4 py-3 ${theme.cardHeader}`}>
              <h5 className="fw-bold mb-0">Customer Form</h5>
            </div>

            <div className="card-body px-4 py-3">
              <CustomerForm
                customer={customer}
                setCustomer={setCustomer}
              />
            </div>
          </div>

        </div>
      </div>

      <CheckoutModal
        show={showCheckout}
        setShow={setShowCheckout}
        isDarkMode={isDarkMode}
        cart={cart}
        customer={customer}
        cash={cash}
        setCash={setCash}
        total={total}
        processOrder={processOrder}
      />

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 2000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
          <div className={`card rounded-4 ${isDarkMode ? "bg-dark border-secondary text-white" : "bg-white border-0 shadow-lg"}`} style={{ width: "90%", maxWidth: "450px" }}>
            <div className={`p-4 border-bottom ${isDarkMode ? "border-secondary" : ""}`}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className={`fw-bold mb-0 ${isDarkMode ? "text-white" : "text-dark"}`}>
                  <Printer size={24} className="me-2" />
                  Order Complete!
                </h4>
                <button className="btn btn-sm btn-close" onClick={() => setShowReceipt(false)}></button>
              </div>
            </div>

            <div className="p-4">
              <div className={`text-center mb-4 p-4 rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-20" : "bg-light"}`}>
                <h2 className="fw-bold text-success mb-1">Thank You!</h2>
                <p className={`mb-0 ${isDarkMode ? "text-white-50" : "text-muted"}`}>Order #{lastOrder.orderId}</p>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className={isDarkMode ? "text-white-50" : "text-muted"}>Customer</span>
                  <span className="fw-semibold">{lastOrder.customerName || "Walk-in"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className={isDarkMode ? "text-white-50" : "text-muted"}>Items</span>
                  <span className="fw-semibold">{lastOrder.items?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className={isDarkMode ? "text-white-50" : "text-muted"}>Cash</span>
                  <span className="fw-semibold">${Number(lastOrder.cashReceivedived).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={isDarkMode ? "text-white-50" : "text-muted"}>Change</span>
                  <span className="fw-semibold">${Number(lastOrder.changeAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className={`p-3 rounded-4 text-center mb-4 ${isDarkMode ? "bg-primary bg-opacity-20" : "bg-primary text-white"}`}>
                <small>Total Amount</small>
                <h2 className="fw-bold mb-0">Rs. {Number(lastOrder.totalAmount).toFixed(2)}</h2>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary flex-grow-1 rounded-pill py-2"
                  onClick={() => generateReceipt(lastOrder)}
                >
                  <Download size={18} className="me-2" />
                  Download PDF
                </button>
                <button
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowReceipt(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Explore