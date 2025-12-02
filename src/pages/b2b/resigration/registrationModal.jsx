// B2BRegistrationModal.jsx
import React, { useState, useEffect } from "react";
import loginBanner from "@/assets/common/login/loginBanner.svg";
import authService from "../../../services/authService";
import B2BAuthService from "../../../services/b2bAuthService";
import HeaderImage from "../../../components/b2b/common/HeaderImage";
import Step1Form from "../../../components/b2b/register/Step1Form";
import Step2Form from "../../../components/b2b/register/Step2Form";
import ModalButtons from "../../../components/b2b/register/ModalButtons";
import B2BValidator from "../../../utils/validators/b2bAuthValidator";
import { useNavigate } from "react-router-dom";

const defaultImage = loginBanner;
const FALLBACK_IMAGE = "https://dummyimage.com/600x300/cccccc/000000?text=Registration+Banner";

const validator = B2BValidator.getInstance();

const B2BRegistrationModal = ({
  isOpen,
  onClose,
  onSubmit,
  imageSrc = defaultImage,
  fallbackImageUrl = FALLBACK_IMAGE,
  key: modalKey,
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    pan: "",
    aadhaar: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset modal on close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setForm({
          username: "",
          mobile: "",
          email: "",
          password: "",
          confirmPassword: "",
          pan: "",
          aadhaar: "",
        });
        setErrors({});
        setImageError(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ---------------------------------------
  // UPDATE FIELD + REAL-TIME VALIDATION
  // ---------------------------------------
  const updateField = async (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    let error = null;

    switch (key) {
      case "username":
        error = await validator.validateUsername(value);
        break;

      case "mobile":
        error = await validator.validateMobile(value);
        break;

      case "email":
        error = await validator.validateEmail(value);
        break;

      case "password":
        error = await validator.validatePassword(value);

        // Live update confirm password validation
        if (form.confirmPassword) {
          const confirmError = await validator.validateConfirmPassword(value, form.confirmPassword);
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
        break;

      case "confirmPassword":
        error = await validator.validateConfirmPassword(form.password, value);
        break;

      case "pan":
        error = await validator.validatePAN(value);
        break;

      case "aadhaar":
        error = await validator.validateAadhaar(value);
        break;
    }

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  // ---------------------------------------
  // VALIDATE STEP 1 (basic details)
  // ---------------------------------------
  const validateStep1 = () => {
    const fields = ["username", "mobile", "email", "password", "confirmPassword"];
    const newErrors = {};
    let isValid = true;

    for (const field of fields) {
      if (!form[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required`;
        isValid = false;
      } else if (errors[field]) {
        isValid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // ---------------------------------------
  // VALIDATE STEP 2 (KYC)
  // ---------------------------------------
  const validateStep2 = async () => {
    const newErrors = {};

    const panError = await validator.validatePAN(form.pan);
    if (panError) newErrors.pan = panError;

    const aadhaarError = await validator.validateAadhaar(form.aadhaar);
    if (aadhaarError) newErrors.aadhaar = aadhaarError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------
  // NEXT BUTTON HANDLER
  // ---------------------------------------
  const handleNext = async () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else {
      if (await validateStep2()) {
        setLoading(true);

        try {
          console.log("################ The form value we have", form);
          const result = await B2BAuthService.registerB2B(form);
          console.log("@#@#@#@#@#@#@## THe result we get", result);

          if (result.success) {
            onClose();
            navigate("/?usertype=b2b");
          }
        } catch (err) {
          setErrors({ submit: err.message });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleBack = () => setStep(1);

  return (
    <div
      key={modalKey}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute z-10 right-3 top-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white"
        >
          <svg
            className="w-4 h-4 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M6 6L18 18M6 18L18 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header Image */}
        <HeaderImage
          imageSrc={imageSrc}
          fallbackImageUrl={fallbackImageUrl}
          imageError={imageError}
          onImageError={() => setImageError(true)}
          onImageLoad={() => setImageError(false)}
        />

        <div className="p-5">
          {step === 1 ? (
            <Step1Form
              form={form}
              errors={errors}
              updateField={updateField}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          ) : (
            <Step2Form form={form} errors={errors} updateField={updateField} />
          )}

          {/* API Error */}
          {errors.submit && (
            <p className="text-xs text-red-500 mb-2 text-center">{errors.submit}</p>
          )}

          <ModalButtons step={step} onBack={handleBack} onNext={handleNext} />

          {loading && <p className="text-center text-sm text-gray-500 mt-2">Creating account...</p>}
        </div>
      </div>
    </div>
  );
};

export default B2BRegistrationModal;
