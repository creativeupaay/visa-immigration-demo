import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL + "/admin",
  withCredentials: true,
});

adminApi.defaults.withCredentials = true;

adminApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // No need to add Authorization header manually; cookies will handle authentication
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

adminApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Process the response if needed, but no need to handle tokens here
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 or 403 — attempt to refresh the tokens
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh tokens using the correct refresh endpoint
        await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Retry the original request after successfully refreshing tokens
        return adminApi(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Only redirect if NOT already on a login/public page
        const PUBLIC_PATHS = ['/login', '/admin/login', '/forgot-password', '/demo', '/mock', '/reset-password'];
        const isAlreadyPublic = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
        if (!isAlreadyPublic) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
