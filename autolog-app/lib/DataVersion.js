import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * A tiny global "data changed" signal. Screens load their data on focus, but a
 * restore (or any bulk change) can happen while a screen is already focused, so
 * it never re-reads. Bumping the version lets mounted screens reload immediately.
 */
const DataVersionContext = createContext({ version: 0, bumpDataVersion: () => {} });

export function DataVersionProvider({ children }) {
  const [version, setVersion] = useState(0);
  const bumpDataVersion = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <DataVersionContext.Provider value={{ version, bumpDataVersion }}>
      {children}
    </DataVersionContext.Provider>
  );
}

export const useDataVersion = () => useContext(DataVersionContext);
