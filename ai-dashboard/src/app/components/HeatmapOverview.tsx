import { useEffect, useState } from "react";


const HeatmapOverview = () => {
  const [screenshotUrl, setScreenshotUrl] = useState(null)

  useEffect(() => {
    // The URL of the backend endpoint
    setScreenshotUrl("http://localhost:5000/screenshot")
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* Screenshot + Heatmap */}
      <div className="md:w-2/3 w-full bg-gray-100 flex justify-center items-center">
        {!screenshotUrl ? (
          <p>Loading screenshot...</p>
        ) : (
          <img
            src={screenshotUrl}
            alt="Landing Page Screenshot"
            className="w-full h-auto object-contain rounded shadow"
          />
        )}
      </div>

      {/* Metrics & AI Insights */}
      <div className="md:w-1/3 w-full bg-white p-4 shadow rounded">
        <p>Something overlay / metrics / AI insights go here</p>
      </div>
    </div>
  );
};

export default HeatmapOverview;
