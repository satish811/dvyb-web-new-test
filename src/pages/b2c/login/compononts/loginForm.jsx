import React, { useState, useEffect } from "react";
import CountryCodeDropdown from "../../../../components/common/login/countryCodeDropdown";
import { setupRecaptcha, sendOtp, cleanupRecaptcha } from "../../../../services/otpService";
import loginBanner from "@/assets/common/login/loginBanner.svg";

const LoginForm = ({ onOtpSent, onGuest }) => {
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    const initializeRecaptcha = () => {
      try {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          setupRecaptcha("recaptcha-container");
          console.log("reCAPTCHA initialized");
        }, 100);
      } catch (error) {
        console.error("Failed to initialize reCAPTCHA:", error);
      }
    };

    initializeRecaptcha();

    // Cleanup on unmount
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!mobile) {
      alert("Please enter mobile number");
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `${countryCode}${mobile}`;
      console.log("Sending OTP to:", phoneNumber);
      const confirmation = await sendOtp(phoneNumber);
      onOtpSent(confirmation, mobile);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert(`Failed to send OTP: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-2 sm:py-4 md:py-6  w-full max-w-md mx-auto font-outfit mb-12">
      <img src={loginBanner} alt="login-banner" className=" mb-4 w-full object-cover h-52" />
      <form onSubmit={handleSendOtp} className="flex flex-col gap-4 ">
        <div className="flex">
          <CountryCodeDropdown value={countryCode} onChange={setCountryCode} />
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            className="flex-1 border border-border p-3 "
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} // Only numbers
            required
            minLength={10}
            maxLength={10}
          />
        </div>
        <button
          type="submit"
          disabled={loading || mobile.length < 10}
          className="bg-primary text-white p-3 hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "SIGNUP / LOGIN"}
        </button>
        <div className="flex items-center justify-center text-gray-500">
          <span className="mx-2">OR</span>
        </div>
        <button
          type="button"
          onClick={onGuest}
          className="border border-primary text-primary p-2 hover:bg-color-secondary"
        >
          CHECK OUT AS GUEST
        </button>
        <div className="text-xs text-center text-gray-500">
          By continuing, I agree to{" "}
          <a href="#" className="text-primaryLight">
            Terms of Use
          </a>{" "}
          &{" "}
          <a href="#" className="text-primaryLight">
            Privacy Policy
          </a>
        </div>
      </form>
      {/* reCAPTCHA container - make sure it's in the DOM */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm;
