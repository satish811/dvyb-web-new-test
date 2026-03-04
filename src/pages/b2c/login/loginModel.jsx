import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./compononts/loginForm";
import { useNavigate } from "react-router-dom";
import OtpVerification from "../../../components/common/login/otpVerification";
import cross from "@/assets/common/icons/cross.svg";
import B2BLoginForm from "./b2bLoginForm";
import B2BRegisterForm from "./b2bRegisterForm";
import B2BAuthService from "../../../../src/services/b2bAuthService";

const LoginModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("login"); // login, otp, b2bLogin, b2bRegister
  const [confirmation, setConfirmation] = useState(null);
  const [mobile, setMobile] = useState("");
  const [userType, setUserType] = useState("b2c"); // b2c, b2b
  const [b2bLoading, setB2bLoading] = useState(false);
  const [formError, setFormError] = useState(""); // Error message to display in form
  const navigate = useNavigate();

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

  if (!isOpen) return null;

  const handleOtpSent = (confirmationResult, number) => {
    setConfirmation(confirmationResult);
    setMobile(number);
    setStep("otp");
  };

  const handleOtpSuccess = ({ user, userData }) => {
    onClose();
    console.log("🎉 Login Successful!", {
      userId: user.uid,
      userType: userData.role,
      collection: userData.collection,
    });

    // ✅ Redirect based on user type
    if (userData.route) {
      navigate(userData.route, { replace: true });
    } else {
      // Fallback redirect
      window.location.reload();
    }
  };

  const handleOtpError = (error) => {
    console.error("OTP verification failed:", error);
    // Error is handled in OtpVerification component
  };

  const handleResendOtp = () => {
    // You might want to implement resend logic here
    console.log("Resend OTP requested for:", mobile);
  };

  const handleGuestCheckout = () => {
    navigate("/checkout", { state: { guest: true } });
  };

  const handleB2BLogin = async (credentials) => {
    setB2bLoading(true);
    setFormError(""); // Clear previous errors
    try {
      const result = await B2BAuthService.login(credentials.email, credentials.password);
      if (result.success) {
        const userData = await B2BAuthService.getUserCompleteProfile(result.user.uid);
        onClose();
        if (userData.data.route) {
          navigate(userData.data.route, { replace: true });
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("B2B Login error:", error);
      // Show error inline instead of alert
      const errorMessage = error.message || "Login failed. Please check your credentials.";
      setFormError(errorMessage);
      // Don't close modal or navigate - let user try again
    } finally {
      setB2bLoading(false);
    }
  };

  const handleB2BRegister = async (userData) => {
    setB2bLoading(true);
    setFormError(""); // Clear previous errors
    try {
      const result = await B2BAuthService.registerB2B(userData);
      if (result.success) {
        setFormError("");
        alert("✅ Registration successful! Please login with your credentials.");
        setStep("b2bLogin");
      }
    } catch (error) {
      console.error("B2B Registration error:", error);
      // Show error inline instead of alert
      const errorMessage = typeof error === 'string' ? error : (error.message || "Registration failed. Please try again.");
      setFormError(errorMessage);
      // Don't navigate away - let user fix the error
    } finally {
      setB2bLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setB2bLoading(true);
    try {
      const result = await B2BAuthService.loginWithGoogle();
      if (result.success) {
        const userData = await B2BAuthService.getUserCompleteProfile(result.user.uid);
        onClose();
        if (userData.data.route) {
          navigate(userData.data.route, { replace: true });
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(error.message);
    } finally {
      setB2bLoading(false);
    }
  };

  const switchToB2C = () => {
    setUserType("b2c");
    setStep("login");
  };

  const switchToB2BLogin = () => {
    setUserType("b2b");
    setStep("b2bLogin");
  };

  const switchToB2BRegister = () => {
    setUserType("b2b");
    setStep("b2bRegister");
  };

  const renderContent = () => {
    if (step === "otp") {
      return (
        <OtpVerification
          confirmation={confirmation}
          mobile={mobile}
          onSuccess={handleOtpSuccess}
          onError={handleOtpError}
          onResend={() => setStep("login")}
        />
      );
    }

    if (step === "b2bLogin") {
      return (
        <>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <span className="font-semibold">Error: </span>{formError}
            </div>
          )}
          <B2BLoginForm
            onSubmit={handleB2BLogin}
            onGoogleLogin={handleGoogleLogin}
            onSwitchToRegister={switchToB2BRegister}
            loading={b2bLoading}
          />
        </>
      );
    }

    if (step === "b2bRegister") {
      return (
        <>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <span className="font-semibold">⚠️ </span>{formError}
            </div>
          )}
          <B2BRegisterForm
            onSubmit={handleB2BRegister}
            loading={b2bLoading}
            onSwitchToLogin={switchToB2BLogin}
          />
        </>
      );
    }

    // Default B2C Login
    return (
      <>
        <LoginForm onOtpSent={handleOtpSent} onGuest={handleGuestCheckout} />

        {/* Divider */}
        <div className="flex items-center justify-center text-gray-500 my-2">
          <span className="mx-2 text-sm">OR</span>
        </div>

        {/* B2B Login Option */}
        <div className="text-center text-sm text-gray-500">
          Want to buy in bulk?{" "}
          <button
            type="button"
            onClick={switchToB2BLogin}
            className="text-primary underline hover:text-primary/80 font-medium"
          >
            Login for B2B
          </button>
        </div>

        {/* B2B Registration Option */}
        <div className="text-center text-sm text-gray-500 mt-1">
          New to B2B?{" "}
          <button
            type="button"
            onClick={switchToB2BRegister}
            className="text-primary underline hover:text-primary/80 font-medium"
          >
            Register as B2B
          </button>
        </div>
      </>
    );
  };

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
          className="relative bg-white shadow-xl w-full max-w-md mx-4 p-4 font-outfit rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 h-6 w-6 mb-2"
          >
            <img src={cross} alt="cross" />
          </button>

          {/* Back Button (for B2B screens) */}
          {(step === "b2bLogin" || step === "b2bRegister") && (
            <button
              onClick={() => setStep("login")}
              className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          {/* Content */}
          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LoginModal;