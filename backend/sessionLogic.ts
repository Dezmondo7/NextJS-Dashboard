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
    const { data, error } = await supabase
      .from("heatmap_events")
      .select("id, section_id, session_id, event_type, x, y, time_spent, cta_id, created_at")
      .order("created_at", { ascending: false })
      .limit(1000); // This caps heatmpa events to rows of 150 which is great for the lie feeds and works on page refresh

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Route
router.get("/", getSessions);

export default router;