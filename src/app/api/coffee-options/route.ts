import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

// GET /api/coffee-options - Get all coffee options (public for register page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get("enabled_only") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (getSupabaseClient() as any)
      .from("coffee_options")
      .select("*")
      .order("sort_order", { ascending: true });

    if (enabledOnly) {
      query = query.eq("enabled", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch coffee options" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coffee_options: data || [] });
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (getSupabaseClient() as any)
      .from("coffee_options")
      .update({ 
        enabled,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update coffee option" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      coffee_option: data 
    });
  } catch (error) {
    console.error("Update coffee option error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
