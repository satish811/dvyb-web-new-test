import React, { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isTryOnModalOpen, setTryOnModalOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isTryOnModalOpen, setTryOnModalOpen }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
