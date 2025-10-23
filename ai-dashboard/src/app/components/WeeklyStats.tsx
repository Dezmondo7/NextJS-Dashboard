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
                    // Aggregate by hour
                    const hourlyMap: Record<string, number> = {};
                    result.data.forEach(event => {
                        const date = new Date(event.created_at)
                        const hour = new Date(event.created_at).getHours();
                        const label = `${hour}:00`;
                        hourlyMap[label] = (hourlyMap[label] || 0) + 1;
                    });

                    const chartData = Object.entries(hourlyMap)
                        .sort(([a], [b]) => Number(a.split(":")[0]) - Number(b.split(":")[0])) // sort by hour
                        .map(([time, sessions]) => ({ time, sessions }));

                        //testing the console log of the data above
                         console.log("✅ Chart data:", chartData); // <--- add this too

                    setData(chartData);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-10">Loading chart data...</div>;

    return (
        
        <div className="w-full h-[400px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-4 shadow-lg mt-4">
            <h2 className="text-xl font-semibold text-white mb-3">Today’s Sessions by Hour</h2>
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