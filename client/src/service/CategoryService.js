import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1.0/admin/categories";

export const addCategory = async (categoryFormData) => {
    return await axios.post(BASE_URL, categoryFormData);
}

export const fetchCategory = async () => {
    return await axios.get(BASE_URL);
}

export const fetchCategoryById = async (categoryId) => {
    return await axios.get(`${BASE_URL}/${categoryId}`);
}

export const deleteCategory = async (categoryId) => {
    return await axios.delete(`${BASE_URL}/${categoryId}`);
}

export const updateCategory = async (categoryId, categoryFormData) => {
    return await axios.put(`${BASE_URL}/${categoryId}`, categoryFormData);
}