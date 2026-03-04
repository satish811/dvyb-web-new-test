// components/b2b/AuthContainer/AuthContainer.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  // Scroll lock effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogin = async (credentials) => {
    setAuthError("");
    setLoading(true);
    try {
      const result = await B2BAuthService.login(credentials.email, credentials.password);

      if (result.success == true) {
        // Set B2B session flag immediately so navbar hides Virtual Try On
        sessionStorage.setItem("villy_b2b_mode", "true");
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
        // Set B2B session flag immediately so navbar hides Virtual Try On
        sessionStorage.setItem("villy_b2b_mode", "true");
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
      // Set B2B session flag immediately so navbar hides Virtual Try On
      sessionStorage.setItem("villy_b2b_mode", "true");
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

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white shadow-xl w-full max-w-md mx-4 p-4 rounded-lg font-outfit"
          onClick={(e) => e.stopPropagation()}
        >
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
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default AuthContainer;

