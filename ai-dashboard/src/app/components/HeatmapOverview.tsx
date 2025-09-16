import { useEffect, useState, useRef } from "react";



  const HeatmapOverview = () => {
  const [screenshotUrl, setScreenshotUrl] = useState(null)


  //set events to pull data from supabase
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



  const [clicks, setClicks] = useState([]);

  useEffect(() => {
    if (events.length === 0) return; // wait until events are loaded

    setClicks(events.map(event => ({
      x: event.x,
      y: event.y,
      intensity: 3, // or use a value from event if needed
    })));
  }, [events]);


  const [overlay, setOverlay] = useState(false); //toggle state
  const canvasRef = useRef(null);


  useEffect(() => {
    // The URL of the backend endpoint
    setScreenshotUrl("http://localhost:5000/screenshot")
  }, []);

  useEffect(() => {
    if (!canvasRef.current || clicks.length === 0) return;


    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Clear previous render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clicks.forEach(({ x, y, intensity }) => {
      const radius = 30; // spread of the heat
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      // More intensity → more opaque center
      gradient.addColorStop(0, `rgba(255,0,0,${Math.min(0.8, 0.2 * intensity)})`);
      gradient.addColorStop(1, "rgba(255,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }, [clicks, overlay]);

  useEffect(() => {
    if (events.length === 0) return;

    const originalWidth = 1440;
    const originalHeight = 900;

    const targetWidth = overlay ? 1440 : 800;
    const targetHeight = overlay ? 900 : 600;

    setClicks(
      events.map(event => ({
        x: (event.x / originalWidth) * targetWidth * 0.75, //the *0.85 takes into consideration aspect ratio distortion .5% threshold the front end (adjustable per section)
        y: (event.y / originalHeight) * targetHeight * 0.85, // see above
        intensity: 3,
      }))
    );
  }, [events, overlay]);

  return (
    <div className="p-4">
      {/* Toggle Button */}
      <button
        onClick={() => setOverlay(!overlay)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {overlay ? "Side-by-Side Mode" : "Overlay Mode"}
      </button>

      {overlay ? (
        // Overlay mode: canvas on top of screenshot
        <div className="relative w-full max-w-5xl mx-auto">
          <img
            src={screenshotUrl}
            alt="Landing Page Screenshot"
            className="w-full h-auto block"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
            width={1440}
            height={900}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ) : (
        // Side-by-side mode: canvas below screenshot
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-2/3 w-full bg-gray-100 flex justify-center items-center">
            <img
              src={screenshotUrl}
              alt="Landing Page Screenshot"
              className="w-full h-auto object-contain rounded shadow"
            />
          </div>
          <div className="md:w-1/3 w-full bg-white p-4 shadow rounded">
            <p>Heatmap / Metrics / AI insights here</p>
            <canvas
              ref={canvasRef}
              className="border border-gray-300 mt-4"
              width={800}
              height={600}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
        
      )}

     {/*} <table className="min-w-full border border-gray-300">
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
      </table> */}
    </div>

  );
};

export default HeatmapOverview;
