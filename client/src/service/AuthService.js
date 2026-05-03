import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1.0";

export const loginApi = (authData) => {
    return axios.post(`${API_BASE_URL}/login`, authData);
};
