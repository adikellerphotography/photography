
import { useEffect, useCallback, useState } from 'react';

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
  const [isActive, setIsActive] = useState(false);

  const pushState = useCallback(() => {
    if (!isActive) {
      const state: HistoryState = { type, id, data };
      window.history.pushState(state, '', window.location.pathname);
      setIsActive(true);
    }
  }, [type, id, data, isActive]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState;
      if (state?.type === type && (!id || state.id === id)) {
        onPop();
        setIsActive(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [type, id, onPop]);

  return pushState;
}
