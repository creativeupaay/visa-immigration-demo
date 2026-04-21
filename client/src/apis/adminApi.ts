import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const PUBLIC_PATHS = [
  '/login', '/admin/login', '/forgot-password',
  '/reset-password', '/demo', '/mock', '/payments',
];
const isPublicPath = () =>
  PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL + "/api/v1/admin",
  withCredentials: true,
});

adminApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only refresh on 401 (token expired/missing), NOT on 403 (permission denied)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        return adminApi(originalRequest);
      } catch (refreshError) {
        console.error("Admin token refresh failed:", refreshError);
        if (!isPublicPath()) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
