import React, { useState } from "react";

const B2BLoginForm = ({ onSubmit, onGoogleLogin, onSwitchToRegister, loading = false }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    onSubmit({ email: email.trim(), password });
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
    <div className="bg-white overflow-y-auto py-4 sm:py-6 md:py-8 w-full max-w-md mx-auto font-outfit">
      <h2 className="text-xl font-bold text-center mb-4">B2B Login</h2>
      <p className="text-xs text-center text-gray-600 mb-6">Login for bulk orders & business pricing</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-2">
        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email ID *"
            className={`w-full p-3 border ${errors.email ? "border-red-500" : "border-border"}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-xs text-red-500 mt-2">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            placeholder="Password *"
            className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-border"}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-xs text-red-500 mt-2">{errors.password}</p>}
        </div>

        {errors.google && <p className="text-sm text-center text-red-500">{errors.google}</p>}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white p-3 hover:bg-primary/90 disabled:bg-gray-400 rounded"
        >
          {loading ? "Please wait..." : "B2B LOGIN"}
        </button>

        <div className="flex items-center justify-center text-gray-500">
          <span className="mx-2">OR</span>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full bg-pink-50 border rounded py-3 text-sm flex items-center justify-center gap-2 hover:bg-pink-100"
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

        {/* Switch to Register */}
        <div className="text-center text-sm text-gray-500">
          New to B2B?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary underline hover:text-primary/80"
          >
            Register here
          </button>
        </div>
      </form>
    </div>
  );
};

export default B2BLoginForm;