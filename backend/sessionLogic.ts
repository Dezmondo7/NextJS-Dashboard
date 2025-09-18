import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Supabase client (service role key bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);


const getSessions = async (req: Request, res: Response ) => {
  console.log("📌 DashboardTable.jsx request received"); // clear indicator
  try {
    const today = new Date().toISOString().split("T")[0]; // "2025-09-18"
    const { data, error } = await supabase
      .from("heatmap_events")
      .select("session_id, created_at")
      .eq("created_at::date", today)   // 👈 only today’s rows
      .order("created_at", { ascending: false })
      .limit(50000); // This caps heatmpa events to rows of 150 which is great for the lie feeds and works on page refresh
       

    if (error) throw error;

     const uniqueCount = new Set(data.map(e => e.session_id)).size;

    res.json({ success: true, count: uniqueCount, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Route
router.get("/", getSessions);

export default router;