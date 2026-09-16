// Axios client with JWT auto-attach

/*
This automatically attaches the JWT to every request if one exists in localStorage — meaning individual API calls
(login, register aside) never need to manually handle the auth header.
*/

import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;