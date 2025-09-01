import { useEffect, useRef, useCallback } from 'react';

interface UseBackgroundRefreshOptions {
  refreshInterval: number; // in minutes
  onRefresh: () => void | Promise<void>;
  enabled?: boolean;
}

export function useBackgroundRefresh({ 
  refreshInterval, 
  onRefresh, 
  enabled = true 
}: UseBackgroundRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  const startRefresh = useCallback(() => {
    if (!enabled || refreshInterval <= 0) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Convert minutes to milliseconds
    const intervalMs = refreshInterval * 60 * 1000;
    
    console.log(`🔄 Starting background refresh with ${refreshInterval} minute interval`);
    
    intervalRef.current = setInterval(async () => {
      try {
        console.log('🔄 Background refresh triggered');
        await onRefresh();
        lastRefreshRef.current = Date.now();
      } catch (error) {
        console.error('❌ Background refresh failed:', error);
      }
    }, intervalMs);
  }, [refreshInterval, onRefresh, enabled]);

  const stopRefresh = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Stopping background refresh');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getTimeUntilNextRefresh = useCallback(() => {
    if (!intervalRef.current || !enabled || refreshInterval <= 0) {
      return null;
    }
    
    const intervalMs = refreshInterval * 60 * 1000;
    const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
    const timeUntilNext = intervalMs - timeSinceLastRefresh;
    
    return Math.max(0, timeUntilNext);
  }, [refreshInterval, enabled]);

  // Start/restart refresh when dependencies change
  useEffect(() => {
    if (enabled && refreshInterval > 0) {
      startRefresh();
    } else {
      stopRefresh();
    }

    // Cleanup on unmount
    return () => {
      stopRefresh();
    };
  }, [startRefresh, stopRefresh, enabled, refreshInterval]);

  return {
    startRefresh,
    stopRefresh,
    getTimeUntilNextRefresh,
    isActive: intervalRef.current !== null
  };
}
