class B2BValidator {
  static instance = null;

  static getInstance() {
    if (!B2BValidator.instance) {
      B2BValidator.instance = new B2BValidator();
    }
    return B2BValidator.instance;
  }

  constructor() {
    if (B2BValidator.instance) {
      throw new Error("Use B2BValidator.getInstance() instead of new B2BValidator()");
    }
  }

  // -------------------------
  // USERNAME VALIDATION
  // -------------------------
  async validateUsername(username) {
    if (!username) return "Username is required.";

    if (username.length < 3) return "Username must be at least 3 characters.";

    if (username.length > 20) return "Username cannot exceed 20 characters.";

    const regex = /^[a-zA-Z0-9@_]+$/;

    if (!regex.test(username))
      return "Username can only contain lowercase letters, numbers, @ and _";

    return null;
  }

  // -------------------------
  // MOBILE VALIDATION
  // -------------------------
  async validateMobile(mobile) {
    if (!mobile) return "Mobile number is required.";

    if (!/^[0-9]{10}$/.test(mobile)) {
      return "Mobile number must be exactly 10 digits.";
    }

    return null;
  }

  // -------------------------
  // EMAIL VALIDATION
  // -------------------------
  async validateEmail(email) {
    if (!email) return "Email is required.";

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) return "Invalid email address.";

    return null;
  }

  // -------------------------
  // PASSWORD VALIDATION
  // -------------------------
  async validatePassword(password) {
    if (!password) return "Password is required.";

    if (password.length < 6) return "Password must be at least 6 characters.";

    if (/\s/.test(password)) return "Password cannot contain spaces.";

    if (!/^[\x20-\x7E]+$/.test(password)) return "Password contains invalid characters.";

    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";

    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";

    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";

    if (!/[!@#$%^&*()\-+_=,.?":{}|<>]/.test(password))
      return "Password must contain at least one special character.";

    return null;
  }

  // -------------------------
  // CONFIRM PASSWORD
  // -------------------------
  async validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) return "Confirm Password is required.";

    if (password !== confirmPassword) return "Passwords do not match.";

    return null;
  }

  // -------------------------
  // PAN VALIDATION
  // -------------------------
  async validatePAN(pan) {
    if (!pan) return "PAN number is required.";

    const cleanedPAN = pan.trim().toUpperCase();

    if (cleanedPAN.length !== 10) return "PAN must be exactly 10 digits";

    const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;

    if (!panRegex.test(cleanedPAN)) return "Invalid PAN format (e.g., ABCDE1234F)";

    return null;
  }

  // -------------------------
  // AADHAAR VALIDATION
  // -------------------------
  async validateAadhaar(aadhaar) {
    if (!aadhaar) return "Aadhaar number is required.";

    const cleanedAadhaar = aadhaar.replace(/\D/g, "");

    if (cleanedAadhaar.length !== 12) return "Aadhaar must be exactly 12 digits";

    if (/^(\d)\1+$/.test(cleanedAadhaar)) return "Invalid Aadhaar number";

    return null;
  }
}

export default B2BValidator;
