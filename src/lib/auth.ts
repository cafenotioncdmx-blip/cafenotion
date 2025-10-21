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

export function normalizePhoneNumber(phone: string): string {
  // PhoneInput component always returns numbers in E.164 format (e.g., +13105551234)
  // This function validates the format is correct

  if (!phone) {
    throw new Error("Phone number is required");
  }

  if (phone.startsWith("+")) {
    return phone;
  }

  // If somehow a non-E.164 number comes through, throw an error
  throw new Error(
    "Phone number must be in international format (e.g., +1234567890)"
  );
}

export function generatePickupCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
