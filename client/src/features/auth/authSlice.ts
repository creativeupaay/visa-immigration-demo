import { createSlice } from "@reduxjs/toolkit";
import { User } from "./authTypes";

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
