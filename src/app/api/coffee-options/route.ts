import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Temporary in-memory storage for coffee options (until database table is created)
const initialCoffeeOptions = [
  {
    id: "1",
    name: "Espresso",
    display_name: "1 – Espresso",
    uses_milk: false,
    enabled: true,
    sort_order: 1,
  },
  {
    id: "2",
    name: "Americano",
    display_name: "2 – Americano",
    uses_milk: false,
    enabled: true,
    sort_order: 2,
  },
  {
    id: "3",
    name: "Flat White",
    display_name: "3 – Flat White",
    uses_milk: true,
    enabled: true,
    sort_order: 3,
  },
  {
    id: "4",
    name: "Latte",
    display_name: "4 – Latte",
    uses_milk: true,
    enabled: true,
    sort_order: 4,
  },
  {
    id: "5",
    name: "Iced Americano",
    display_name: "5 – Iced Americano",
    uses_milk: false,
    enabled: true,
    sort_order: 5,
  },
  {
    id: "6",
    name: "Iced Latte",
    display_name: "6 – Iced Latte",
    uses_milk: true,
    enabled: true,
    sort_order: 6,
  },
  {
    id: "7",
    name: "Iced Matcha Latte",
    display_name: "7 – Iced Matcha Latte",
    uses_milk: true,
    enabled: true,
    sort_order: 7,
  },
  {
    id: "8",
    name: "Iced Horchata Matcha",
    display_name: "8 – Iced Horchata Matcha",
    uses_milk: true,
    enabled: true,
    sort_order: 8,
  },
  {
    id: "9",
    name: "Iced Horchata Coffee",
    display_name: "9 – Iced Horchata Coffee",
    uses_milk: true,
    enabled: true,
    sort_order: 9,
  },
];

// Mutable state for runtime modifications
// eslint-disable-next-line prefer-const
let coffeeOptionsState = [...initialCoffeeOptions];

// GET /api/coffee-options - Get all coffee options (public for register page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get("enabled_only") === "true";

    const filteredOptions = enabledOnly
      ? coffeeOptionsState.filter((option) => option.enabled)
      : coffeeOptionsState;

    return NextResponse.json({ coffee_options: filteredOptions });
  } catch (error) {
    console.error("Fetch coffee options error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/coffee-options - Update coffee option (bar/admin only)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "bar" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, enabled } = body;

    if (!id || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: id, enabled" },
        { status: 400 }
      );
    }

    // Update the in-memory state
    const optionIndex = coffeeOptionsState.findIndex(
      (option) => option.id === id
    );
    if (optionIndex === -1) {
      return NextResponse.json(
        { error: "Coffee option not found" },
        { status: 404 }
      );
    }

    coffeeOptionsState[optionIndex].enabled = enabled;

    return NextResponse.json({
      success: true,
      coffee_option: coffeeOptionsState[optionIndex],
    });
  } catch (error) {
    console.error("Update coffee option error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
