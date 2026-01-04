// src/components/LiveTimer.tsx
import { useEffect, useState } from "react";

export function LiveTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diffSeconds = Math.floor((now - start) / 1000);
      setElapsed(diffSeconds >= 0 ? diffSeconds : 0);
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return <span>{new Date(elapsed * 1000).toISOString().slice(11, 19)}</span>;
}