"Use Client";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  section_id: string;
  session_id: string;
  event_type: string;
  x: number;
  y: number;
  time_spent: number;
  cta_id?: string | null;
  created_at: string;
}

export default function DashboardTable() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("https://kreativeweb3dsupabse.onrender.com/dashboard-data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setEvents(result.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Loading data...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Logged Events</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">Section ID</th>
              <th className="px-4 py-2 border-b">Session ID</th>
              <th className="px-4 py-2 border-b">Event Type</th>
              <th className="px-4 py-2 border-b">X</th>
              <th className="px-4 py-2 border-b">Y</th>
              <th className="px-4 py-2 border-b">Time Spent</th>
              <th className="px-4 py-2 border-b">CTA ID</th>
              <th className="px-4 py-2 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{event.section_id}</td>
                <td className="px-4 py-2 border-b">{event.session_id}</td>
                <td className="px-4 py-2 border-b">{event.event_type}</td>
                <td className="px-4 py-2 border-b">{event.x}</td>
                <td className="px-4 py-2 border-b">{event.y}</td>
                <td className="px-4 py-2 border-b">{event.time_spent}</td>
                <td className="px-4 py-2 border-b">{event.cta_id ?? "-"}</td>
                <td className="px-4 py-2 border-b">{new Date(event.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
