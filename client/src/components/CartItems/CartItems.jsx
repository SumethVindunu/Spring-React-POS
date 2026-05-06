import { useTheme } from "../../context/ThemeContext"

const CartItems = ({
    cart = [],
    isDarkMode,
    onRemove,
    onIncrease,
    onDecrease
}) => {

    const { isDarkMode: themeDark } = useTheme()
    const dark = isDarkMode ?? themeDark

    return (
        <ul className={`list-group ${dark ? "bg-transparent" : ""}`}>

            {cart.length === 0 && (
                <small className={dark ? "text-white-50" : "text-muted"}>
                    Cart is empty
                </small>
            )}

            {cart.map(item => (
                <li
                    key={item.itemId}
                    className={`list-group-item d-flex justify-content-between align-items-center
                    ${dark ? "bg-secondary bg-opacity-10 border border-secondary text-white" : ""}`}
                >

                    {/* LEFT SIDE */}
                    <div>
                        <div className="fw-bold">{item.name}</div>

                        <div className="d-flex align-items-center gap-2 mt-1">

                            {/* ➖ BUTTON */}
                            <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => onDecrease && onDecrease(item.itemId)}
                            >
                                −
                            </button>

                            <small className={dark ? "text-white-50" : "text-muted"}>
                                Qty: <b>{item.qty}</b>
                            </small>

                            {/* ➕ BUTTON */}
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => onIncrease && onIncrease(item.itemId)}
                            >
                                +
                            </button>

                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="me-2">
                            Rs. {item.qty * item.price}
                        </div>

                        <button
                            className="btn btn-sm btn-danger"
                            onClick={() => onRemove && onRemove(item.itemId)}
                        >
                            Remove
                        </button>
                    </div>

                </li>
            ))}
        </ul>
    )
}

export default CartItems