class B2CValidator {
  static instance = null;

  static getInstance() {
    if (!B2CValidator.instance) {
      B2CValidator.instance = new B2CValidator();
    }
    return B2CValidator.instance;
  }

  constructor() {
    if (B2CValidator.instance) {
      throw new Error("Use B2CValidator.getInstance() instead of new B2CValidator()");
    }
  }

  // -------------------------
  // NAME (User / First Name)
  // -------------------------
  validateName(name) {
    if (!name) return "Name is required.";
    if (name.length < 3) return "Name must be at least 3 characters.";
    if (!/^[A-Za-z\s]+$/.test(name)) return "Name can only contain letters.";
    return null;
  }

  // -------------------------
  // EMAIL
  validateEmail(email) {
    if (!email || email.trim() === "") return "Email is required.";

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!regex.test(email)) return "Enter a valid email address.";

    return null;
  }

  // -------------------------
  // PHONE (not editable in UI)
  // -------------------------
  validatePhone(phone) {
    if (!phone) return null;
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits.";
    return null;
  }

  // -------------------------
  // ADDRESS LINE
  // -------------------------
  validateAddress(address) {
    if (!address) return "Address is required.";
    if (address.length < 5) return "Address must be at least 5 characters.";
    return null;
  }

  // -------------------------
  // CITY
  // -------------------------
  validateCity(city) {
    if (!city) return null;
    if (!/^[A-Za-z\s]+$/.test(city)) return "City must contain only letters.";
    return null;
  }

  // -------------------------
  // STATE
  // -------------------------
  validateState(state) {
    if (!state) return null;
    if (!/^[A-Za-z\s]+$/.test(state)) return "State must contain only letters.";
    return null;
  }

  // -------------------------
  // ZIP / POSTAL CODE
  // -------------------------
  validateZip(zip) {
    if (!zip) return null;
    if (!/^\d{5,6}$/.test(zip)) return "Zip code must be 5–6 digits.";
    return null;
  }
}

export const b2cValidator = B2CValidator.getInstance();
export default b2cValidator;
