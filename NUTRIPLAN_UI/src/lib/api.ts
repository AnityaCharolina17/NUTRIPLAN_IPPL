import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutriplan_token');
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export async function setToken(token?: string) {
  if (token) {
    localStorage.setItem('nutriplan_token', token);
  } else {
    localStorage.removeItem('nutriplan_token');
  }
}
