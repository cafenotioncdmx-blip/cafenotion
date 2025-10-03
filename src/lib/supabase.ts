import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Order = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  drink: string;
  notes?: string;
  status: "queued" | "in_progress" | "ready" | "delivered";
  pickup_code: string;
  ready_at?: string;
  delivered_at?: string;
};

export type OrderStatus = "queued" | "in_progress" | "ready" | "delivered";
