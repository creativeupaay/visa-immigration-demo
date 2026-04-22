/**
 * tokenStore.ts
 *
 * A simple module-level token holder. This avoids the store → api → axiosBaseQuery → store
 * circular dependency, while still allowing axiosBaseQuery to read the current access token.
 *
 * Usage:
 *  - Call `setAccessToken(token)` from authSlice or any auth flow when a token is received.
 *  - axiosBaseQuery reads it via `getAccessToken()` on every request.
 */

let currentToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  currentToken = token;
};

export const getAccessToken = (): string | null => currentToken;
