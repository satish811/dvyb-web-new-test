import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./compononts/loginForm";
import { useNavigate } from "react-router-dom";
import OtpVerification from "../../../components/common/login/otpVerification";
import cross from "@/assets/common/icons/cross.svg";

const LoginModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("login");
  const [confirmation, setConfirmation] = useState(null);
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();

  // Scroll lock effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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

          {/* Content */}
          {step === "login" ? (
            <LoginForm onOtpSent={handleOtpSent} onGuest={handleGuestCheckout} />
          ) : (
            <OtpVerification
              confirmation={confirmation}
              mobile={mobile}
              onSuccess={handleOtpSuccess}
              onError={handleOtpError}
              onResend={() => setStep("login")}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LoginModal;

// import React, { useState } from "react";
// import LoginModal from "./pages/auth/login/LoginModal";

// const App = () => {
//   const [showLogin, setShowLogin] = useState(false);

//   return (
//     <div className="h-screen flex items-center justify-center bg-[var(--color-secondary)]">
//       <button
//         onClick={() => setShowLogin(true)}
//         className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg"
//       >
//         Open Login
//       </button>

//       {/* The Modal */}
//       <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// };

// export default App;
