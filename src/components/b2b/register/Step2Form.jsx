// Step2Form.jsx
import React from "react";
import B2BValidator from "../../../utils/validators/b2bAuthValidator";

const validator = B2BValidator.getInstance();

/**
 * QUICK SYNC CHECKS (used only for showing green tick)
 * These do NOT replace async validation!
 */
const isValidPAN = (pan) => {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());
};

const isValidAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const cleaned = aadhaar.replace(/\D/g, "");
  return cleaned.length === 12 && !/^(\d)\1+$/.test(cleaned);
};

const Step2Form = ({ form, errors, updateField }) => {
  return (
    <>
      {/* PAN */}
      <div className="mb-3 relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>

        <input
          value={form.pan}
          onChange={(e) => updateField("pan", e.target.value.toUpperCase().slice(0, 10))}
          className={`w-full text-sm border rounded-md p-2 pr-10 focus:outline-none 
            focus:ring-1 focus:ring-blue-500 
            ${errors.pan ? "border-red-500" : "border-gray-200"}`}
          placeholder="ABCDE1234F"
        />

        {/* ✅ show tick only when valid */}
        {isValidPAN(form.pan) && !errors.pan && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan}</p>}
      </div>

      {/* AADHAAR */}
      <div className="mb-6 relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number</label>

        <input
          value={form.aadhaar}
          onChange={(e) => updateField("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
          className={`w-full text-sm border rounded-md p-2 pr-10 focus:outline-none 
            focus:ring-1 focus:ring-blue-500 
            ${errors.aadhaar ? "border-red-500" : "border-gray-200"}`}
          placeholder="798778787078"
        />

        {/* ✅ show tick only when valid */}
        {isValidAadhaar(form.aadhaar) && !errors.aadhaar && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {errors.aadhaar && <p className="text-xs text-red-500 mt-1">{errors.aadhaar}</p>}
      </div>
    </>
  );
};

export default Step2Form;
