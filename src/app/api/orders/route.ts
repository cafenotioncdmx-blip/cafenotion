import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUser,
  normalizePhoneNumber,
  generatePickupCode,
} from "@/lib/auth";

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "register") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      company,
      role,
      company_size,
      email,
      phone,
      drink,
      milk_type,
    } = body;

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !company ||
      !role ||
      !company_size ||
      !email ||
      !phone ||
      !drink ||
      !milk_type
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: first_name, last_name, company, role, company_size, email, phone, drink, milk_type",
        },
        { status: 400 }
      );
    }

    // Normalize phone number to E.164 format
    const normalizedPhone = normalizePhoneNumber(
      phone,
      process.env.DEFAULT_COUNTRY_CODE
    );

    // Generate unique pickup code
    const pickupCode = generatePickupCode();

    // Insert order into database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("orders")
      .insert({
        first_name,
        last_name,
        company,
        role,
        company_size,
        email,
        phone: normalizedPhone,
        drink,
        milk_type,
        pickup_code: pickupCode,
        status: "queued",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
      pickup_code: pickupCode,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/orders - List orders (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "bar" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("orders")
      .select("*")
      .is("deleted_at", null) // Exclude soft-deleted records
      .order("created_at", { ascending: true });

    if (
      status &&
      ["queued", "in_progress", "ready", "delivered"].includes(status)
    ) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders - Soft delete order (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting deleted_at timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("orders")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("deleted_at", null); // Only delete if not already deleted

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
