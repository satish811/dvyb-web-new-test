import React, { useState, useEffect } from "react";
import { Edit2, Plus, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import b2cValidator from "../../../utils/B2CValidator";
import B2BAddressValidator from "../../../utils/validators/b2bAddressValidator";
import B2BAuthService from "../../../services/b2bAuthService";
import B2BAddressService from "../../../services/b2bAddressService";
import { Country, State, City } from "country-state-city";
import LazyImageLoader from "../LazyImageLoader/LazyImageLoader";

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

  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    country: "",
  });

  // Fetch user data on mount
  useEffect(() => {
    const getUserRoleAndData = async () => {
      if (!user?.uid) return;

      try {
        setRoleLoading(true);
        setLoading(true);

        // Try to get B2B user complete profile first
        try {
          const completeProfile = await B2BAuthService.getUserCompleteProfile(user.uid);

          if (completeProfile && completeProfile.success && completeProfile.data) {
            const userData = completeProfile.data;
            const hasB2BData = userData.pan || userData.aadhaar;

            if (hasB2BData) {
              setUserRole("B2B");
              console.log("User is B2B with complete profile:", completeProfile.data);

              const addressesResponse = await B2BAddressService.getAddresses(user.uid, "B2B");

              setB2bData({
                username: userData.username || "",
                email: userData.email || user.email || "",
                mobile: userData.mobile || "",
                pan: userData.pan || "",
                aadhaar: userData.aadhaar || "",
                addresses: addressesResponse.success ? addressesResponse.data : [],
              });
            } else {
              setUserRole("B2C");
              await fetchB2CData();
            }
          } else {
            setUserRole("B2C");
            await fetchB2CData();
          }
        } catch (b2bError) {
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
    const errors = [
      b2cValidator.validateName(newAddress.firstName),
      b2cValidator.validateAddress(newAddress.address),
      b2cValidator.validateEmail(newAddress.email),
      b2cValidator.validateCity(newAddress.city),
      b2cValidator.validateState(newAddress.stateProvince),
      b2cValidator.validateZip(newAddress.zipPostalCode),
    ].filter(Boolean);

    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }

    try {
      if (userRole === "B2B") {
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
        const addressesResponse = await B2BAddressService.getAddresses(user.uid, "B2B");

        if (completeProfile.success) {
          const userData = completeProfile.data;
          setB2bData((prev) => ({
            ...prev,
            username: userData.username || prev.username,
            email: userData.email || prev.email,
            mobile: userData.mobile || prev.mobile,
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


    const country = Country.getAllCountries().find(c => c.name === address.country);
    const countryCode = country?.isoCode || "";


    let stateCode = "";
    if (countryCode && address.stateProvince) {
      const state = State.getStatesOfCountry(countryCode).find(s => s.name === address.stateProvince);
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
    });
    setSelectedCountryCode("");
    setSelectedStateCode("");
  };

  if (loading || roleLoading) {
    return (
      <div className="flex  mt-44 items-center justify-center h-64">
       < LazyImageLoader isProcessing={true} />
        {/* <div className="animate-spin h-8 w-8 border-b-2 border-amber-400"></div> */}
      </div>
    );
  }

  // User Details Edit Modal - Same design for both B2B and B2C
  if (editUserMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {userRole === "B2B" ? "Business Details (B2B)" : "User Details"}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {userRole === "B2B" ? (
              // B2B Edit Form - Same design as B2C
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    name="username"
                    value={b2bData.username}
                    onChange={handleB2bChange}
                    className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    value={b2bData.mobile || "Not provided"}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mobile number cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    value={b2bData.email || "Not provided"}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    value={b2bData.pan || "Not provided"}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">PAN number cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                  <input
                    value={b2bData.aadhaar || "Not provided"}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Aadhaar number cannot be changed</p>
                </div>
              </>
            ) : (
              // B2C Edit Form - Original design
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    value={b2cData.name}
                    onChange={handleB2cChange}
                    className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={b2cData.phoneNumber}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 bg-gray-50 text-gray-500"
                    placeholder="Phone Number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveUserData}
                className="flex-1 bg-red-700 text-white py-2.5 hover:bg-red-800 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setEditUserMode(false)}
                className="flex-1 bg-white text-gray-700 py-2.5 border border-gray-300 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit Address Modal - Same design as the working version
  if (showAddAddress) {
    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-2xl mx-auto">
          {/* HEADER */}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingAddress ? "Edit Shipping Address" : "Add Your Shipping Address"}
              {userRole === "B2B" && " (B2B)"}
            </h2>
          </div>

          {/* FORM */}
          <div className="md:p-6 flex flex-col md:grid md:grid-cols-2 gap-7">
            {/* First Name */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={newAddress.firstName}
                onChange={handleNewAddressChange}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900"
                required
              />
            </div>

            {/* Last Name */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={newAddress.lastName}
                onChange={handleNewAddressChange}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900"
              />
            </div>

            {/* Email */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={newAddress.email}
                onChange={handleNewAddressChange}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900"
              />
            </div>

            {/* Zip Code */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                Zip / Postal Code
              </label>
              <input
                type="text"
                name="zipPostalCode"
                value={newAddress.zipPostalCode}
                onChange={handleNewAddressChange}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900"
              />
            </div>

            {/* Address */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                Address / Landmark *
              </label>
              <textarea
                name="address"
                value={newAddress.address}
                onChange={handleNewAddressChange}
                rows="2"
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900 resize-none"
                required
              />
            </div>

            {/* Country */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                Country *
              </label>
              <select
                value={selectedCountryCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedCountryCode(code);
                  const country = Country.getCountryByCode(code);
                  setNewAddress(prev => ({
                    ...prev,
                    country: country?.name || "",
                    stateProvince: "",
                    city: ""
                  }));
                  setSelectedStateCode("");
                }}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900 bg-transparent"
                required
              >
                <option value="">Select Country</option>
                {Country.getAllCountries().map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                State / Province *
              </label>
              <select
                value={selectedStateCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedStateCode(code);
                  const state = State.getStateByCodeAndCountry(code, selectedCountryCode);
                  setNewAddress(prev => ({
                    ...prev,
                    stateProvince: state?.name || "",
                    city: ""
                  }));
                }}
                disabled={!selectedCountryCode}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900 bg-transparent"
                required
              >
                <option value="">Select State</option>
                {selectedCountryCode &&
                  State.getStatesOfCountry(selectedCountryCode).map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* City */}
            <div className="relative border border-dotted border-gray-400 px-3 pt-3 pb-1">
              <label className="absolute -top-2 left-3 bg-white text-gray-500 text-xs px-1">
                City *
              </label>
              <select
                name="city"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                disabled={!selectedStateCode}
                className="w-full border-none focus:outline-none focus:ring-0 text-sm text-gray-900 bg-transparent"
                required
              >
                <option value="">Select City</option>
                {selectedStateCode &&
                  City.getCitiesOfState(selectedCountryCode, selectedStateCode).map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))
                }
              </select>
            </div>


            {/* BUTTONS */}
            <div className="flex gap-3 pt-6 col-span-2">
              <button
                onClick={addAddress}
                className="flex-1 bg-red-700 text-white py-2.5 hover:bg-red-800 font-medium"
              >
                {editingAddress ? "Update" : "Save"}
              </button>
              <button
                onClick={cancelAddressForm}
                className="flex-1 bg-white text-gray-700 py-2.5 border border-gray-300 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main View - Same design for both B2B and B2C
  return (
    <div className="min-h-screen mt-24 bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* User Details Section */}
        <div className="bg-white shadow-sm mb-4">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-900">
              {userRole === "B2B" ? "Business Information (B2B)" : "User Details"}
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-4">
              {userRole === "B2B" ? (
                // B2B Display - Same design as B2C
                <>
                  <div>
                    <label className="text-xs text-gray-500">Username</label>
                    <input
                      value={b2bData.username || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Mobile Number</label>
                    <input
                      value={b2bData.mobile || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <input
                      value={b2bData.email || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">PAN Number</label>
                    <input
                      value={b2bData.pan || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Aadhaar Number</label>
                    <input
                      value={b2bData.aadhaar || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                </>
              ) : (
                // B2C Display - Original design
                <>
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <input
                      value={b2cData.name || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Phone Number</label>
                    <input
                      value={b2cData.phoneNumber || "Not provided"}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setEditUserMode(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* Address Section - Same design for both */}
        <div className="bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Addresses</h2>
            <button
              onClick={() => setShowAddAddress(true)}
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              <Plus size={18} />
              Add New
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(userRole === "B2B" ? b2bData.addresses : b2cData.addresses).length > 0 ? (
                (userRole === "B2B" ? b2bData.addresses : b2cData.addresses).map((address) => (
                  <div key={address.id} className="bg-[#F6F6F6] p-8 relative">
                    {address.isDefault && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {address.firstName} {address.lastName}
                        </h3>
                        {address.email && (
                          <p className="text-sm pt-5 text-gray-600">{address.email}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 pt-4 leading-relaxed mb-2">
                      {address.address}
                    </p>

                    {(address.city || address.stateProvince || address.zipPostalCode) && (
                      <p className="text-sm text-gray-600 mb-4">
                        {[address.city, address.stateProvince, address.zipPostalCode]
                          .filter(Boolean)
                          .join(", ")}
                        {address.country && ` - ${address.country}`}
                      </p>
                    )}

                    <div className="flex gap-2 pt-5 mb-3">
                      {!address.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(address)}
                          className="px-4 py-1.5 bg-white border border-[#807D7E] text-sm text-[#807D7E] hover:bg-gray-100 font-medium"
                        >
                          Set as Default Address
                        </button>
                      )}
                    </div>

                    <div className="flex pt-5 gap-3">
                      <button onClick={() => removeAddress(address)} className="text-s font-medium">
                        Remove
                      </button>
                      <button
                        onClick={() => startEditAddress(address)}
                        className="text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <p className="text-sm">No addresses added yet</p>
                  <p className="text-xs mt-1">Click "Add New" to add your first address</p>
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