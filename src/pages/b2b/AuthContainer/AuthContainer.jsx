// components/b2b/AuthContainer/AuthContainer.jsx
import React, { useState, useEffect } from "react";
import LoginForm from "../../../components/b2b/login/LoginForm";
import B2BRegistrationModal from "../resigration/registrationModal";
import cross from "@/assets/common/icons/cross.svg";
import B2BAuthService from "../../../services/b2bAuthService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const AuthContainer = ({ isOpen, onClose }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const { switchUserType } = useAuth();

  const handleLogin = async (credentials) => {
    setAuthError("");
    setLoading(true);
    try {
      const result = await B2BAuthService.login(credentials.email, credentials.password);

      if (result.success == true) {
        // Redirect based on user role
        if (result.user?.role === "B2B") {
          console.log("Redirecting to B2B url");
          navigate("/usertype=b2b");
        } else {
          console.log("Redirecting to B2C url");
          navigate("/");
        }
        onClose();
      }
    } catch (err) {
      setAuthError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setAuthError("");
    setLoading(true);
    try {
      const result = await B2BAuthService.loginWithGoogle();

      if (result.success) {
        console.log("Google login successful:", result);

        switchUserType("b2b");
        navigate("/usertype=b2b");
        onClose();
      }
    } catch (err) {
      setAuthError(err.message || "Google login failed");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setAuthError("");
    try {
      await B2BAuthService.registerB2B(formData);
      // After successful registration, switch to B2B route
      switchUserType("b2b");
      setShowRegister(false);
      onClose();
    } catch (err) {
      setAuthError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white shadow-xl w-full max-w-md mx-4 p-4 rounded-lg font-outfit">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 h-6 w-6 mb-2"
        >
          <img src={cross} alt="cross" />
        </button>

        {showRegister ? (
          <B2BRegistrationModal
            isOpen={showRegister}
            onClose={() => {
              setShowRegister(false);
              setAuthError("");
            }}
            onSubmit={handleRegister}
            loading={loading}
            authError={authError}
          />
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            onShowRegister={() => setShowRegister(true)}
            onGoogleLogin={handleGoogleLogin} // Pass Google login handler
            loading={loading}
            authError={authError}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
