import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all orders (including soft-deleted ones for CSV export)
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // Generate CSV content
    const headers = [
      "ID",
      "Created At",
      "First Name",
      "Last Name",
      "Company",
      "Role",
      "Company Size",
      "Email",
      "Phone",
      "Drink",
      "Milk Type",
      "Status",
      "Pickup Code",
      "Ready At",
      "Delivered At",
      "Deleted At",
    ];

    const csvRows = [
      headers.join(","),
      ...(orders || []).map((order) =>
        [
          order.id,
          order.created_at,
          `"${order.first_name}"`,
          `"${order.last_name}"`,
          `"${order.company}"`,
          `"${order.role}"`,
          `"${order.company_size}"`,
          `"${order.email}"`,
          order.phone,
          `"${order.drink}"`,
          `"${order.milk_type}"`,
          order.status,
          order.pickup_code,
          order.ready_at || "",
          order.delivered_at || "",
          order.deleted_at || "",
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="orders.csv"',
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
