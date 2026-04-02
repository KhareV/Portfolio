"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const LoadingContext = createContext({
  heroReady: false,
  setHeroReady: () => {},
  modelsReady: false,
  setModelsReady: () => {},
  isAppReady: false,
});

export const LoadingProvider = ({ children }) => {
  const [heroReady, setHeroReadyState] = useState(false);
  const [modelsReady, setModelsReadyState] = useState(false);
  const readyTimeoutRef = useRef(null);

  // App is ready when BOTH Hero component AND 3D models are ready
  const isAppReady = heroReady && modelsReady;

  const setHeroReady = useCallback((ready) => {
    setHeroReadyState(ready);
  }, []);

  const setModelsReady = useCallback((ready) => {
    setModelsReadyState(ready);
  }, []);

  // Fallback: if models don't load within 5s, mark as ready anyway
  useEffect(() => {
    if (!modelsReady) {
      readyTimeoutRef.current = setTimeout(() => {
        console.warn("Models timeout - marking as ready");
        setModelsReadyState(true);
      }, 5000);
    }

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, [modelsReady]);

  const value = {
    heroReady,
    setHeroReady,
    modelsReady,
    setModelsReady,
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
