export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}