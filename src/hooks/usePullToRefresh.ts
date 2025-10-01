import { useState, useCallback } from 'react';

import { logError } from '../utils/errorHandling';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
}

export const usePullToRefresh = ({ onRefresh }: UsePullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      logError(error, 'usePullToRefresh.handleRefresh');
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
  };
};