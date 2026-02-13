import React, { useState } from "react";
import CountryCodeDropdown from "./countryCodeDropdown";

const B2BRegisterForm = ({ onSubmit, loading, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    countryCode: "+91",
    pan: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.mobile || formData.mobile.length !== 10) newErrors.mobile = "Valid 10-digit mobile is required";
    if (!formData.pan || formData.pan.length < 5) newErrors.pan = "PAN is required";
    if (!formData.aadhaar || formData.aadhaar.length < 12) newErrors.aadhaar = "Valid Aadhaar is required";
    if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      username: formData.username,
      email: formData.email,
      mobile: `${formData.countryCode}${formData.mobile}`,
      pan: formData.pan,
      aadhaar: formData.aadhaar,
      password: formData.password,
    });
  };

  return (
    <div className="bg-white overflow-y-auto py-4 sm:py-6 md:py-8 w-full max-w-md mx-auto font-outfit max-h-[80vh]">
      <h2 className="text-xl font-bold text-center mb-4">B2B Registration</h2>
      <p className="text-xs text-center text-gray-600 mb-6">Register for bulk orders & business pricing</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-2">
        {/* Username */}
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username *"
            className={`w-full p-3 border ${errors.username ? "border-red-500" : "border-border"}`}
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email ID *"
            className={`w-full p-3 border ${errors.email ? "border-red-500" : "border-border"}`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Mobile with Country Code */}
        <div className="flex">
          <CountryCodeDropdown 
            value={formData.countryCode} 
            onChange={(code) => setFormData(prev => ({ ...prev, countryCode: code }))} 
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number *"
            className={`flex-1 border p-3 ${errors.mobile ? "border-red-500" : "border-border"}`}
            value={formData.mobile}
            onChange={handleChange}
            maxLength={10}
          />
        </div>
        {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}

        {/* PAN */}
        <div>
          <input
            type="text"
            name="pan"
            placeholder="PAN *"
            className={`w-full p-3 border ${errors.pan ? "border-red-500" : "border-border"}`}
            value={formData.pan}
            onChange={handleChange}
            maxLength={10}
          />
          {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan}</p>}
        </div>

        {/* Aadhaar */}
        <div>
          <input
            type="text"
            name="aadhaar"
            placeholder="Aadhaar Number *"
            className={`w-full p-3 border ${errors.aadhaar ? "border-red-500" : "border-border"}`}
            value={formData.aadhaar}
            onChange={handleChange}
            maxLength={12}
          />
          {errors.aadhaar && <p className="text-xs text-red-500 mt-1">{errors.aadhaar}</p>}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password *"
            className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-border"}`}
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            className={`w-full p-3 border ${errors.confirmPassword ? "border-red-500" : "border-border"}`}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white p-3 hover:bg-primary/90 disabled:bg-gray-400 rounded mt-2"
        >
          {loading ? "Registering..." : "REGISTER FOR B2B"}
        </button>

        {/* Switch to Login */}
        <div className="text-center text-sm text-gray-500 mt-2">
          Already have a B2B account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary underline hover:text-primary/80"
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
};

export default B2BRegisterForm;