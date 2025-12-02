import React, { useState } from "react";
import { Edit, Save, X, User } from "lucide-react";

const B2bMyInfo = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: "Raja",
    email: "raja@example.com",
    phone: "+1234567890",
    address: "123 Main St, City, State 12345",
    dateOfBirth: "1990-01-15",
    gender: "Male",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalInfo, setOriginalInfo] = useState({ ...userInfo });

  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setOriginalInfo({ ...userInfo });
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add your save logic here (API call, etc.)
    alert("Information saved successfully!");
    console.log("Saved user info:", userInfo);
  };

  const handleCancel = () => {
    setUserInfo({ ...originalInfo });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Info</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={16} />
              Edit Info
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{userInfo.fullName}</h2>
                <p className="text-gray-600">{userInfo.email}</p>
                <p className="text-sm text-gray-500">Member since 2023</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={userInfo.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={userInfo.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  disabled={!isEditing}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={userInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows="3"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  readOnly={!isEditing}
                  required
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Important Note</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Make sure all information is accurate before saving. Changes to your email
                      address may require verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">Total Orders</h4>
              <p className="text-2xl font-bold text-gray-900">64</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">Active Orders</h4>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">Total Spent</h4>
              <p className="text-2xl font-bold text-green-600">$1,472</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2bMyInfo;
