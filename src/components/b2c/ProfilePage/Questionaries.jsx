import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig"; // Adjust path as needed
import { useAuth } from "../../../context/AuthContext"; // Adjust path as needed
import { Loader2, CheckCircle } from "lucide-react";

const MultiStepQuestionnaire = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState("initial");
  const [selections, setSelections] = useState({
    model: null,
    bodyType: null,
    skinTone: null,
    hairStyle: null,
    hairColor: null,
  });

  const hairColors = ["Black", "Brown", "Blonde", "Burgundy"];
  const hairStyles = ["Wavy", "Straight", "Coily", "Curly"];

  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  // Dynamic body types configuration
  const bodyTypes = [
    {
      id: "fat",
      label: "Fat Body",
      icon: "🟡",
      img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674507/Group_yiszhq.png",
    },
    {
      id: "normal",
      label: "Normal Body",
      icon: "🔵",
      img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674506/noun-normal-woman-body-687036_1_hklqpb.png",
    },
    {
      id: "superfit",
      label: "Super Fit Body",
      icon: "💪",
      img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674506/noun-sexy-woman-body-687032_1_guoflx.png",
    },
    {
      id: "slim",
      label: "Slim Body",
      icon: "📏",
      img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674506/Group_1_ijia0z.png",
    },
  ];

  // Dynamic skin tones configuration
  const skinTones = [
    { id: "very-fair", label: "Very Fair", color: "bg-orange-100" },
    { id: "fair", label: "Fair", color: "bg-orange-200" },
    { id: "medium", label: "Medium", color: "bg-orange-300" },
    { id: "tan", label: "Tan", color: "bg-orange-400" },
    { id: "deep", label: "Deep", color: "bg-orange-600" },
  ];

  // Load existing selections from Firebase
  useEffect(() => {
    if (!user) return;

    const loadExistingData = async () => {
      try {
        setLoading(true);

        // Try fetching from b2c_users first
        let ref = doc(db, "b2c_users", user.uid);
        let snap = await getDoc(ref);

        if (snap.exists()) {
          setCollectionName("b2c_users");
          const userData = snap.data();
          setSelections({
            model: userData.model || null,
            bodyType: userData.bodyType || null,
            skinTone: userData.skinTone || null,
            hairStyle: userData.hairStyle || null,
            hairColor: userData.hairColor || null,
          });
        } else {
          // If not found, try B2BBulkOrders_users
          ref = doc(db, "B2BBulkOrders_users", user.uid);
          snap = await getDoc(ref);
          if (snap.exists()) {
            setCollectionName("B2BBulkOrders_users");
            const userData = snap.data();
            setSelections({
              model: userData.model || null,
              bodyType: userData.bodyType || null,
              skinTone: userData.skinTone || null,
              hairStyle: userData.hairStyle || null,
              hairColor: userData.hairColor || null,
            });
          }
        }
      } catch (error) {
        console.error("Error loading existing data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (currentStep === "bodyType" || currentStep === "skinTone" || currentStep === "hair") {
      setCurrentStep("main");
    }
  };

  const handleSelection = (category, value) => {
    setSelections((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSave = async () => {
    if (!user || !collectionName) {
      console.error("User not authenticated or collection not determined");
      return;
    }

    // ✅ Check if both fields are selected
    if (
      !selections.bodyType ||
      !selections.skinTone ||
      !selections.hairStyle ||
      !selections.hairColor
    ) {
      setCurrentStep("main");
      return;
    }

    try {
      setLoading(true);

      // Update Firestore document
      const docRef = doc(db, collectionName, user.uid);
      await updateDoc(docRef, {
        bodyType: selections.bodyType,
        skinTone: selections.skinTone,
        hairStyle: selections.hairStyle,
        hairColor: selections.hairColor,
        model: selections.model,
        updatedAt: new Date().toISOString(),
      });

      // Show success message
      setShowSaveMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSaveMessage(false);
        setCurrentStep("main");
      }, 3000);
    } catch (error) {
      console.error("Error saving selections:", error);
      alert("Error saving selections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && currentStep === "initial") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 px-4 sm:px-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600 text-sm sm:text-base">Loading your preferences...</span>
        </div>
      </div>
    );
  }

  // Success message overlay
  if (showSaveMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 px-4 sm:px-6">
        <div className="w-full flex items-center justify-evenly max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <img
            src="https://res.cloudinary.com/doiezptnn/image/upload/v1757676610/Group_3_xxjwsg.png"
            alt=""
          />
          {/* <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Success!</h2> */}
          <p className="text-base sm:text-lg text-gray-600">Model Saved Successfully</p>
        </div>
      </div>
    );
  }

  // Initial questionnaire button
  if (currentStep === "initial") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 px-4 sm:px-6">
        <div className="w-full max-w-96 sm:max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Model Preferences</h2>
            <p className="text-gray-600 text-sm sm:text-base">Customize your model preferences</p>
          </div>
          <button
            onClick={() => handleStepChange("main")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-md transition-colors duration-200 text-sm sm:text-base"
          >
            {selections.bodyType || selections.skinTone
              ? "Edit Preferences"
              : "Start Questionnaire"}
          </button>
        </div>
      </div>
    );
  }

  // Main questionnaire screen
  if (currentStep === "main") {
    return (
      <div className="min-h-screen p-4 px-4 sm:px-6 bg-gray-50 sm:bg-transparent">
        <div className="w-full max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Model Preferences
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Body Type Selection */}
              <div
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleStepChange("bodyType")}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://res.cloudinary.com/doiezptnn/image/upload/v1757669308/Body_scqg9v.png"
                      alt=""
                      className="w-4 h-4 sm:w-6 sm:h-6"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      Body Type
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {selections.bodyType
                        ? bodyTypes.find((bt) => bt.id === selections.bodyType)?.label
                        : "Choose Body Type"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {selections.bodyType && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  )}
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Skin Tone Selection */}
              <div
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleStepChange("skinTone")}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-12 h-12 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://res.cloudinary.com/doiezptnn/image/upload/v1757669323/Hair_zqikyb.png"
                      alt=""
                      className="w-12 h-12 sm:w-6 sm:h-6"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      Skin Tone
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {selections.skinTone
                        ? skinTones.find((st) => st.id === selections.skinTone)?.label
                        : "Choose Skin Tone"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {selections.skinTone && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  )}
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Hair Selection */}
              <div
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleStepChange("hair")}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://res.cloudinary.com/doiezptnn/image/upload/v1757669323/SkinTone_gz4isj.png"
                      alt=""
                      className="w-4 h-4 sm:w-6 sm:h-6"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      Hair
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {selections.hairStyle && selections.hairColor
                        ? `${selections.hairStyle}, ${selections.hairColor}`
                        : "Choose Hair Style & Color"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {selections.hairStyle && selections.hairColor && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  )}
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 sm:p-6 pt-0">
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Body Type Selection Screen
  if (currentStep === "bodyType") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Select Body Type
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {bodyTypes.map((bodyType) => (
                <div
                  key={bodyType.id}
                  className={`flex items-center p-3 sm:p-4 rounded-lg cursor-pointer transition-colors 
                    ${
                      selections.bodyType === bodyType.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => handleSelection("bodyType", bodyType.id)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full flex-shrink-0
                         ${
                           selections.bodyType === bodyType.id
                             ? "bg-white text-white"
                             : "bg-white hover:bg-gray-100"
                         }  `}
                    >
                      <img src={bodyType.img} className="h-8 sm:h-10 m-1 sm:m-2" alt="" />
                    </div>
                    <span className="font-medium text-sm sm:text-base truncate">
                      {bodyType.label}
                    </span>
                  </div>
                  {selections.bodyType === bodyType.id && (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleBack}
              className="w-full sm:flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !selections.bodyType}
              className="w-full sm:flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "hair") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Hair Preferences
            </h2>

            <div className="space-y-2 sm:space-y-3">
              <div
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleStepChange("hairStyle")}
              >
                <p className="font-medium text-sm sm:text-base">Hair Style</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate max-w-20 sm:max-w-none text-right">
                  {selections.hairStyle || "Choose Hair Style"}
                </p>
              </div>

              <div
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleStepChange("hairColor")}
              >
                <p className="font-medium text-sm sm:text-base">Hair Color</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate max-w-20 sm:max-w-none text-right">
                  {selections.hairColor || "Choose Hair Color"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 pt-0">
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Save Hair Preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Skin Tone Selection Screen
  if (currentStep === "skinTone") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Select Skin Tone
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {skinTones.map((tone) => (
                <div
                  key={tone.id}
                  className={`flex items-center p-3 sm:p-4 rounded-lg cursor-pointer transition-colors ${
                    selections.skinTone === tone.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelection("skinTone", tone.id)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${tone.color} border-2 border-white shadow-sm flex-shrink-0`}
                    ></div>
                    <span className="font-medium text-sm sm:text-base truncate">{tone.label}</span>
                  </div>
                  {selections.skinTone === tone.id && (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleBack}
              className="w-full sm:flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !selections.skinTone}
              className="w-full sm:flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "hairStyle") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Select Hair Style
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {hairStyles.map((style) => (
                <div
                  key={style}
                  className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors text-sm sm:text-base ${
                    selections.hairStyle === style
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelection("hairStyle", style)}
                >
                  {style}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => handleStepChange("hair")}
              className="w-full sm:flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "hairColor") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Select Hair Color
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {hairColors.map((color) => (
                <div
                  key={color}
                  className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors text-sm sm:text-base ${
                    selections.hairColor === color
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelection("hairColor", color)}
                >
                  {color}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => handleStepChange("hair")}
              className="w-full sm:flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Default return (shouldn't reach here)
  return null;
};

export default MultiStepQuestionnaire;
