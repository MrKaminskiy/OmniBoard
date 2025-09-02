import { useEffect, useRef } from 'react';

export function usePolling<T>(
  callback: () => Promise<T>,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    // Initial call
    callback();

    // Set up interval
    intervalRef.current = setInterval(callback, intervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [callback, intervalMs, enabled]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const startPolling = () => {
    if (enabled) {
      callback();
      intervalRef.current = setInterval(callback, intervalMs);
    }
  };

  return { stopPolling, startPolling };
}
