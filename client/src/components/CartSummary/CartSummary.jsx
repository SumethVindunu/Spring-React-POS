import { useTheme } from "../../context/ThemeContext"

const CartSummary = ({ cart = [], onCheckout }) => {

    const { isDarkMode } = useTheme()

    const totalItems = cart.reduce((sum, it) => sum + it.qty, 0)
    const total = cart.reduce((sum, it) => sum + it.qty * it.price, 0)

    return (
        <div>
            <div className="d-flex justify-content-between mb-2">
                <small className={isDarkMode ? "text-white-50" : "text-muted"}>Items</small>
                <strong>{totalItems}</strong>
            </div>

            <h6>Total: Rs. {total}</h6>

            <button
                className="btn btn-success w-100 mt-2"
                disabled={cart.length === 0}
                onClick={onCheckout}
            >
                Checkout
            </button>
        </div>
    )
}

export default CartSummary