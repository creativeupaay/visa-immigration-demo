import { createSlice } from "@reduxjs/toolkit";
import { User } from "./authTypes";
import { setAccessToken } from "../../app/tokenStore";

interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  needsOtp: boolean;
  otpEmail: string;
  rememberMe: boolean;
}

const initialState: AuthState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  needsOtp: false,
  otpEmail: "",
  rememberMe: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.loading = action.payload.loading || false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.needsOtp = false;
      state.otpEmail = "";
      // Sync token to the module-level tokenStore so axiosBaseQuery can
      // attach it as Authorization: Bearer on every request.
      // This is critical for deployed cross-origin environments where
      // httpOnly cookies are not sent by the browser.
      setAccessToken(action.payload.user?.token ?? null);
    },
    setOtpRequired(state, action) {
      state.needsOtp = true;
      state.otpEmail = action.payload.email;
      state.rememberMe = action.payload.rememberMe || false;
      state.loading = false;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.needsOtp = false;
      state.otpEmail = "";
      state.rememberMe = false;
      // Clear the in-memory token so no stale Bearer header is sent.
      setAccessToken(null);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    clearOtpState(state) {
      state.needsOtp = false;
      state.otpEmail = "";
      state.rememberMe = false;
    },
  },
});

export const { setAuth, clearAuth, setOtpRequired, setLoading, clearOtpState } = authSlice.actions;
export default authSlice.reducer;
