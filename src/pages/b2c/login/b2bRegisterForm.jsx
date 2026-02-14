import React, { useState, useEffect, useCallback } from "react";
import CountryCodeDropdown from "../../../components/common/login/countryCodeDropdown";
import B2BAuthService from "../../../services/b2bAuthService";

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
  const [fieldStatus, setFieldStatus] = useState({
    username: null, // null | 'checking' | 'available' | 'taken'
    mobile: null,
    pan: null,
    aadhaar: null,
  });

  // Debounce timer refs
  const debounceTimers = React.useRef({});

  // Real-time field validation
  const checkFieldAvailability = useCallback(async (fieldName, value) => {
    if (!value || value.length < 3) {
      setFieldStatus(prev => ({ ...prev, [fieldName]: null }));
      return;
    }

    setFieldStatus(prev => ({ ...prev, [fieldName]: 'checking' }));

    try {
      // Map form field names to database field names
      const dbFieldMap = {
        username: 'username',
        mobile: 'mobileNo',
        pan: 'pan',
        aadhaar: 'aadhaar'
      };

      const dbFieldName = dbFieldMap[fieldName];
      const fieldValue = fieldName === 'mobile' 
        ? `${formData.countryCode}${value}` 
        : value;

      const isUnique = await B2BAuthService.isFieldUnique(dbFieldName, fieldValue);
      
      setFieldStatus(prev => ({
        ...prev,
        [fieldName]: isUnique ? 'available' : 'taken'
      }));
    } catch (error) {
      console.error(`Error checking ${fieldName}:`, error);
      setFieldStatus(prev => ({ ...prev, [fieldName]: null }));
    }
  }, [formData.countryCode]);

  // Debounced validation
  const debouncedCheck = useCallback((fieldName, value) => {
    // Clear existing timer
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    // Set new timer
    debounceTimers.current[fieldName] = setTimeout(() => {
      checkFieldAvailability(fieldName, value);
    }, 600); // Wait 600ms after user stops typing
  }, [checkFieldAvailability]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.mobile || formData.mobile.length !== 10) newErrors.mobile = "Valid 10-digit mobile is required";
    if (!formData.pan || formData.pan.length < 5) newErrors.pan = "PAN is required";
    if (!formData.aadhaar || formData.aadhaar.length < 12) newErrors.aadhaar = "Valid Aadhaar is required";
    if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    // Check if any field is already taken
    if (fieldStatus.username === 'taken') newErrors.username = "Username already taken";
    if (fieldStatus.mobile === 'taken') newErrors.mobile = "Mobile number already registered";
    if (fieldStatus.pan === 'taken') newErrors.pan = "PAN already registered";
    if (fieldStatus.aadhaar === 'taken') newErrors.aadhaar = "Aadhaar already registered";

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

    // Trigger real-time validation for unique fields
    if (['username', 'mobile', 'pan', 'aadhaar'].includes(name)) {
      debouncedCheck(name, value);
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

  // Helper to get field status icon
  const getFieldStatusIcon = (fieldName) => {
    const status = fieldStatus[fieldName];
    if (!formData[fieldName] || formData[fieldName].length < 3) return null;
    
    if (status === 'checking') {
      return <span className="text-blue-500 text-xs ml-2">⏳ Checking...</span>;
    } else if (status === 'available') {
      return <span className="text-green-600 text-xs ml-2">✓ Available</span>;
    } else if (status === 'taken') {
      return <span className="text-red-500 text-xs ml-2">✗ Already taken</span>;
    }
    return null;
  };

  return (
    <div className="bg-white overflow-y-auto py-4 sm:py-6 md:py-8 w-full max-w-md mx-auto font-outfit max-h-[80vh]">
      <h2 className="text-xl font-bold text-center mb-4">B2B Registration</h2>
      <p className="text-xs text-center text-gray-600 mb-6">Register for bulk orders & business pricing</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-2">
        {/* Username */}
        <div>
          <div className="flex items-center">
            <input
              type="text"
              name="username"
              placeholder="Username *"
              className={`w-full p-3 border ${errors.username ? "border-red-500" : fieldStatus.username === 'available' ? "border-green-500" : "border-border"}`}
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            {!errors.username && getFieldStatusIcon('username')}
          </div>
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
        <div>
          <div className="flex">
            <CountryCodeDropdown 
              value={formData.countryCode} 
              onChange={(code) => setFormData(prev => ({ ...prev, countryCode: code }))} 
            />
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number *"
              className={`flex-1 border p-3 ${errors.mobile ? "border-red-500" : fieldStatus.mobile === 'available' ? "border-green-500" : "border-border"}`}
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
            {!errors.mobile && getFieldStatusIcon('mobile')}
          </div>
        </div>

        {/* PAN */}
        <div>
          <input
            type="text"
            name="pan"
            placeholder="PAN *"
            className={`w-full p-3 border ${errors.pan ? "border-red-500" : fieldStatus.pan === 'available' ? "border-green-500" : "border-border"}`}
            value={formData.pan}
            onChange={handleChange}
            maxLength={10}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.pan && <p className="text-xs text-red-500">{errors.pan}</p>}
            {!errors.pan && getFieldStatusIcon('pan')}
          </div>
        </div>

        {/* Aadhaar */}
        <div>
          <input
            type="text"
            name="aadhaar"
            placeholder="Aadhaar Number *"
            className={`w-full p-3 border ${errors.aadhaar ? "border-red-500" : fieldStatus.aadhaar === 'available' ? "border-green-500" : "border-border"}`}
            value={formData.aadhaar}
            onChange={handleChange}
            maxLength={12}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.aadhaar && <p className="text-xs text-red-500">{errors.aadhaar}</p>}
            {!errors.aadhaar && getFieldStatusIcon('aadhaar')}
          </div>
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
          disabled={loading || Object.values(fieldStatus).some(status => status === 'checking' || status === 'taken')}
          className="bg-primary text-white p-3 hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed rounded mt-2"
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