import { useEffect, useRef, useState } from "react";

export function useMinimumLoading(isLoading, minDurationMs = 2500) {
  const [visible, setVisible] = useState(isLoading);
  const startRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (isLoading) {
      startRef.current = Date.now();
      setVisible(true);
      return;
    }

    const elapsed = Date.now() - (startRef.current || 0);
    const remaining = minDurationMs - elapsed;

    if (remaining <= 0) {
      setVisible(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, remaining);

    return () => clearTimeout(timeoutRef.current);
  }, [isLoading, minDurationMs]);

  return visible;
}
