import { baseApi } from "../../app/api";
import { clearAuth, setAuth, setOtpRequired } from "./authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Login response:", data);
          
          if (data.needsOtp) {
            // Admin login requires OTP
            dispatch(setOtpRequired({ 
              email: credentials.email,
              rememberMe: credentials.rememberMe || false 
            }));
          } else {
            // Direct login success
            dispatch(
              setAuth({
                loading: false,
                isAuthenticated: true,
                user: { role: data.role, token: data.accessToken },
              })
            );
          }
        } catch {}
      },
    }),
    verifyOtp: build.mutation({
      query: (otpData) => ({
        url: "/auth/verify-otp",
        method: "POST",
        data: otpData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("OTP verification successful:", data);
          dispatch(
            setAuth({
              loading: false,
              isAuthenticated: true,
              user: { role: data.role, token: data.accessToken },
            })
          );
        } catch {}
      },
    }),
    logout: build.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearAuth());
        } catch {}
      },
    }),
    register: build.mutation({
      query: (newUser) => ({
        url: "/auth/register",
        method: "POST",
        data: newUser,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuth({
              loading: false,
              user: { role: data.role, token: data.accessToken },
            })
          );
        } catch {}
      },
    }),
    fetchUser: build.query({
      query: () => ({
        url: "/auth/fetch-user",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuth({
              loading: false,
              user: { role: data.role, token: data.accessToken },
            })
          );
        } catch {}
      },
    }),
    forgotPassword: build.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        data: { email },
      }),
    }),
    resetPassword: build.mutation({
      query: ({ token, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        data: { token, newPassword },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useRegisterMutation,
  useFetchUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
