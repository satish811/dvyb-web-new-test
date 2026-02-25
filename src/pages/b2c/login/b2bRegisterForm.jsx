import React, { useState, useEffect, useCallback } from "react";
import CountryCodeDropdown from "../../../components/common/login/countryCodeDropdown";
import B2BAuthService from "../../../services/b2bAuthService";
import B2BValidator from "../../../utils/validators/b2bAuthValidator";

const validator = B2BValidator.getInstance();

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
  const [touched, setTouched] = useState({});
  const [fieldStatus, setFieldStatus] = useState({
    username: null, // null | 'checking' | 'available' | 'taken'
    mobile: null,
    pan: null,
    aadhaar: null,
  });

  // Debounce timer refs
  const debounceTimers = React.useRef({});

  // Real-time uniqueness check
  const checkFieldAvailability = useCallback(async (fieldName, value) => {
    if (!value || value.length < 3) {
      setFieldStatus(prev => ({ ...prev, [fieldName]: null }));
      return;
    }

    setFieldStatus(prev => ({ ...prev, [fieldName]: 'checking' }));

    try {
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

  // Debounced check
  const debouncedCheck = useCallback((fieldName, value) => {
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }
    debounceTimers.current[fieldName] = setTimeout(() => {
      checkFieldAvailability(fieldName, value);
    }, 600);
  }, [checkFieldAvailability]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Inline field-level validation using B2BValidator
  const validateField = useCallback(async (name, value) => {
    let error = null;
    switch (name) {
      case "username":
        error = await validator.validateUsername(value);
        break;
      case "email":
        error = await validator.validateEmail(value);
        break;
      case "mobile":
        error = await validator.validateMobile(value);
        break;
      case "pan":
        error = await validator.validatePAN(value);
        break;
      case "aadhaar":
        error = await validator.validateAadhaar(value);
        break;
      case "password":
        error = await validator.validatePassword(value);
        break;
      case "confirmPassword":
        error = await validator.validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error || "" }));
  }, [formData.password]);

  // Full form validation on submit
  const validate = async () => {
    const [
      usernameErr,
      emailErr,
      mobileErr,
      panErr,
      aadhaarErr,
      passwordErr,
      confirmPasswordErr,
    ] = await Promise.all([
      validator.validateUsername(formData.username),
      validator.validateEmail(formData.email),
      validator.validateMobile(formData.mobile),
      validator.validatePAN(formData.pan),
      validator.validateAadhaar(formData.aadhaar),
      validator.validatePassword(formData.password),
      validator.validateConfirmPassword(formData.password, formData.confirmPassword),
    ]);

    const newErrors = {};
    if (usernameErr) newErrors.username = usernameErr;
    if (emailErr) newErrors.email = emailErr;
    if (mobileErr) newErrors.mobile = mobileErr;
    if (panErr) newErrors.pan = panErr;
    if (aadhaarErr) newErrors.aadhaar = aadhaarErr;
    if (passwordErr) newErrors.password = passwordErr;
    if (confirmPasswordErr) newErrors.confirmPassword = confirmPasswordErr;

    // Uniqueness checks
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

    // Run inline validation if field was already touched
    if (touched[name]) {
      validateField(name, value);
    }

    // Trigger uniqueness check for unique fields
    if (['username', 'mobile', 'pan', 'aadhaar'].includes(name)) {
      debouncedCheck(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields as touched
    setTouched({
      username: true, email: true, mobile: true,
      pan: true, aadhaar: true, password: true, confirmPassword: true,
    });

    const isValid = await validate();
    if (!isValid) return;

    onSubmit({
      username: formData.username,
      email: formData.email,
      mobile: `${formData.countryCode}${formData.mobile}`,
      pan: formData.pan.trim().toUpperCase(),
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

  // Password strength helper
  const getPasswordStrength = (password) => {
    if (!password) return null;
    const checks = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()\-+_=,.?":{}|<>]/.test(password),
      password.length >= 8,
    ];
    const passed = checks.filter(Boolean).length;
    if (passed <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (passed <= 4) return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const inputClass = (fieldName) =>
    `w-full p-3 border focus:outline-none focus:ring-1 transition ${errors[fieldName]
      ? "border-red-500 focus:ring-red-400"
      : fieldStatus[fieldName] === 'available' || (touched[fieldName] && !errors[fieldName] && formData[fieldName])
        ? "border-green-500 focus:ring-green-400"
        : "border-gray-300 focus:ring-gray-400"
    }`;

  return (
    <div className="bg-white overflow-y-auto py-4 sm:py-6 md:py-8 w-full max-w-md mx-auto font-outfit max-h-[80vh]">
      <h2 className="text-xl font-bold text-center mb-4">B2B Registration</h2>
      <p className="text-xs text-center text-gray-600 mb-6">Register for bulk orders &amp; business pricing</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-2" noValidate>

        {/* Username */}
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username *"
            className={inputClass("username")}
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <div className="flex items-center justify-between mt-1 min-h-[16px]">
            {errors.username
              ? <p className="text-xs text-red-500">{errors.username}</p>
              : getFieldStatusIcon('username')
            }
          </div>
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email ID *"
            className={inputClass("email")}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
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
              className={`flex-1 border p-3 focus:outline-none focus:ring-1 transition ${errors.mobile ? "border-red-500 focus:ring-red-400" : fieldStatus.mobile === 'available' ? "border-green-500 focus:ring-green-400" : "border-gray-300 focus:ring-gray-400"
                }`}
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={10}
            />
          </div>
          <div className="flex items-center justify-between mt-1 min-h-[16px]">
            {errors.mobile
              ? <p className="text-xs text-red-500">{errors.mobile}</p>
              : getFieldStatusIcon('mobile')
            }
          </div>
        </div>

        {/* PAN */}
        <div>
          <input
            type="text"
            name="pan"
            placeholder="PAN Number * (e.g., ABCDE1234F)"
            className={inputClass("pan")}
            value={formData.pan}
            onChange={(e) => handleChange({ target: { name: "pan", value: e.target.value.toUpperCase() } })}
            onBlur={handleBlur}
            maxLength={10}
          />
          <div className="flex items-center justify-between mt-1 min-h-[16px]">
            {errors.pan
              ? <p className="text-xs text-red-500">{errors.pan}</p>
              : getFieldStatusIcon('pan')
            }
          </div>
        </div>

        {/* Aadhaar */}
        <div>
          <input
            type="text"
            name="aadhaar"
            placeholder="Aadhaar Number * (12 digits)"
            className={inputClass("aadhaar")}
            value={formData.aadhaar}
            onChange={(e) => handleChange({ target: { name: "aadhaar", value: e.target.value.replace(/\D/g, "") } })}
            onBlur={handleBlur}
            maxLength={12}
          />
          <div className="flex items-center justify-between mt-1 min-h-[16px]">
            {errors.aadhaar
              ? <p className="text-xs text-red-500">{errors.aadhaar}</p>
              : getFieldStatusIcon('aadhaar')
            }
          </div>
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password *"
            className={inputClass("password")}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {/* Password Strength Bar */}
          {formData.password && (
            <div className="mt-1.5">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength?.color} ${passwordStrength?.width}`} />
              </div>
              <p className={`text-xs mt-0.5 ${passwordStrength?.label === "Strong" ? "text-green-600" :
                  passwordStrength?.label === "Medium" ? "text-yellow-600" : "text-red-500"
                }`}>{passwordStrength?.label} password</p>
            </div>
          )}
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          {!errors.password && touched.password && (
            <p className="text-xs text-gray-400 mt-1">
              Must include uppercase, lowercase, number &amp; special character.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            className={inputClass("confirmPassword")}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.values(fieldStatus).some(status => status === 'checking' || status === 'taken')}
          className="bg-primary text-white p-3 hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed rounded mt-2 font-semibold tracking-wide transition"
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