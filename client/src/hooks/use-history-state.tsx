
import { useEffect, useCallback } from 'react';

type HistoryState = {
  type: string;
  id?: string;
  data?: any;
};

export function useHistoryState(
  type: string,
  onPop: () => void,
  id?: string,
  data?: any
) {
  const pushState = useCallback(() => {
    const state: HistoryState = { type, id, data };
    window.history.pushState(state, '', window.location.pathname);
  }, [type, id, data]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState;
      if (state?.type === type && (!id || state.id === id)) {
        onPop();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [type, id, onPop]);

  return pushState;
}
