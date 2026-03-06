import React, { useState, useEffect } from "react";
import { Edit2, Plus, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import b2cValidator from "../../../utils/B2CValidator";
import B2BAddressValidator from "../../../utils/validators/b2bAddressValidator";
import B2BAuthService from "../../../services/b2bAuthService";
import B2BAddressService from "../../../services/b2bAddressService";
import { auth } from "../../../config/firebaseConfig";
import { Country, State, City } from "country-state-city";
import LazyImageLoader from "../LazyImageLoader/LazyImageLoader";
import B2BUserDetails from "../../../pages/MyProfile/B2BUserDetails";

const MyInfo = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

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
    pan: "",
    aadhaar: "",
    addresses: [],
  });

  const [editUserMode, setEditUserMode] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    country: "",
    phone: "", // Added phone field
  });

  // Fetch user data on mount
  useEffect(() => {
    const getUserRoleAndData = async () => {
      if (!user?.uid) return;

      try {
        setRoleLoading(true);
        setLoading(true);

        console.log("=== MyInfo: Starting role detection for uid:", user.uid, "===");

        // Check HOW the user signed in — this determines the role
        const currentUser = auth.currentUser;
        const providerId = currentUser?.providerData?.[0]?.providerId;
        const isPhoneLogin = providerId === "phone";

        console.log("MyInfo: sign-in provider:", providerId, "| isPhoneLogin:", isPhoneLogin);

        // Phone OTP login = ALWAYS B2C, skip B2B check entirely
        if (isPhoneLogin) {
          console.log("MyInfo: Phone login detected → B2C");
          setUserRole("B2C");
          await fetchB2CData();
        } else {
          // Email/password login — check B2B collection
          let detectedRole = null;
          let b2bUserData = null;

          try {
            const completeProfile = await B2BAuthService.getUserCompleteProfile(user.uid);
            console.log("MyInfo: getUserCompleteProfile result:", JSON.stringify({
              success: completeProfile?.success,
              role: completeProfile?.role,
              collection: completeProfile?.collection,
              hasData: !!completeProfile?.data,
            }));

            if (completeProfile && completeProfile.success && completeProfile.data) {
              if (completeProfile.role === "B2B") {
                detectedRole = "B2B";
                b2bUserData = completeProfile.data;
              }
            }
          } catch (profileError) {
            console.warn("MyInfo: getUserCompleteProfile failed:", profileError.message);
          }

          console.log("=== MyInfo: Final detected role:", detectedRole || "B2C", "===");

          if (detectedRole === "B2B" && b2bUserData) {
            setUserRole("B2B");

            let addresses = [];
            try {
              const addressesResponse = await B2BAddressService.getAddresses(user.uid, "B2B");
              addresses = addressesResponse.success ? addressesResponse.data : [];
            } catch (addrError) {
              console.warn("MyInfo: B2B address fetch failed (non-blocking):", addrError.message);
            }

            setB2bData({
              username: b2bUserData.username || "",
              email: b2bUserData.email || user.email || "",
              mobile: b2bUserData.mobile || b2bUserData.mobileNo || "",
              pan: b2bUserData.pan || "",
              aadhaar: b2bUserData.aadhaar || "",
              addresses: addresses,
            });
          } else {
            setUserRole("B2C");
            await fetchB2CData();
          }
        }
      } catch (error) {
        console.error("MyInfo: Error getting user role and data:", error);
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

  // B2C Handlers
  const handleB2cChange = (e) => {
    setB2cData({ ...b2cData, [e.target.name]: e.target.value });
  };

  // B2B Handlers
  const handleB2bChange = (e) => {
    setB2bData({ ...b2bData, [e.target.name]: e.target.value });
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  const handlePinCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setNewAddress((prev) => ({ ...prev, zipPostalCode: value }));

    if (value.length !== 6) return;

    try {
      setPincodeLoading(true);
      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const data = await res.json();

      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const stateName = postOffice.State;
        const cityName = postOffice.Block !== "NA" ? postOffice.Block : postOffice.District;

        const indiaCode = "IN";
        setSelectedCountryCode(indiaCode);

        const matchedState = State.getStatesOfCountry(indiaCode).find(
          (s) => s.name.toLowerCase() === stateName.toLowerCase()
        );
        const stateCode = matchedState?.isoCode || "";
        setSelectedStateCode(stateCode);

        setNewAddress((prev) => ({
          ...prev,
          country: "India",
          stateProvince: matchedState?.name || stateName,
          city: cityName,
        }));
      }
    } catch (error) {
      console.error("Pincode lookup failed:", error);
    } finally {
      setPincodeLoading(false);
    }
  };

  // Geolocation: auto-fill address from browser location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();

          if (data && data.address) {
            const addr = data.address;
            const pinCode = addr.postcode || "";
            const cityName = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
            const stateName = addr.state || "";
            const countryName = addr.country || "";
            const road = addr.road || "";
            const suburb = addr.suburb || addr.neighbourhood || "";
            const houseNumber = addr.house_number || "";
            const addressLine = [houseNumber, road, suburb].filter(Boolean).join(", ");

            // Match country code
            const matchedCountry = Country.getAllCountries().find(
              (c) => c.name.toLowerCase() === countryName.toLowerCase()
            );
            const countryCode = matchedCountry?.isoCode || "IN";
            setSelectedCountryCode(countryCode);

            // Match state code
            const matchedState = State.getStatesOfCountry(countryCode).find(
              (s) => s.name.toLowerCase() === stateName.toLowerCase()
            );
            const stateCode = matchedState?.isoCode || "";
            setSelectedStateCode(stateCode);

            setNewAddress((prev) => ({
              ...prev,
              address: addressLine || prev.address,
              zipPostalCode: pinCode,
              country: matchedCountry?.name || countryName,
              stateProvince: matchedState?.name || stateName,
              city: cityName,
            }));
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          alert("Could not fetch address from your location. Please enter manually.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("Location permission denied. Please allow location access and try again.");
        } else {
          alert("Unable to get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

  const addAddress = async () => {
    // Validate only required fields for address
    const errors = [
      b2cValidator.validateName(newAddress.firstName),
      b2cValidator.validateAddress(newAddress.address),
      b2cValidator.validateCity(newAddress.city),
      b2cValidator.validateState(newAddress.stateProvince),
      b2cValidator.validateZip(newAddress.zipPostalCode),
    ].filter(Boolean);

    // Only validate email if it's provided (optional field)
    if (newAddress.email && b2cValidator.validateEmail(newAddress.email)) {
      errors.push(b2cValidator.validateEmail(newAddress.email));
    }

    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }

    try {
      // Prepare address data without empty optional fields
      const addressData = {
        firstName: newAddress.firstName,
        lastName: newAddress.lastName || "",
        address: newAddress.address,
        city: newAddress.city,
        stateProvince: newAddress.stateProvince,
        zipPostalCode: newAddress.zipPostalCode,
        country: newAddress.country,
        email: newAddress.email || null, // Send null if empty
        phone: newAddress.phone || null, // Send null if empty
      };

      if (userRole === "B2B") {
        if (editingAddress) {
          await B2BAddressService.updateAddress(user.uid, "B2B", editingAddress.id, addressData);
        } else {
          await B2BAddressService.addAddress(user.uid, "B2B", addressData);
        }
      } else {
        if (editingAddress) {
          await userService.updateAddress(user.uid, editingAddress.id, addressData);
        } else {
          await userService.addAddress(user.uid, addressData);
        }
      }
      await refreshUserData();
      cancelAddressForm();
      alert(`Address ${editingAddress ? "updated" : "added"} successfully!`);
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

        let addressesList = [];
        try {
          const addressesResponse = await B2BAddressService.getAddresses(user.uid, "B2B");
          addressesList = addressesResponse.success ? addressesResponse.data : [];
        } catch (addrErr) {
          console.warn("refreshUserData: B2B address fetch failed:", addrErr.message);
        }

        if (completeProfile.success) {
          const userData = completeProfile.data;
          setB2bData((prev) => ({
            ...prev,
            username: userData.username || prev.username,
            email: userData.email || prev.email,
            mobile: userData.mobile || prev.mobile,
            pan: userData.pan || prev.pan,
            aadhaar: userData.aadhaar || prev.aadhaar,
            addresses: addressesList.length > 0 ? addressesList : prev.addresses,
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

    const country = Country.getAllCountries().find((c) => c.name === address.country);
    const countryCode = country?.isoCode || "";

    let stateCode = "";
    if (countryCode && address.stateProvince) {
      const state = State.getStatesOfCountry(countryCode).find(
        (s) => s.name === address.stateProvince
      );
      stateCode = state?.isoCode || "";
    }

    setSelectedCountryCode(countryCode);
    setSelectedStateCode(stateCode);

    setNewAddress({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      email: address.email || "",
      address: address.address || "",
      city: address.city || "",
      stateProvince: address.stateProvince || "",
      zipPostalCode: address.zipPostalCode || "",
      country: address.country || "",
      phone: address.phone || "",
    });
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
      country: "",
      phone: "",
    });
    setSelectedCountryCode("");
    setSelectedStateCode("");
  };

  if (loading || roleLoading) {
    return (
      <div className="flex mt-44 items-center justify-center h-64">
        <LazyImageLoader isProcessing={true} />
      </div>
    );
  }

  // User Details Section - B2C only (Name + Phone)
  const renderUserDetails = () => {
    return (
      <div className="mb-12">
        <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">User Details</h2>

        <div className="w-full max-w-md space-y-4">
          {/* Name Input */}
          <div>
            <input
              name="name"
              value={b2cData.name}
              onChange={handleB2cChange}
              disabled={!editUserMode}
              className="w-full p-4 border border-dashed border-gray-400 text-sm text-gray-700 focus:outline-none focus:border-[#33022F] disabled:bg-white"
              placeholder="Name"
            />
          </div>

          {/* Phone Input */}
          <div>
            <input
              name="phoneNumber"
              value={b2cData.phoneNumber}
              onChange={handleB2cChange}
              disabled={!editUserMode}
              className="w-full p-4 border border-dashed border-gray-400 text-sm text-gray-700 focus:outline-none focus:border-[#33022F] disabled:bg-white"
              placeholder="Phone Number"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {!editUserMode ? (
              <button
                onClick={() => setEditUserMode(true)}
                className="inline-flex items-center gap-2 px-6 py-2 border border-[#33022F] text-[#33022F] text-sm font-bold hover:bg-[#33022F] hover:text-white transition"
              >
                Edit
                <Edit2 size={16} />
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={saveUserData}
                  className="px-8 py-2 bg-[#33022F] text-white text-sm font-bold hover:bg-[#5a0452] transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditUserMode(false);
                  }}
                  className="px-8 py-2 bg-[#F5F5F5] text-gray-600 text-sm font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add/Edit Address Modal
  if (showAddAddress) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="py-6 border-b border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {editingAddress ? "Edit Shipping Address" : "Add Your Shipping Address"}
              </h2>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#33022F] text-[#33022F] text-xs font-bold rounded hover:bg-[#33022F] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {geoLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                    Detecting...
                  </>
                ) : (
                  <>
                    📍 Use My Location
                  </>
                )}
              </button>
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <input
                type="text"
                name="firstName"
                value={newAddress.firstName}
                onChange={handleNewAddressChange}
                placeholder="First Name *"
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                required
              />
            </div>

            {/* Last Name */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <input
                type="text"
                name="lastName"
                value={newAddress.lastName}
                onChange={handleNewAddressChange}
                placeholder="Last Name"
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Email (Optional) */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <input
                type="email"
                name="email"
                value={newAddress.email}
                onChange={handleNewAddressChange}
                placeholder="Email (Optional)"
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Phone (Optional) */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <input
                type="tel"
                name="phone"
                value={newAddress.phone}
                onChange={handleNewAddressChange}
                placeholder="Phone (Optional)"
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Address */}
            <div className="relative border border-dashed border-gray-400 p-3 col-span-1 md:col-span-2">
              <input
                name="address"
                value={newAddress.address}
                onChange={handleNewAddressChange}
                placeholder="Address (House No, Building, Street, Area) *"
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                required
              />
            </div>

            {/* Zip / Pin Code */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <input
                type="text"
                name="zipPostalCode"
                value={newAddress.zipPostalCode}
                onChange={handlePinCodeChange}
                placeholder="Pin Code / Zip Code *"
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                inputMode="numeric"
                maxLength={6}
                required
              />
              {pincodeLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Loading...</span>
              )}
            </div>

            {/* Country */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <select
                value={selectedCountryCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedCountryCode(code);
                  const country = Country.getCountryByCode(code);
                  setNewAddress((prev) => ({
                    ...prev,
                    country: country?.name || "",
                    stateProvince: "",
                    city: "",
                  }));
                  setSelectedStateCode("");
                }}
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                required
              >
                <option value="">Country *</option>
                {Country.getAllCountries().map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <select
                value={selectedStateCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedStateCode(code);
                  const state = State.getStateByCodeAndCountry(code, selectedCountryCode);
                  setNewAddress((prev) => ({
                    ...prev,
                    stateProvince: state?.name || "",
                    city: "",
                  }));
                }}
                disabled={!selectedCountryCode}
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                required
              >
                <option value="">State *</option>
                {selectedCountryCode &&
                  State.getStatesOfCountry(selectedCountryCode).map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* City */}
            <div className="relative border border-dashed border-gray-400 p-3">
              <select
                name="city"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                disabled={!selectedStateCode}
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                required
              >
                <option value="">City/District/Town *</option>
                {selectedStateCode &&
                  City.getCitiesOfState(selectedCountryCode, selectedStateCode).map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-6 col-span-1 md:col-span-2">
              <button
                onClick={addAddress}
                className="px-8 py-2.5 bg-[#33022F] text-white font-bold text-sm tracking-wide hover:bg-[#5a0452] transition"
              >
                {editingAddress ? "Update" : "Save"}
              </button>
              <button
                onClick={cancelAddressForm}
                className="px-8 py-2.5 bg-[#F5F5F5] text-gray-700 font-bold text-sm tracking-wide hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main View - Role-specific user details, shared address section
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-0 pb-6 lg:pb-12">
        <div className="max-w-7xl mx-auto">
          {userRole === "B2B" ? (
            <B2BUserDetails userData={b2bData} />
          ) : (
            renderUserDetails()
          )}

          {/* Address Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Address</h2>
              <button
                onClick={() => setShowAddAddress(true)}
                className="inline-flex items-center gap-2 px-6 py-2 border border-[#33022F] text-[#33022F] text-sm font-bold hover:bg-[#33022F] hover:text-white transition"
              >
                <Plus size={16} />
                Add New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(userRole === "B2B" ? b2bData.addresses : b2cData.addresses).length > 0 ? (
                (userRole === "B2B" ? b2bData.addresses : b2cData.addresses).map((address) => (
                  <div key={address.id} className="bg-[#F9F9F9] p-8 flex flex-col justify-between h-full min-h-[220px]">
                    {/* Address Details */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-2">
                        {address.firstName} {address.lastName || ""}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 font-medium">
                        {address.phone || "Phone not provided"}
                      </p>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {address.address}, {address.city}, {address.stateProvince}, {address.zipPostalCode}
                        {address.country && `, ${address.country}`}
                      </p>
                      {address.email && (
                        <p className="text-sm text-gray-500 mt-2">{address.email}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div>
                      <div className="flex gap-3 mb-6">
                        <span className="px-4 py-1.5 border border-gray-300 text-xs font-medium text-gray-600">Home</span>
                        <button
                          onClick={() => setDefaultAddress(address)}
                          className={`px-4 py-1.5 border text-xs font-medium transition ${address.isDefault ? "bg-[#33022F] text-white border-[#33022F]" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
                        >
                          {address.isDefault ? "Default Address" : "Set Default Address"}
                        </button>
                      </div>

                      <div className="flex gap-4 border-t border-gray-200 pt-4">
                        <button
                          onClick={() => removeAddress(address)}
                          className="text-sm font-bold text-gray-700 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => startEditAddress(address)}
                          className="text-sm font-bold text-gray-700 hover:text-[#33022F] transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded">
                  <p className="text-gray-500">No addresses added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;