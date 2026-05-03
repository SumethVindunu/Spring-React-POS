import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1.0/admin/items";

// Create Item
export const addItem = (itemData) => {
    return axios.post(API_BASE_URL, itemData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Get All Items
export const fetchItems = () => {
    return axios.get(API_BASE_URL);
};

// Get Item By ID
export const fetchItemById = (itemId) => {
    return axios.get(`${API_BASE_URL}/${itemId}`);
};

// Update Item
export const updateItem = (itemId, itemData) => {
    return axios.put(`${API_BASE_URL}/${itemId}`, itemData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Delete Item
export const deleteItem = (itemId) => {
    return axios.delete(`${API_BASE_URL}/${itemId}`);
};
