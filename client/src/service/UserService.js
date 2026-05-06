import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1.0/admin";

export const registerUser = async (userData) => {
  return await axios.post(`${BASE_URL}/register`, userData);
};

export const fetchUsers = async () => {
  return await axios.get(`${BASE_URL}/users`);
};

export const fetchUserById = async (userId) => {
  return await axios.get(`${BASE_URL}/users/${userId}`);
};

export const updateUser = async (userId, userData) => {
  return await axios.put(`${BASE_URL}/users/${userId}`, userData);
};

export const deleteUser = async (userId) => {
  return await axios.delete(`${BASE_URL}/users/${userId}`);
};