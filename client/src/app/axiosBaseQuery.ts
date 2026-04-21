import { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { 
  AxiosRequestConfig, 
  AxiosError, 
  InternalAxiosRequestConfig,
} from 'axios';
// NOTE: Do NOT import store here — it creates a circular dependency
// (store → api → axiosBaseQuery → store). The window.location redirect
// achieves the same effect (full page reload resets Redux state).

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
}

interface CustomError {
  status?: number;
  data?: unknown;
}

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

/** Pages where we must NOT redirect to login (would cause infinite loop) */
const PUBLIC_PATHS = [
  '/login',
  '/admin/login',
  '/forgot-password',
  '/reset-password',
  '/demo',
  '/mock',
  '/payments',
];

const isPublicPath = () =>
  PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosBaseQuery = ({
  baseUrl,
  refreshUrl,
}: {
  baseUrl: string;
  refreshUrl: string;
}): BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
  },
  unknown,
  CustomError
> => {

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;

      // Only attempt token refresh for 401 (Unauthorized / expired token).
      // Do NOT intercept 403 — that means Permission Denied (different role),
      // not an auth failure. Intercepting 403 causes unnecessary refresh loops.
      if (
        error.response?.status === 401 &&
        !originalRequest.url?.includes(refreshUrl) &&
        !originalRequest.url?.includes('/auth/logout') &&
        !originalRequest._retry
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;

          try {
            const refreshResponse = await axiosInstance.post<RefreshResponse>(
              refreshUrl
            );
            const newAccessToken = refreshResponse.data.accessToken;
            
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError as AxiosError, null);
            // Only redirect when NOT already on a public page
            if (!isPublicPath()) {
              const isAdminPath = window.location.pathname.startsWith('/admin');
              window.location.href = isAdminPath ? '/admin/login' : '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        });
      }

      return Promise.reject(error);
    }
  );

  return async (args) => {
    const { url, method, data, params } = args;

    try {
      const result = await axiosInstance.request({
        url,
        method,
        data,
        params,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
};

export default axiosBaseQuery;