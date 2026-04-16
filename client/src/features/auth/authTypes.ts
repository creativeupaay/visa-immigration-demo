export enum Roles {
    USER="USER",
    ADMIN="ADMIN"
}

export interface User {
  token: string;
  role: Roles;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  role?: Roles;
  needsOtp?: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  rememberMe?: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  accessToken: string;
  role: Roles;
}
