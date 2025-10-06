import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";




const JourneyVisualiser = () => {
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



  const [clicks, setClicks] = useState<{ x: number, y: number }[]>([]);

  useEffect(() => {
    if (events.length === 0) return; // wait until events are loaded

    // 1️Get all unique session IDs - need to identify just one session on the screen to stop multiple visits data showing on screen.
    const sessionIds = [...new Set(events.map(e => e.session_id))];

    // 2️⃣ - Choose one session to visualize (here: the first one)
    const selectedSessionId = sessionIds[0];
    console.log("Using session:", selectedSessionId); // optional

    // 3️⃣ - Filter only that session's events
    const filtered = events
      .filter(e => e.session_id === selectedSessionId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // ensure chronological order this is crucial to get the most recent data frpom supabase

    setClicks(
      filtered.map(event => ({
        x: event.x,
        y: event.y,
        timestamp: new Date(event.timestamp).getTime()
        // intensity: 3, // or use a value from event if needed
      })));
  }, [events]);


  const [overlay, setOverlay] = useState(false); //toggle state
  const canvasRef = useRef(null);


  useEffect(() => {
    // The URL of the backend endpoint
    setScreenshotUrl("http://localhost:5000/screenshot")
  }, []);

  const resampleClicks = (clicks, windowMs = 500) => {
    const result = [];
    if (!clicks.length) return result;

    let windowStart = clicks[0].timestamp;
    let windowPoints = [];

    clicks.forEach(p => {
      if (p.timestamp - windowStart <= windowMs) {
        windowPoints.push(p);
      } else {
        // average the window
        const avgX = windowPoints.reduce((sum, p) => sum + p.x, 0) / windowPoints.length;
        const avgY = windowPoints.reduce((sum, p) => sum + p.y, 0) / windowPoints.length;
        result.push({ x: avgX, y: avgY });

        windowStart = p.timestamp;
        windowPoints = [p];
      }
    });

    // last window
    if (windowPoints.length) {
      const avgX = windowPoints.reduce((sum, p) => sum + p.x, 0) / windowPoints.length;
      const avgY = windowPoints.reduce((sum, p) => sum + p.y, 0) / windowPoints.length;
      result.push({ x: avgX, y: avgY });
    }

    return result;
  };

  useEffect(() => {
    if (!canvasRef.current || clicks.length === 0) return;


    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    //  full screen / high DPI
    /* const dpr = window.devicePixelRatio || 1;
     canvas.width = window.innerWidth * dpr;
     canvas.height = window.innerHeight * dpr;
     canvas.style.width = `${window.innerWidth}px`;
     canvas.style.height = `${window.innerHeight}px`;
     ctx.scale(dpr, dpr); */

    // Clear previous render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //gradient from start to end
    const grad = ctx.createLinearGradient(
      clicks[0].x,
      clicks[0].y,
      clicks[clicks.length - 1].x,
      clicks[clicks.length - 1].y
    );
    grad.addColorStop(0, "#a0eaff");
    grad.addColorStop(1, "#a020f0")

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();


    /* sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); */

    // ✅ Define drawJourney inside the effect
    const drawJourney = (ctx, clicks) => {
      if (!clicks || clicks.length < 2) return;


      // ✅ Optional: sort by timestamp if needed
      // const sorted = [...clicks].sort((a, b) => a.timestamp - b.timestamp);
      const orderedClicks = [...clicks].sort((a, b) => a.timestamp - b.timestamp);
      const cleanedClicks = resampleClicks(orderedClicks, 500); // 0.5s window

      const threshold = 100; // pixels
      const filteredClicks = cleanedClicks.filter((p, i, arr) => {
        if (i === 0) return true;
        const dx = p.x - arr[i - 1].x;
        const dy = p.y - arr[i - 1].y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
      });

      // ✅ Create the D3 line generator
      const lineGen = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCatmullRom.alpha(0.5)); // smooth the spikes

      // ✅ Generate an SVG path string
      const pathString = lineGen(clicks);
      if (!pathString) {
        console.warn("⚠️ Path is null — check your clicks array");
        return;
      }

      // ✅ Convert to Canvas Path2D
      const path = new Path2D(pathString);

      // ✅ Draw the path on canvas
      ctx.stroke(path);
    };


    // ✅ Finally: call it!
    drawJourney(ctx, clicks);

  }, [clicks]);

  useEffect(() => {
    if (events.length === 0) return;

    const originalWidth = 1400;
    const originalHeight = 900;

    const targetWidth = overlay ? 1400 : 800;
    const targetHeight = overlay ? 900 : 600;

    setClicks(
      events.map(event => ({
        x: (event.x / originalWidth) * targetWidth, //the *0.85 takes into consideration aspect ratio distortion .5% threshold the front end (adjustable per section)
        y: (event.y / originalHeight) * targetHeight, // see above
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
        {overlay ? "Side-by-Side Mode" : "Journey Mode"}
      </button>

      {overlay ? (
        // Overlay mode: canvas on top of screenshot
        <div className="relative w-full max-w-5xl aspect-h-9 mx-auto">
          <img
            src={screenshotUrl}
            alt="Landing Page Screenshot"
            width={1400}
            height={900}
            className="w-full h-full block object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none h-full w-full"
            width={1400}
            height={900}
          // style={{ width: "100%", height: "auto" }}
          />
        </div>
      ) : (
        // Side-by-side mode: canvas below screenshot
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-2/3 w-full bg-gray-100 flex justify-center items-center">
            <img
              src={screenshotUrl}
              width={800}
              height={600}
              alt="Landing Page Screenshot"
              className="w-full h-auto object-contain rounded shadow"
            />
          </div>
          <div className="md:w-1/3 w-full bg-white p-4 shadow rounded">
            <div>      <p>Heatmap / Metrics / AI insights here</p> </div>
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

export default JourneyVisualiser;
