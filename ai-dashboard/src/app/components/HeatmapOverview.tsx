import { useEffect, useState, useRef } from "react";
import LiveCounter from './LiveCounter.tsx'




const HeatmapOverview = () => {
  const [screenshotUrl, setScreenshotUrl] = useState(null)


  //set events to pull data from supabase
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [sessionIds, setSessionIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://kreativeweb3dsupabse.onrender.com/dashboard-data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setEvents(result.data);
        //counting the data rows returned - this returns the fetch call in the front end (.limit(1000)) (testServer / app.get(/dashboard-data))
          console.log("📊 Total events returned:", result.data.length);  
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

    // Get all unique session IDs - need to identify just one session on the screen to stop multiple visits data showing on screen.
    const sessionIds = [...new Set(events.map(e => e.session_id))];


    // Sort them by first event timestamp (so “previous” and “next” make sense)
    const orderedSessionIds = sessionIds.sort((a, b) => {
      const aTime = new Date(events.find(e => e.session_id === a).timestamp);
      const bTime = new Date(events.find(e => e.session_id === b).timestamp);
      return aTime - bTime;
    })

    setSessionIds(orderedSessionIds);
    setCurrentSessionIndex(0);


    // 2️⃣ - Choose one session to visualize (here: the first one)
    const selectedSessionId = sessionIds[currentSessionIndex];
    console.log("Using session:", selectedSessionId); // optional
    console.log("Ordered sessions:", orderedSessionIds); //orderingSessions for performance review
   // console.log("Number of events fetched", orderedSessionIds.data.length)

    // 3️⃣ - Filter only that session's events
    const filtered = events
      .filter(e => e.session_id === selectedSessionId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    setClicks(
      filtered.map(event => ({
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

  //Canvas overlay
  useEffect(() => {
    if (events.length === 0) return;

    const originalWidth = 1400;
    const originalHeight = 900;

    const targetWidth = overlay ? 1400 : 800;
    const targetHeight = overlay ? 900 : 600;
      
      // selecting sessionIds and filtering through to match the correct selected session
      const selectedSessionId = sessionIds[currentSessionIndex];
      const filteredEvents = events.filter(e => e.session_id === selectedSessionId);

    setClicks(
      // mapping through the new filtered events to display the correctly matched session
      filteredEvents.map(event => ({
        x: (event.x / originalWidth) * targetWidth, //the *0.85 takes into consideration aspect ratio distortion .5% threshold the front end (adjustable per section)
        y: (event.y / originalHeight) * targetHeight, // see above
        intensity: 3,
      }))
    );
  }, [events, overlay, sessionIds, currentSessionIndex]);

      if (loading) return <div className="text-gray-400 text-center py-10">Loading User Journeys...</div>;

  return (
    <div className="p-4">
      {/* Toggle Button */}
      <button
        onClick={() => setOverlay(!overlay)}
        className="mb-4 px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer"
      >
        {overlay ? "Side-by-Side Mode" : "Overlay Mode"}
      </button>

      {/* Previous and next session button */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setCurrentSessionIndex(i => Math.max(i - 1, 0))}
          disabled={currentSessionIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded border-2 border-gray-500 disabled:opacity-50 cursor-pointer"
        >
          ← Previous
        </button>

        <span className="text-gray-800">
          User  {currentSessionIndex + 1} of {sessionIds.length}
          <p></p>ID {sessionIds[currentSessionIndex]}
        </span>

        <button
          onClick={() => setCurrentSessionIndex(i => Math.min(i + 1, sessionIds.length - 1))}
          disabled={currentSessionIndex === sessionIds.length - 1}
          className="px-4 py-2 bg-gray-200 rounded border-2 hover: disabled:opacity-50 cursor-pointer"
        >
          Next →
        </button>
      </div>



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

export default HeatmapOverview;
