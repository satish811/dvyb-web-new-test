// src/App.jsx
import React from "react";
import { FilterProvider } from "./context/FilterContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import ScrollToTop from "./components/utils/scrollToTop";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ErrorBoundary from "./components/utils/ErrorBoundary";

function App() {
  return (
    <FilterProvider>
      <AuthProvider>
        <ErrorBoundary>
          <WishlistProvider>
            <CartProvider>
              <ScrollToTop />
              <AppRoutes />
            </CartProvider>
          </WishlistProvider>
        </ErrorBoundary>
      </AuthProvider>
    </FilterProvider>
  );
}

export default App;
