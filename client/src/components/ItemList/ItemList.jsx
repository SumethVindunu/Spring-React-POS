import { useEffect, useState } from "react"
import { useTheme } from "../../context/ThemeContext"
import { fetchItems } from "../../service/ItemService"

const ItemList = ({ selectedCategoryId, onAddToCart, cart = [] }) => {

    const { isDarkMode } = useTheme()

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchItems().then(res => {
            setItems(res.data || [])
            setLoading(false)
        })
    }, [])

    // ✅ calculate available stock from cart
    const getAvailableQty = (item) => {
        const cartItem = cart.find(c => c.itemId === item.itemId)
        return item.qty - (cartItem?.qty || 0)
    }

    const filteredItems = selectedCategoryId
        ? items.filter(item => item.categoryId === selectedCategoryId)
        : items

    const cardClass = isDarkMode
        ? "card p-3 bg-secondary bg-opacity-10 border border-secondary text-white"
        : "card p-3 bg-white shadow-sm"

    if (loading) return <small>Loading...</small>

    return (
        <div className="row">
            {filteredItems.length === 0 ? (
                <small>No items found</small>
            ) : (
                filteredItems.map(item => {

                    const availableQty = getAvailableQty(item)

                    return (
                        <div className="col-md-3 mb-3" key={item.itemId}>
                            <div className={cardClass}>

                                {item.imgUrl && (
                                    <img
                                        src={item.imgUrl}
                                        alt={item.name}
                                        style={{ height: "100px", objectFit: "cover", width: "100%" }}
                                    />
                                )}

                                <h6>{item.name}</h6>
                                <p>Rs. {item.price}</p>

                                {/* ✅ LIVE STOCK */}
                                <p>
                                    Quantity: <b>{availableQty}</b>
                                </p>

                                <button
                                    className="btn btn-sm btn-primary"
                                    disabled={availableQty <= 0}
                                    onClick={() => onAddToCart(item)}
                                >
                                    {availableQty > 0 ? "Add to Cart" : "Out of Stock"}
                                </button>

                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}

export default ItemList