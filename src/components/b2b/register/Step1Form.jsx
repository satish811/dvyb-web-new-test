// Step1Form.jsx
import React from "react";

/**
 * Step 1 Form Component: Basic Info (Username, Mobile, Email, Password, Confirm Password)
 * - Props: form, errors, updateField, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword
 */

const Step1Form = ({
  form,
  errors,
  updateField,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
          <input
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            className={`w-full text-sm border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.username ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="e.g., charlie"
          />
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mobile No.</label>
          <input
            value={form.mobile}
            onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, ""))}
            className={`w-full text-sm border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.mobile ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="7483274870"
            maxLength={15}
          />
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`w-full text-sm border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.email ? "border-red-500" : "border-gray-200"
          }`}
          placeholder="someone123@email.com"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div className="mb-3 relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          className={`w-full text-sm border rounded-md p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.password ? "border-red-500" : "border-gray-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-xs text-gray-500"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <div className="mb-4 relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          className={`w-full text-sm border rounded-md p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.confirmPassword ? "border-red-500" : "border-gray-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-xs text-gray-500"
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
        )}
      </div>
    </>
  );
};

export default Step1Form;
