import { createContext, useContext } from 'react';
import { useCommuteData } from '../hooks/useCommuteData';

const CommuteDataContext = createContext(null);

export function CommuteProvider({ children, session }) {
  const commuteData = useCommuteData(session);

  return <CommuteDataContext.Provider value={commuteData}>{children}</CommuteDataContext.Provider>;
}

export function useCommute() {
  const context = useContext(CommuteDataContext);
  if (!context) {
    throw new Error('useCommute must be used within a CommuteProvider');
  }
  return context;
}
