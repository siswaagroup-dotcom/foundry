// =============================================================================
// JWT UTILITIES — server-side only
// =============================================================================
import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  sub: string;      // user id
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;      // user id
  sessionId: string;
  iat?: number;
  exp?: number;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}
