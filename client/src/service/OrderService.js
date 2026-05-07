import axios from "axios"


const API_BASE =  "http://localhost:8080/api/v1.0"

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

export const addOrder = async (orderPayload) => {
  return api.post("/admin/orders", orderPayload)
}
