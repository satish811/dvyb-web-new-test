class B2BAddressValidator {
  static instance = null;

  static getInstance() {
    if (!B2BAddressValidator.instance) {
      B2BAddressValidator.instance = new B2BAddressValidator();
    }
    return B2BAddressValidator.instance;
  }

  constructor() {
    if (B2BAddressValidator.instance) {
      throw new Error("Use B2BAddressValidator.getInstance() instead of new B2BAddressValidator()");
    }
  }

  // -------------------------
  // FIRST NAME VALIDATION
  // -------------------------
  async validateFirstName(firstName) {
    if (!firstName) return "First name is required.";

    if (firstName.length < 2) return "First name must be at least 2 characters.";

    if (firstName.length > 50) return "First name cannot exceed 50 characters.";

    const regex = /^[a-zA-Z\s\-']+$/;

    if (!regex.test(firstName))
      return "First name can only contain letters, spaces, hyphens, and apostrophes.";

    return null;
  }

  // -------------------------
  // LAST NAME VALIDATION
  // -------------------------
  async validateLastName(lastName) {
    if (lastName && lastName.length > 50) return "Last name cannot exceed 50 characters.";

    if (lastName) {
      const regex = /^[a-zA-Z\s\-']*$/;
      if (!regex.test(lastName))
        return "Last name can only contain letters, spaces, hyphens, and apostrophes.";
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
  // ADDRESS VALIDATION
  // -------------------------
  async validateAddress(address) {
    if (!address) return "Address is required.";

    if (address.length < 10) return "Address must be at least 10 characters.";

    if (address.length > 500) return "Address cannot exceed 500 characters.";

    const wordCount = address.trim().split(/\s+/).length;
    if (wordCount < 3) return "Please provide a more detailed address.";

    return null;
  }

  // -------------------------
  // CITY VALIDATION
  // -------------------------
  async validateCity(city) {
    if (!city) return "City is required.";

    if (city.length < 2) return "City must be at least 2 characters.";

    if (city.length > 50) return "City cannot exceed 50 characters.";

    const regex = /^[a-zA-Z\s\-']+$/;

    if (!regex.test(city))
      return "City can only contain letters, spaces, hyphens, and apostrophes.";

    return null;
  }

  // -------------------------
  // STATE/PROVINCE VALIDATION
  // -------------------------
  async validateStateProvince(stateProvince) {
    if (!stateProvince) return "State/Province is required.";

    if (stateProvince.length < 2) return "State/Province must be at least 2 characters.";

    if (stateProvince.length > 50) return "State/Province cannot exceed 50 characters.";

    const regex = /^[a-zA-Z\s\-']+$/;

    if (!regex.test(stateProvince))
      return "State/Province can only contain letters, spaces, hyphens, and apostrophes.";

    return null;
  }

  // -------------------------
  // ZIP/POSTAL CODE VALIDATION
  // -------------------------
  async validateZipPostalCode(zipPostalCode) {
    if (!zipPostalCode) return "Zip/Postal code is required.";

    const cleanedZip = zipPostalCode.replace(/\s/g, "");

    if (cleanedZip.length < 3) return "Zip/Postal code must be at least 3 characters.";

    if (cleanedZip.length > 10) return "Zip/Postal code cannot exceed 10 characters.";

    const regex = /^[a-zA-Z0-9\-]+$/;

    if (!regex.test(cleanedZip))
      return "Zip/Postal code can only contain letters, numbers, and hyphens.";

    return null;
  }

  // -------------------------
  // COUNTRY VALIDATION
  // -------------------------
  async validateCountry(country) {
    if (!country) return "Country is required.";

    const validCountries = ["India", "USA", "UK", "Canada", "Australia", "Germany", "France"];

    if (!validCountries.includes(country)) return "Please select a valid country from the list.";

    return null;
  }

  // -------------------------
  // COMPLETE ADDRESS VALIDATION
  // -------------------------
  async validateCompleteAddress(addressData) {
    const errors = {};

    const validations = [
      { field: "firstName", validator: this.validateFirstName },
      { field: "lastName", validator: this.validateLastName },
      { field: "email", validator: this.validateEmail },
      { field: "address", validator: this.validateAddress },
      { field: "city", validator: this.validateCity },
      { field: "stateProvince", validator: this.validateStateProvince },
      { field: "zipPostalCode", validator: this.validateZipPostalCode },
      { field: "country", validator: this.validateCountry },
    ];

    for (const { field, validator } of validations) {
      const error = await validator(addressData[field]);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // -------------------------
  // BUSINESS ADDRESS VALIDATION (B2B Specific)
  // -------------------------
  async validateBusinessAddress(addressData) {
    const baseValidation = await this.validateCompleteAddress(addressData);

    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const b2bErrors = { ...baseValidation.errors };

    if (addressData.companyName) {
      if (addressData.companyName.length > 100) {
        b2bErrors.companyName = "Company name cannot exceed 100 characters.";
      }
    }

    if (addressData.taxId) {
      const taxIdError = await this.validateTaxId(addressData.taxId, addressData.country);
      if (taxIdError) {
        b2bErrors.taxId = taxIdError;
      }
    }

    return {
      isValid: Object.keys(b2bErrors).length === 0,
      errors: b2bErrors,
    };
  }

  // -------------------------
  // TAX ID VALIDATION (B2B Specific)
  // -------------------------
  async validateTaxId(taxId, country) {
    if (!taxId) return null;

    switch (country) {
      case "India":
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(taxId.toUpperCase())) {
          return "Invalid GST format (e.g., 07AABCU9603R1ZM)";
        }
        break;

      case "USA":
        const einRegex = /^[0-9]{2}-[0-9]{7}$/;
        if (!einRegex.test(taxId)) {
          return "Invalid EIN format (e.g., 12-3456789)";
        }
        break;

      case "UK":
        const vatRegex = /^GB[0-9]{9}$|^GB[0-9]{12}$|^GBGD[0-9]{3}$|^GBHA[0-9]{3}$/;
        if (!vatRegex.test(taxId.toUpperCase())) {
          return "Invalid UK VAT format";
        }
        break;

      default:
        if (taxId.length > 20) {
          return "Tax ID cannot exceed 20 characters.";
        }
    }

    return null;
  }

  // -------------------------
  // ADDRESS FORMAT VALIDATION
  // -------------------------
  async validateAddressFormat(addressData) {
    const formatErrors = [];

    if (!/\d/.test(addressData.address)) {
      formatErrors.push("Address should contain a street number.");
    }

    if (addressData.city.toLowerCase() === addressData.stateProvince.toLowerCase()) {
      formatErrors.push("City and State/Province should be different.");
    }

    return {
      isValid: formatErrors.length === 0,
      errors: formatErrors,
    };
  }
}

export default B2BAddressValidator.getInstance();
