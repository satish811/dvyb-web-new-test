import React, { useState, useEffect } from "react";
import { Edit2, Plus, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import b2cValidator from "../../../utils/B2CValidator";
import B2BAddressValidator from "../../../utils/validators/b2bAddressValidator";
import B2BAuthService from "../../../services/b2bAuthService";
import B2BAddressService from "../../../services/b2bAddressService";

const MyInfo = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  // B2C Data Structure
  const [b2cData, setB2cData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dob: "",
    addresses: [],
  });

  // B2B Data Structure
  const [b2bData, setB2bData] = useState({
    username: "",
    email: "",
    mobile: "",
    companyName: "",
    businessType: "",
    pan: "",
    aadhaar: "",
    addresses: [],
  });

  const [editUserMode, setEditUserMode] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    country: "India",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    const getUserRoleAndData = async () => {
      if (!user?.uid) return;

      try {
        setRoleLoading(true);
        setLoading(true);

        // Try to get B2B user complete profile first
        try {
          const completeProfile = await B2BAuthService.getUserCompleteProfile(user.uid);

          // Only set as B2B if we have valid B2B data with essential fields
          if (completeProfile && completeProfile.success && completeProfile.data) {
            const userData = completeProfile.data;
            // Check if we have B2B-specific data that wouldn't exist for B2C
            const hasB2BData = userData.companyName || userData.businessType || userData.pan;

            if (hasB2BData) {
              setUserRole("B2B");
              console.log("User is B2B with complete profile:", completeProfile.data);

              // Fetch B2B addresses - FIXED: Use service directly
              const addressesResponse = await B2BAddressService.getAddresses(user.uid, "B2B");
              console.log("B2B Addresses response:", addressesResponse);

              // Set B2B data from complete profile
              setB2bData({
                username: userData.username || "",
                email: userData.email || user.email || "",
                mobile: userData.mobile || "",
                companyName: userData.companyName || "",
                businessType: userData.businessType || "",
                pan: userData.pan || "",
                aadhaar: userData.aadhaar || "",
                addresses: addressesResponse.success ? addressesResponse.data : [],
              });
            } else {
              // No B2B-specific data found, treat as B2C
              console.log("No B2B data found, treating as B2C");
              setUserRole("B2C");
              await fetchB2CData();
            }
          } else {
            // B2B profile fetch failed or returned no data
            console.log("B2B profile fetch failed, treating as B2C");
            setUserRole("B2C");
            await fetchB2CData();
          }
        } catch (b2bError) {
          // If B2B user not found or any error, default to B2C
          console.log("B2B user not found or error, treating as B2C:", b2bError);
          setUserRole("B2C");
          await fetchB2CData();
        }
      } catch (error) {
        console.error("Error getting user role and data:", error);
        setUserRole("B2C");
        await fetchB2CData();
      } finally {
        setRoleLoading(false);
        setLoading(false);
      }
    };

    const fetchB2CData = async () => {
      try {
        const profile = await userService.getUserProfile(user.uid);
        const addresses = await userService.getAddresses(user.uid);

        setB2cData({
          name: profile?.name || "",
          email: profile?.email || user.email || "",
          phoneNumber: profile?.phoneNumber || user.phoneNumber || "",
          gender: profile?.gender || "",
          dob: profile?.dob || "",
          addresses: addresses || [],
        });
      } catch (error) {
        console.error("Error fetching B2C data:", error);
      }
    };

    getUserRoleAndData();
  }, [user]);

  // Real-time validation only for touched fields
  useEffect(() => {
    if (Object.keys(touchedFields).length > 0) {
      validateForm();
    }
  }, [newAddress, touchedFields]);

  const validateForm = async () => {
    try {
      const result = await B2BAddressValidator.validateCompleteAddress(newAddress);
      const filteredErrors = {};
      Object.keys(result.errors).forEach((field) => {
        if (touchedFields[field]) {
          filteredErrors[field] = result.errors[field];
        }
      });
      setValidationErrors(filteredErrors);
      setIsFormValid(result.isValid);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const validateField = async (fieldName, value) => {
    try {
      let error = null;
      switch (fieldName) {
        case "firstName":
          error = await B2BAddressValidator.validateFirstName(value);
          break;
        case "lastName":
          error = await B2BAddressValidator.validateLastName(value);
          break;
        case "email":
          error = await B2BAddressValidator.validateEmail(value);
          break;
        case "address":
          error = await B2BAddressValidator.validateAddress(value);
          break;
        case "city":
          error = await B2BAddressValidator.validateCity(value);
          break;
        case "stateProvince":
          error = await B2BAddressValidator.validateStateProvince(value);
          break;
        case "zipPostalCode":
          error = await B2BAddressValidator.validateZipPostalCode(value);
          break;
        case "country":
          error = await B2BAddressValidator.validateCountry(value);
          break;
        default:
          break;
      }
      if (touchedFields[fieldName]) {
        setValidationErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
      return error;
    } catch (error) {
      console.error(`Validation error for ${fieldName}:`, error);
      return "Validation error occurred";
    }
  };

  const markFieldAsTouched = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // B2C Handlers
  const handleB2cChange = (e) => {
    setB2cData({ ...b2cData, [e.target.name]: e.target.value });
  };

  // B2B Handlers
  const handleB2bChange = (e) => {
    setB2bData({ ...b2bData, [e.target.name]: e.target.value });
  };

  const handleNewAddressChange = async (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
    if (!touchedFields[name]) markFieldAsTouched(name);
    setTimeout(() => {
      if (touchedFields[name]) validateField(name, value);
    }, 300);
  };

  const handleFieldBlur = (fieldName) => {
    markFieldAsTouched(fieldName);
  };

  const saveUserData = async () => {
    if (userRole === "B2B") {
      // B2B Save Logic
      const error = b2cValidator.validateName(b2bData.username);
      if (error) return alert(error);
      try {
        // await B2BAuthService.updateUserProfile(user.uid, b2bData);
        alert("B2B profile update functionality to be implemented");
        setEditUserMode(false);
      } catch (error) {
        console.error("B2B Update failed:", error);
        alert("Failed to update B2B profile");
      }
    } else {
      // B2C Save Logic
      const error = b2cValidator.validateName(b2cData.name);
      if (error) return alert(error);
      try {
        await userService.updateUserProfile(user.uid, { name: b2cData.name });
        setEditUserMode(false);
        alert("Profile updated successfully");
      } catch (error) {
        console.error("B2C Update failed:", error);
        alert("Failed to update profile");
      }
    }
  };

  const addOrUpdateAddress = async () => {
    const finalValidation = await B2BAddressValidator.validateCompleteAddress(newAddress);
    if (!finalValidation.isValid) {
      const allFields = [
        "firstName",
        "lastName",
        "email",
        "address",
        "city",
        "stateProvince",
        "zipPostalCode",
        "country",
      ];
      const allTouched = {};
      allFields.forEach((field) => {
        allTouched[field] = true;
      });
      setTouchedFields(allTouched);
      setValidationErrors(finalValidation.errors);
      alert("Please fix the validation errors before saving.");
      return;
    }

    try {
      if (userRole === "B2B") {
        // FIXED: Use service directly
        if (editingAddress) {
          await B2BAddressService.updateAddress(user.uid, "B2B", editingAddress.id, newAddress);
        } else {
          await B2BAddressService.addAddress(user.uid, "B2B", newAddress);
        }
      } else {
        if (editingAddress) {
          await userService.updateAddress(user.uid, editingAddress.id, newAddress);
        } else {
          await userService.addAddress(user.uid, newAddress);
        }
      }
      await refreshUserData();
      cancelAddressForm();
      alert(editingAddress ? "Address updated successfully!" : "Address added successfully!");
    } catch (error) {
      console.error("Address save failed:", error);
      alert(error.message || "Failed to save address");
    }
  };

  const refreshUserData = async () => {
    if (!user?.uid) return;
    try {
      if (userRole === "B2B") {
        const completeProfile = await B2BAuthService.getUserCompleteProfile(user.uid);
        // Fetch B2B addresses separately - FIXED: Use service directly
        const addressesResponse = await B2BAddressService.getAddresses(user.uid, "B2B");

        if (completeProfile.success) {
          const userData = completeProfile.data;
          setB2bData((prev) => ({
            ...prev,
            username: userData.username || prev.username,
            email: userData.email || prev.email,
            mobile: userData.mobile || prev.mobile,
            companyName: userData.companyName || prev.companyName,
            businessType: userData.businessType || prev.businessType,
            pan: userData.pan || prev.pan,
            aadhaar: userData.aadhaar || prev.aadhaar,
            addresses: addressesResponse.success ? addressesResponse.data : prev.addresses,
          }));
        }
      } else {
        const profile = await userService.getUserProfile(user.uid);
        const addresses = await userService.getAddresses(user.uid);
        setB2cData((prev) => ({
          ...prev,
          name: profile?.name || prev.name,
          email: profile?.email || prev.email,
          phoneNumber: profile?.phoneNumber || prev.phoneNumber,
          addresses: addresses || prev.addresses,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const removeAddress = async (address) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    try {
      if (userRole === "B2B") {
        // FIXED: Use service directly
        await B2BAddressService.deleteAddress(user.uid, "B2B", address.id);
      } else {
        await userService.deleteAddress(user.uid, address.id);
      }
      await refreshUserData();
      alert("Address removed successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to remove address");
    }
  };

  const setDefaultAddress = async (address) => {
    try {
      if (userRole === "B2B") {
        // FIXED: Use service directly
        await B2BAddressService.setDefaultAddress(user.uid, "B2B", address.id);
      } else {
        await userService.setDefaultAddress(user.uid, address.id);
      }
      await refreshUserData();
      alert("Default address updated successfully!");
    } catch (error) {
      console.error("Set default failed:", error);
      alert("Failed to set default address");
    }
  };

  const startEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      email: address.email || "",
      address: address.address || "",
      city: address.city || "",
      stateProvince: address.stateProvince || "",
      zipPostalCode: address.zipPostalCode || "",
      country: address.country || "India",
    });
    const allTouched = {};
    Object.keys(newAddress).forEach((field) => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    setShowAddAddress(true);
  };

  const cancelAddressForm = () => {
    setShowAddAddress(false);
    setEditingAddress(null);
    setNewAddress({
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      stateProvince: "",
      zipPostalCode: "",
      country: "India",
    });
    setValidationErrors({});
    setIsFormValid(false);
    setTouchedFields({});
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500";
    if (validationErrors[fieldName] && touchedFields[fieldName]) {
      return `${baseClass} border-2 border-red-500 text-red-900`;
    }
    return `${baseClass} border border-gray-300 text-gray-900`;
  };

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Edit Profile Modal - Different for B2B and B2C
  if (editUserMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Edit Profile {userRole === "B2B" && "(B2B)"}
            </h2>
          </div>

          <div className="p-6">
            {userRole === "B2B" ? (
              // B2B Edit Form
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input
                    name="username"
                    value={b2bData.username}
                    onChange={handleB2bChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    value={b2bData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    value={b2bData.mobile}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    value={b2bData.companyName}
                    onChange={handleB2bChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <input
                    name="businessType"
                    value={b2bData.businessType}
                    onChange={handleB2bChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter business type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    value={b2bData.pan}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    value={b2bData.aadhaar}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              // B2C Edit Form
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    value={b2cData.name}
                    onChange={handleB2cChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    value={b2cData.phoneNumber}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                onClick={saveUserData}
                className="flex-1 bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditUserMode(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit Address Modal
  if (showAddAddress) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAddress ? "Edit Address" : "Add Your Shipping Address"}
                {userRole === "B2B" && " (B2B)"}
              </h2>
              <button onClick={cancelAddressForm}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Fields marked with * are required</p>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={newAddress.firstName}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("firstName")}
                className={getInputClassName("firstName")}
                placeholder="Enter first name"
              />
              {validationErrors.firstName && touchedFields.firstName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={newAddress.lastName}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("lastName")}
                className={getInputClassName("lastName")}
                placeholder="Enter last name"
              />
              {validationErrors.lastName && touchedFields.lastName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={newAddress.email}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("email")}
                className={getInputClassName("email")}
                placeholder="Enter email address"
              />
              {validationErrors.email && touchedFields.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip / Postal Code *
              </label>
              <input
                type="text"
                name="zipPostalCode"
                value={newAddress.zipPostalCode}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("zipPostalCode")}
                className={getInputClassName("zipPostalCode")}
                placeholder="Enter zip/postal code"
              />
              {validationErrors.zipPostalCode && touchedFields.zipPostalCode && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.zipPostalCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("city")}
                className={getInputClassName("city")}
                placeholder="Enter city"
              />
              {validationErrors.city && touchedFields.city && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State / Province *
              </label>
              <input
                type="text"
                name="stateProvince"
                value={newAddress.stateProvince}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("stateProvince")}
                className={getInputClassName("stateProvince")}
                placeholder="Enter state/province"
              />
              {validationErrors.stateProvince && touchedFields.stateProvince && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.stateProvince}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landmark / Bridge Nearby *
              </label>
              <textarea
                name="address"
                value={newAddress.address}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("address")}
                rows="3"
                className={getInputClassName("address")}
                placeholder="Enter full address with landmark and street details"
              />
              {validationErrors.address && touchedFields.address && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <select
                name="country"
                value={newAddress.country}
                onChange={handleNewAddressChange}
                onBlur={() => handleFieldBlur("country")}
                className={getInputClassName("country")}
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
              {validationErrors.country && touchedFields.country && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>
              )}
            </div>

            <div className="md:col-span-2 flex gap-4 pt-4">
              <button
                onClick={addOrUpdateAddress}
                disabled={!isFormValid && Object.keys(touchedFields).length > 0}
                className={`flex-1 py-4 rounded-lg font-medium transition ${
                  isFormValid || Object.keys(touchedFields).length === 0
                    ? "bg-red-700 text-white hover:bg-red-800"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {editingAddress ? "Update Address" : "Save Address"}
              </button>
              <button
                onClick={cancelAddressForm}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>

            {!isFormValid && Object.keys(validationErrors).length > 0 && (
              <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium mb-2 flex items-center gap-2">
                  <X size={16} />
                  Please fix the following errors:
                </p>
                <ul className="text-red-600 text-xs list-disc list-inside space-y-1">
                  {Object.entries(validationErrors).map(
                    ([field, error]) =>
                      error &&
                      touchedFields[field] && (
                        <li key={field}>
                          <span className="font-medium">{field}:</span> {error}
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main View - Different for B2B and B2C
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Details - Different for B2B and B2C */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {userRole === "B2B" ? "Business Information (B2B)" : "Personal Information"}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {userRole === "B2B" ? (
              // B2B Display
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Username</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2bData.username || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2bData.email || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mobile Number</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2bData.mobile || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Company Name</label>
                  <p className="mt-1 text-lg font-medium text-blue-900">
                    {b2bData.companyName || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Business Type</label>
                  <p className="mt-1 text-lg font-medium text-blue-900">
                    {b2bData.businessType || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">PAN Number</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2bData.pan || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Aadhaar Number</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2bData.aadhaar || "Not set"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Account Type</label>
                  <p className="mt-1 text-lg font-medium text-blue-900">Business Account (B2B)</p>
                </div>
              </div>
            ) : (
              // B2C Display
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2cData.name || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone Number</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2cData.phoneNumber || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {b2cData.email || "Not set"}
                  </p>
                </div>
                {b2cData.gender && (
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <p className="mt-1 text-lg font-medium text-gray-900">{b2cData.gender}</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setEditUserMode(true)}
              className="flex items-center gap-2 text-red-700 hover:text-red-800 font-medium"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Addresses Section - Same for both but uses different data */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              My Addresses {userRole === "B2B" && "(B2B)"}
            </h2>
            <button
              onClick={() => setShowAddAddress(true)}
              className="flex items-center gap-2 text-red-700 hover:text-red-800 font-medium"
            >
              <Plus size={20} />
              Add New Address
            </button>
          </div>

          <div className="p-6">
            {(userRole === "B2B" ? b2bData.addresses : b2cData.addresses).length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg">No addresses saved yet</p>
                <p className="text-sm mt-2">Add your first address to get started</p>
                {userRole === "B2B" && (
                  <p className="text-xs mt-1 text-blue-600">Business account detected</p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {(userRole === "B2B" ? b2bData.addresses : b2cData.addresses).map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-gray-200 rounded-lg p-6 relative hover:shadow-md transition"
                  >
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                        Default
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {addr.firstName} {addr.lastName}
                    </h3>
                    {addr.email && <p className="text-sm text-gray-600 mt-1">{addr.email}</p>}
                    <p className="text-gray-700 mt-3">{addr.address}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {addr.city}, {addr.stateProvince} {addr.zipPostalCode}
                    </p>
                    <p className="text-gray-600 text-sm">{addr.country}</p>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => startEditAddress(addr)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr)}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => removeAddress(addr)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
