export class AddressModel {
  /**
   * Constructor
   * @param {*} param0
   */
  constructor({
    userId,
    firstName = "",
    lastName = "",
    email = "",
    address = "", // This is the "Landmark / Bridge Nearby" field
    city = "",
    stateProvince = "",
    zipPostalCode = "",
    country = "",
    type = "Home",
    isDefault = false,
  }) {
    this.userId = userId;

    /**
     * Personal Information
     */
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;

    /**
     * Address Details
     */
    this.address = address; // Landmark/Bridge Nearby
    this.city = city;
    this.stateProvince = stateProvince;
    this.zipPostalCode = zipPostalCode;
    this.country = country;

    /**
     * Address Metadata
     */
    this.type = type; // "Home", "Work", etc.
    this.isDefault = isDefault;

    /**
     * Timestamps
     */
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Helper method to update address
   * @param {*} updatedFields
   */
  updateAddress(updatedFields) {
    Object.keys(updatedFields).forEach((key) => {
      if (this.hasOwnProperty(key) && key !== "userId" && key !== "createdAt") {
        this[key] = updatedFields[key];
      }
    });
    this.updatedAt = new Date();
  }

  /**
   * Set as default address
   */
  setAsDefault() {
    this.isDefault = true;
    this.updatedAt = new Date();
  }

  /**
   * Convert to plain object for Firestore
   * @returns
   */
  toFirestore() {
    return {
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      address: this.address,
      city: this.city,
      stateProvince: this.stateProvince,
      zipPostalCode: this.zipPostalCode,
      country: this.country,
      type: this.type,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate address fields
   * @returns {Object} { isValid: boolean, errors: array }
   */
  validate() {
    const errors = [];

    if (!this.firstName.trim()) errors.push("First name is required");
    if (!this.address.trim()) errors.push("Landmark/Bridge Nearby is required");
    if (!this.city.trim()) errors.push("City is required");
    if (!this.country.trim()) errors.push("Country is required");
    if (!this.zipPostalCode.trim()) errors.push("Zip/Postal code is required");

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push("Please enter a valid email address");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Email validation helper
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create address from Firestore data
   * @param {Object} firestoreData
   * @returns {AddressModel}
   */
  static fromFirestore(firestoreData) {
    return new AddressModel({
      userId: firestoreData.userId,
      firstName: firestoreData.firstName,
      lastName: firestoreData.lastName,
      email: firestoreData.email,
      address: firestoreData.address,
      city: firestoreData.city,
      stateProvince: firestoreData.stateProvince,
      zipPostalCode: firestoreData.zipPostalCode,
      country: firestoreData.country,
      type: firestoreData.type,
      isDefault: firestoreData.isDefault,
    });
  }

  /**
   * Get full address as string
   * @returns {string}
   */
  getFullAddress() {
    const parts = [
      this.address,
      this.city,
      this.stateProvince,
      this.zipPostalCode,
      this.country,
    ].filter((part) => part && part.trim());

    return parts.join(", ");
  }
}
