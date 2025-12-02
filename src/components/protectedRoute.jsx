// src/routes/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../pages/b2c/login/loginModel";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // When we hit a protected route and there is no user, show the modal
  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [loading, user]);

  // While checking auth, you can return a light placeholder
  if (loading) return null; // or a spinner

  // If user is authenticated, render the protected content
  if (user) return children;

  // Not authenticated: show login modal overlay; keep the URL the same
  return (
    <>
      {showLogin && (
        <LoginModal
          isOpen={true}
          onClose={() => {
            setShowLogin(false);
            // Optional: if user still isn't logged in after closing, send them away
            if (!user) {
              // navigate back or to home
              if (location.key !== "default") navigate(-1);
              else navigate("/");
            }
          }}
        />
      )}
    </>
  );
}
