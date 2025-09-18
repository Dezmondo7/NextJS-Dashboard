import { useEffect, useState } from "react";

interface LiveCounterProps {
    count: number;
}

const LiveCounter: React.FC<LiveCounterProps> = ({ count }) => {
    const [displayCount, setDisplayCount] = useState(count);

    // Animate number change
    useEffect(() => {
        if (count !== displayCount) {
            const increment = count > displayCount ? 1 : -1;
            const interval = setInterval(() => {
                setDisplayCount((prev) => {
                    if (prev === count) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + increment;
                });
            }, 300); // speed of the rolling effect
        }
    }, [count, displayCount]);

    return (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-4xl rounded-xl p-4 shadow-lg flex items-center justify-between gap-3">
            <div className="material-symbols-outlined text-5xl">
                Visitors
            </div>    
            <div className="flex justify-end border rounded-sm">
                <div key={displayCount} className="m-1">                
            
                    {displayCount}
                </div>
       
            </div>
    
        </div>
    );
};

export default LiveCounter;