import { useTheme } from "../../context/ThemeContext"

const CustomerForm = ({ customer, setCustomer }) => {
  const { isDarkMode } = useTheme()

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value
    })
  }

  const inputClass = isDarkMode
    ? "form-control bg-dark text-white border-secondary"
    : "form-control"

  const labelClass = isDarkMode
    ? "text-white me-3 mb-0"
    : "text-dark me-3 mb-0"

  return (
    <>
      {/* NAME */}
      <div className="d-flex align-items-center mb-3">
        <p className={labelClass} style={{ minWidth: "120px" }}>
          Customer Name
        </p>

        <input
          type="text"
          name="name"
          value={customer.name}
          className={inputClass}
          onChange={handleChange}
        />
      </div>

      {/* PHONE */}
      <div className="d-flex align-items-center">
        <p className={labelClass} style={{ minWidth: "120px" }}>
          Phone Number
        </p>

        <input
          type="text"
          name="phone"
          value={customer.phone}
          className={inputClass}
          onChange={handleChange}
        />
      </div>
    </>
  )
}

export default CustomerForm