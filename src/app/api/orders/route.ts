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
    console.log("Starting POST /api/orders");

    // Temporarily bypass authentication for debugging
    // const user = await getCurrentUser();
    // console.log("User from getCurrentUser:", user);

    // if (!user || user.role !== "register") {
    //   console.log("Unauthorized user:", user);
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    console.log("Request body parsed successfully:", body);

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

    console.log("Extracted fields:", {
      first_name,
      last_name,
      company,
      role,
      company_size,
      email,
      phone,
      drink,
      milk_type,
    });

    // Validate that the selected drink is still available (Vercel rebuild)
    console.log("Checking if drink is still available:", drink);
    try {
      // Import the coffee options data directly instead of making HTTP request
      const { getEnabledCoffeeOptions } = await import("@/lib/coffee-options");

      // Get enabled coffee options
      const availableDrinks = getEnabledCoffeeOptions().map(
        (option) => option.name
      );

      console.log("Available drinks:", availableDrinks);

      if (!availableDrinks.includes(drink)) {
        console.log("ERROR: Drink no longer available:", drink);
        return NextResponse.json(
          {
            error: `La opción "${drink}" ya no está disponible. Por favor, selecciona otra opción de café.`,
            code: "DRINK_UNAVAILABLE",
            availableOptions: availableDrinks,
          },
          { status: 400 }
        );
      }
      console.log("Drink validation passed:", drink);
    } catch (error) {
      console.log("Warning: Error accessing coffee options:", error);
      // If we can't validate, continue with the order (fail open)
    }

    // Validate that the selected drink is still available and correct milk type
    let correctedMilkType = milk_type;

    // Define drinks and their milk requirements (simplified approach)
    const drinksWithMilk = [
      "Flat White",
      "Latte",
      "Iced Latte",
      "Iced Matcha Latte",
      "Iced Horchata Matcha",
      "Iced Horchata Coffee",
    ];

    const usesMilk = drinksWithMilk.includes(drink);

    // Correct milk type based on drink requirements
    if (!usesMilk) {
      // If drink doesn't use milk, always set to "Sin leche"
      correctedMilkType = "Sin leche";
    } else if (usesMilk && !milk_type) {
      // If drink uses milk but no milk provided, set default
      correctedMilkType = "Sin leche";
    }

    // Validate required fields (milk_type is only required for drinks that use milk)
    const isMilkTypeRequired = usesMilk;
    if (
      !first_name ||
      !last_name ||
      !company ||
      !role ||
      !company_size ||
      !email ||
      !phone ||
      !drink ||
      (isMilkTypeRequired && (!correctedMilkType || correctedMilkType === ""))
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: first_name, last_name, company, role, company_size, email, phone, drink" +
            (isMilkTypeRequired ? ", milk_type" : ""),
        },
        { status: 400 }
      );
    }

    // Normalize phone number to E.164 format
    console.log("About to normalize phone number");
    const normalizedPhone = normalizePhoneNumber(
      phone,
      process.env.DEFAULT_COUNTRY_CODE
    );
    console.log("Phone normalized:", normalizedPhone);

    // Generate unique pickup code
    console.log("About to generate pickup code");
    const pickupCode = generatePickupCode();
    console.log("Pickup code generated:", pickupCode);

    // Insert order into database
    console.log("About to insert into database");
    console.log("Insert data:", {
      first_name,
      last_name,
      company,
      role,
      company_size,
      email,
      phone: normalizedPhone,
      drink,
      milk_type: correctedMilkType,
      pickup_code: pickupCode,
      status: "queued",
    });

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
        milk_type: correctedMilkType,
        pickup_code: pickupCode,
        status: "queued",
      })
      .select()
      .single();

    console.log("Database insert result:", { data, error });

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
