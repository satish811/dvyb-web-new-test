// LoginForm.jsx
import React, { useState } from "react";
import loginBanner from "@/assets/common/login/loginBanner.svg";

const LoginForm = ({
  onSubmit,
  onShowRegister,
  onGoogleLogin,
  loading = false,
  authError = "",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!password || password.length < 6) e.password = "Password must be at least 6 chars";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setErrors({});
    if (!validate()) return;
    if (onSubmit) onSubmit({ email: email.trim(), password });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      await onGoogleLogin();
    } catch (error) {
      console.error("Google login error:", error);
      setErrors({ google: error.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white overflow-y-auto py-4 sm:py-6 md:py-8 w-full max-w-md mx-auto font-outfit mt-20 mb-20">
      {/* Banner */}
      <img src={loginBanner} alt="login-banner" className="mb-4 w-full object-cover h-52" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-2">
        <div>
          <label className="text-xs font-medium text-gray-700 block">ENTER YOUR EMAIL ID</label>
          <input
            type="email"
            placeholder="someone123@email.com"
            className={`mt-2 w-full p-3 border ${errors.email ? "border-red-500" : "border-border"}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-xs text-red-500 mt-2">{errors.email}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block">ENTER PASSWORD</label>
          <input
            type="password"
            placeholder="*********"
            className={`mt-2 w-full p-3 border ${errors.password ? "border-red-500" : "border-border"}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-xs text-red-500 mt-2">{errors.password}</p>}
        </div>

        {authError && <p className="text-sm text-center text-red-500">{authError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white p-3 hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed rounded"
        >
          {loading ? "Please wait..." : "LOGIN"}
        </button>

        <div className="flex items-center justify-center text-gray-500">
          <span className="mx-2">OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full bg-pink-50 border rounded py-3 text-sm flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            "Signing in..."
          ) : (
            <>
              <span>Sign in with</span>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="google"
                className="w-4 h-4"
              />
            </>
          )}
        </button>

        {errors.google && <p className="text-sm text-center text-red-500">{errors.google}</p>}

        <div className="text-center text-sm text-gray-500">
          Don't have an Account?{" "}
          <button
            type="button"
            onClick={onShowRegister}
            className="text-primary underline hover:text-primary/80"
          >
            Register
          </button>
        </div>

        <div className="text-xs text-center text-gray-500">
          By continuing, I agree to{" "}
          <a href="#" className="text-primaryLight underline hover:text-primaryLight/80">
            Terms of Use
          </a>{" "}
          &{" "}
          <a href="#" className="text-primaryLight underline hover:text-primaryLight/80">
            Privacy Policy
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
