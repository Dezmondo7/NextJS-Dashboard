import { useEffect, useState } from "react";

const HeatmapOverview = ({ url }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fetchScreenshot = async () => {
      try {
        const response = await fetch(`/api/screenshot?url=${encodeURIComponent("https://reaktwebdesign.co.uk/")}`);
        if (!response.ok) throw new Error("Screenshot failed");

        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        setImgSrc(objectURL);
      } catch (err) {
        console.error("❌ Screenshot fetch error:", err);
        setError(err.message);
      }
    };

    fetchScreenshot();
  }, [url]);

  if (error) return <div>Error: {error}</div>;
  if (!imgSrc) return <div>Loading screenshot...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* Screenshot + Heatmap */}
      <div className="md:w-2/3 w-full bg-gray-100 flex justify-center items-center">
        <img
          src={imgSrc}
          alt="Landing Page Screenshot"
          className="w-full h-auto object-contain rounded shadow"
        />
      </div>

      {/* Metrics & AI Insights */}
      <div className="md:w-1/3 w-full bg-white p-4 shadow rounded">
        <p>Something overlay / metrics / AI insights go here</p>
      </div>
    </div>
  );
};

export default HeatmapOverview;
