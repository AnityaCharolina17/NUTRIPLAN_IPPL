import axios from "axios";

/**
 * API ROOT
 * - Production (Vercel): set VITE_API_URL=https://nutriplanippl-production.up.railway.app
 * - Local dev: optional, bisa kosong (fallback ke proxy / relative)
 */
const API_ROOT = import.meta.env.VITE_API_URL;

/**
 * BASE URL
 * - Jangan tambah /api di sini, karena semua request sudah pakai /api/...
 * - Fallback ke window.location.origin untuk local
 */
const baseURL = API_ROOT || window.location.origin;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Attach JWT token if exists
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nutriplan_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Auto-drop bad tokens to avoid infinite 401 loops
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("nutriplan_token");
    }
    return Promise.reject(error);
  }
);

/**
 * Token helper
 */
export async function setToken(token?: string) {
  if (token) {
    localStorage.setItem("nutriplan_token", token);
  } else {
    localStorage.removeItem("nutriplan_token");
  }
}
