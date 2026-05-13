import React, { useState, useEffect } from "react";
import OtpInput from "./otpInput";
import { verifyOtp } from "../../../services/otpService";
import { Loader2 } from "lucide-react";
import otpBanner from "../../../assets/common/login/loginBanner.svg";

const OtpVerification = ({ confirmation, mobile, onSuccess, onError, onResend }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [attempts, setAttempts] = useState(0); // Track failures
  const [maxAttempts] = useState(3); // Configurable max
  const [locked, setLocked] = useState(false); // Lock after max attempts
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const performVerification = async (enteredOtp) => {
    if (locked || !enteredOtp || enteredOtp.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const { user, userData } = await verifyOtp(confirmation, enteredOtp, mobile);

      console.log("✅ OTP Verified & User Collection:", {
        userId: user.uid,
        collection: userData.collection,
        role: userData.role,
        route: userData.route,
      });

      setAttempts(0);
      onSuccess({ user, userData });
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      let msg = "The OTP you entered is incorrect.";
      if (err.code) {
        if (err.code === "auth/invalid-verification-code") msg = "Invalid OTP. Please try again.";
        else if (err.code === "auth/code-expired") msg = "OTP expired. Please resend.";
      }

      setError(msg);
      onError(err);

      if (newAttempts >= maxAttempts) {
        setLocked(true);
        setTimeout(() => {
          onResend();
          setLocked(false);
          setAttempts(0);
        }, 5000);
      }
    } finally {
      setLoading(false);
      if (!locked) setOtp("");
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    performVerification(otp);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return; // Prevent spam

    setResendCooldown(60); // 60 second cooldown
    setError("");
    setOtp("");
    setLocked(false);
    setAttempts(0); // Reset attempts on resend
    onResend();
  };

  // Get current user type for display
  const getCurrentUserType = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("usertype") === "b2b" ? "B2B" : "B2C";
  };

  return (
    <div className="bg-white py-2 sm:py-2 md:py-6 w-full max-w-md mx-auto font-outfit">
      <img src={otpBanner} alt="otp-banner" className="w-full object-cover h-52" />
      <div className="text-center m-4 p-4 sm:p-6 md:p-10 sm:m-2">
        <span className="text-2xl font-bold text-textLight">OTP Verification</span>
        <p className="text-base">
          Enter the OTP sent to <b className="text-textDark font-bold">+91 {mobile}</b>
        </p>
        <form onSubmit={handleVerify}>
          {/* <OtpInput value={otp} onChange={setOtp} length={6} /> */}
          <OtpInput
            value={otp}
            onChange={setOtp}
            length={6}
            onComplete={(value) => {
              console.log("OTP Complete - Auto Verifying:", value);
              performVerification(value);
            }}
            error={error}
            autoFocus
            disabled={locked || loading}
          />

          {/* In the error/resend paragraph */}

          <div className="text-base text-borderLight font-normal p-2">
            {error && <div className="text-base text-[#FF0000] font-normal mb-2">{error}</div>}

            {attempts > 0 && !locked && (
              <div className="text-sm text-[#FF0000] mb-2">
                Attempts left: {maxAttempts - attempts}
              </div>
            )}

            {locked && (
              <div className="text-base text-[#FF0000] font-normal mb-2">
                Too many attempts. Resending OTP in a moment...
              </div>
            )}

            {!locked && (
              <p>
                Didn't receive the OTP?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={`font-medium underline ${
                    resendCooldown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#000000] hover:text-primary"
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </p>
            )}
          </div>
          {/* <p className="text-base text-borderLight font-normal p-2">
            {error ? (
              <span className="text-base text-[#FF0000] font-normal">{error}</span>
            ) : null}
            {attempts > 0 && !locked && (
              <span className="text-sm text-[#FF0000]">
                Attempts left: {maxAttempts - attempts}
              </span>
            )}
            {locked && (
              <span className="text-base text-[#FF0000] font-normal">
                Too many attempts. Resending OTP in a moment...
              </span>
            )}
            {!locked && (
              <>
                Didn’t receive the OTP?{" "}
                <button type="button" onClick={onResend} disabled={resendCooldown > 0} className="font-medium underline text-[#000000]">{0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>

              </>
            )}
          </p> */}

          <button
            type="submit"
            disabled={loading || locked || otp.length < 6}
            className={`w-full py-2 mt-4 flex items-center justify-center gap-2 ${locked ? "bg-gray-300 cursor-not-allowed" : "bg-primary"} text-white transition-all`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>VERIFYING...</span>
              </>
            ) : locked ? (
              "LOCKED - RESENDING..."
            ) : (
              "VERIFY OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;

// import React, { useState } from "react";
// import OtpInput from "./otpInput";
// import { verifyOtp } from "../../../services/otpService";
// import otpBanner from "@/assets/common/login/loginBanner.svg";

// const OtpVerification = ({ confirmation, mobile, onSuccess, onError, onResend }) => {
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const user = await verifyOtp(confirmation, otp);
//       onSuccess(user);
//     } catch {
//       setError("The OTP you entered is incorrect.");
//       onError();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white mb-12 py-6 w-full max-w-md mx-auto font-outfit">
//       <img src={otpBanner} alt="otp-banner" className="mb-12 w-full object-cover h-62" />
//       <div className="text-center m-4 p-12">
//         <span className="text-2xl font-bold text-textLight">OTP Verification</span>
//         <p className="text-base">
//           Enter the OTP sent to <b className="text-textDark font-bold" >+91 {mobile}</b>
//         </p>
//         <form onSubmit={handleVerify}>
//           {/* <OtpInput value={otp} onChange={setOtp} length={6} /> */}
//           <OtpInput
//             value={otp}
//             onChange={setOtp}
//             length={6}
//             onComplete={(value) => {
//               console.log("OTP Complete:", value);
//               // Validate or submit
//               if (value !== "123456") setError(true);
//               else setError(false);
//             }}
//             error={error}
//             autoFocus
//           />

//           <p className="text-base text-borderLight font-normal p-2">
//            {error && error ?<span className="text-base text-[#FF0000] font-">{error} </span> : ` Didn’t receive the OTP? ${" "}`}
//             Didn’t receive the OTP? {" "}
//             <button type="button" onClick={onResend} className="font-medium underline text-[#000000]">
//               Resend OTP
//             </button>
//           </p>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-2 mt-4"
//           >
//             {loading ? "Verifying..." : "VERIFY OTP"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OtpVerification;
