import React, { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext({
  heroReady: false,
  setHeroReady: () => {},
  modelsReady: false,
  setModelsReady: () => {},
  isAppReady: false,
});

export const LoadingProvider = ({ children }) => {
  const [heroReady, setHeroReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // App is ready when BOTH Hero component AND 3D models are ready
  const isAppReady = heroReady && modelsReady;

  const value = {
    heroReady,
    setHeroReady: useCallback((ready) => {
      console.log("Hero ready status:", ready);
      setHeroReady(ready);
    }, []),
    modelsReady,
    setModelsReady: useCallback((ready) => {
      console.log("Models ready status:", ready);
      setModelsReady(ready);
    }, []),
    isAppReady,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoadingContext must be used within LoadingProvider");
  }
  return context;
};
