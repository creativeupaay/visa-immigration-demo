import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config();


interface TokenPayload {
  id: string;
  role: string;
  roleId : string;
  userName : string;
  email : string;
}


export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRATION || "7200", 10) });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "604800", 10) });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
};
