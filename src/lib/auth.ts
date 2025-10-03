import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.COOKIE_SECRET!);

export type UserRole = "register" | "bar" | "admin";

export interface User {
  role: UserRole;
  authenticated: boolean;
}

export async function createToken(role: UserRole): Promise<string> {
  return await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      role: payload.role as UserRole,
      authenticated: true,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

export function normalizePhoneNumber(
  phone: string,
  countryCode: string = "52"
): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it already starts with country code, return as is
  if (digits.startsWith(countryCode)) {
    return `+${digits}`;
  }

  // If it's a local number, add country code
  if (digits.length === 10) {
    return `+${countryCode}${digits}`;
  }

  // If it's already in E.164 format, return as is
  if (digits.startsWith("52") && digits.length === 12) {
    return `+${digits}`;
  }

  // Default: add country code
  return `+${countryCode}${digits}`;
}

export function generatePickupCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
