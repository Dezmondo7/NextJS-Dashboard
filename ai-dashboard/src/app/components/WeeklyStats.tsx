"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";



export default function DailyStats() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
useEffect(() => {
    fetch("https://kreativeweb3dsupabse.onrender.com/dashboard-data")
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                const events = result.data;

                // Step 1: Determine time window — last 24 hours
                const now = new Date();
                const start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
                start.setMinutes(0, 0, 0); // round to the hour

                // Step 2: Build continuous 24-hour timeline
                const hourlyMap: Record<string, number> = {};
                const current = new Date(start);

                while (current <= now) {
                    const label = current.toISOString().slice(0, 13).replace("T", " "); // e.g. "2025-10-24 09"
                    hourlyMap[label] = 0;
                    current.setHours(current.getHours() + 1);
                }

                // Step 3: Aggregate event counts within the last 24 hours
                events.forEach(event => {
                    const date = new Date(event.created_at);
                    if (date >= start && date <= now) {
                        const label = date.toISOString().slice(0, 13).replace("T", " ");
                        if (hourlyMap[label] !== undefined) {
                            hourlyMap[label] += 1;
                        }
                    }
                });

                // Step 4: Convert to chart-friendly array
                const chartData = Object.entries(hourlyMap)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([time, sessions]) => ({
                        time: `${time}:00`,
                        sessions,
                    }));

                console.log("✅ Chart data (last 24 hours):", chartData);
                setData(chartData);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
}, []);

    if (loading) return <div className="text-gray-400 text-center py-10">Loading chart data...</div>;

    return (
        
        <div className="w-full h-[400px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-4 shadow-lg mt-4">
            <h2 className="text-xl font-semibold text-white mb-3">The last 24 hours Sessions by Hour</h2>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <XAxis dataKey="time" stroke="#8884d8" />
                    <YAxis stroke="#8884d8" />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <Line type="monotone" dataKey="sessions" stroke="#00b4d8" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}