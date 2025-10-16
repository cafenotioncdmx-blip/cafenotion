import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { 
  getCoffeeOptions, 
  getEnabledCoffeeOptions, 
  updateCoffeeOption 
} from "@/lib/coffee-options";

// GET /api/coffee-options - Get all coffee options (public for register page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get("enabled_only") === "true";

    const filteredOptions = enabledOnly
      ? getEnabledCoffeeOptions()
      : getCoffeeOptions();

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
    const updatedOption = updateCoffeeOption(id, enabled);
    if (!updatedOption) {
      return NextResponse.json(
        { error: "Coffee option not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coffee_option: updatedOption,
    });
  } catch (error) {
    console.error("Update coffee option error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
