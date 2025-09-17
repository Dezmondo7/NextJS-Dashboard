import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Supabase client (service role key bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);


app.get("/session-data", async (req, res) => {
  console.log("📌 DashboardTable.jsx request received"); // clear indicator
  try {
    const { data, error } = await supabase
      .from("heatmap_events")
      .select("id, section_id, session_id, event_type, x, y, time_spent, cta_id, created_at")
      .order("created_at", { ascending: false })
      .limit(150); // This caps heatmpa events to rows of 150 which is great for the lie feeds and works on page refresh

    if (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});