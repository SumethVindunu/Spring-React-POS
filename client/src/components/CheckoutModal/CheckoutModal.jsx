import React from "react"

const CheckoutModal = ({
  show,
  setShow,
  isDarkMode,
  cart,
  customer,
  cash,
  setCash,
  total,
  processOrder
}) => {
  if (!show) return null

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog">
        <div className={`modal-content ${isDarkMode ? "bg-dark text-white" : ""}`}>

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">Checkout Order</h5>
            <button className="btn-close" onClick={() => setShow(false)}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">

            {/* CUSTOMER */}
            <div className="mb-3">
              <h6>Customer Details</h6>
              <div>Name: {customer.name || "-"}</div>
              <div>Phone: {customer.phone || "-"}</div>
            </div>

            <hr />

            {/* CART ITEMS */}
            {cart.map(item => (
              <div key={item.itemId} className="d-flex justify-content-between">
                <span>{item.name} x {item.qty}</span>
                <span>Rs. {item.qty * item.price}</span>
              </div>
            ))}

            <hr />

            {/* TOTAL */}
            <h6>Total: Rs. {total}</h6>

            {/* CASH INPUT (one line style) */}
            <div className="d-flex align-items-center gap-3 mt-2">
              <p className="mb-0">Cash received</p>

              <input
                type="number"
                className="form-control"
                placeholder="Enter Cash"
                value={cash}
                onChange={(e) => setCash(Number(e.target.value))}
              />
            </div>

            {/* BALANCE */}
            <h6 className="mt-2">Balance: Rs. {cash - total}</h6>

          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={() => setShow(false)}>
              Cancel
            </button>

            <button
              className="btn btn-success"
              disabled={cash < total || cart.length === 0}
              onClick={processOrder}
            >
              Process Order
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CheckoutModal