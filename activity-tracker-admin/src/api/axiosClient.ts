import axios from 'axios';

// ZMIANA: Używamy HTTP i portu 5123, skoro tam działa Twój Swagger
const BASE_URL = 'https://activitis.hostingasp.pl.hostingasp.pl/api/'; 

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Dodaj token do każdego zapytania, jeśli istnieje
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;