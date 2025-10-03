import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode) {
      return NextResponse.json(
        { error: "Passcode is required" },
        { status: 400 }
      );
    }

    let role: "register" | "bar" | "admin" | null = null;

    if (passcode === process.env.REGISTER_PASSCODE) {
      role = "register";
    } else if (passcode === process.env.BAR_PASSCODE) {
      role = "bar";
    } else if (passcode === "admin123") {
      // You can change this or add to env
      role = "admin";
    }

    if (!role) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    const token = await createToken(role);

    const response = NextResponse.json({ success: true, role });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
