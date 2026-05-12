import { useState } from "react"
import CartItems from "../../components/CartItems/CartItems"
import CartSummary from "../../components/CartSummary/CartSummary"
import CategoryList from "../../components/CategoryList/CategoryList"
import CustomerForm from "../../components/CustomerForm/CustomerForm"
import ItemList from "../../components/ItemList/ItemList"
import { useTheme } from "../../context/ThemeContext"
import CheckoutModal from "../../components/CheckoutModal/CheckoutModal"
import { addOrder } from "../../service/OrderService"

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

// ...existing code...
const processOrder = async () => {

  try {

    const cashierName = localStorage.getItem("username") || "" // <-- read username

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
      // match server field name (it's "cashReceivedived" in OrderRequest)
      cashReceivedived: cash,
      changeAmount: cash - total,
      cashierName
    }

    const response = await addOrder(payload)

    console.log(response.data)

    alert("Order Placed Successfully!")

    setCart([])
    setCash(0)
    setShowCheckout(false)
    setCustomer({
      name: "",
      phone: ""
    })
    setItemRefreshKey(prev => prev + 1)

  } catch (error) {

    // show full server response to diagnose 500s
    console.error("Order Error:", error)
    if (error.response) {
      console.error("Server response:", error.response.status, error.response.data)
      alert(`Failed to place order: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
    } else {
      alert("Failed to place order")
    }
  }
}
// ...existing code...

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
    </div>
  )
}

export default Explore