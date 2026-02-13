import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { Loader2, ArrowRight, ChevronLeft, Lock } from "lucide-react";

// --- Assets & Constants ---
const bodyTypes = [
  { id: "slim", label: "Slim", img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674506/Group_1_ijia0z.png" }, // Using existing/placeholder
  { id: "athletic", label: "Fit / Athletic", img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674506/noun-sexy-woman-body-687032_1_guoflx.png" },
  { id: "average", label: "Average", img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674506/noun-normal-woman-body-687036_1_hklqpb.png" },
  { id: "curvy", label: "Curvy", img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674507/Group_yiszhq.png" },
  { id: "chubby", label: "Chubby", img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674507/Group_yiszhq.png" }, // Need specific asset? using duplicate for now
  { id: "plus-size", label: "Plus Size", img: "https://res.cloudinary.com/doiezptnn/image/upload/v1757674507/Group_yiszhq.png" }
];

const skinTones = [
  { id: "porcelain", label: "Porcelain", color: "#F9E4D6" },
  { id: "ivory", label: "Ivory", color: "#F3D2B5" },
  { id: "warm-ivory", label: "Warm Ivory", color: "#F1C2A3" },
  { id: "sand", label: "Sand", color: "#E8B790" },
  { id: "beige", label: "Beige", color: "#E6C697" },
  { id: "warm-beige", label: "Warm beige", color: "#D9A873" },
  { id: "natural", label: "Natural", color: "#CE9F6F" },
  { id: "honey", label: "Honey", color: "#CD8E53" },
  { id: "golden", label: "Golden", color: "#C58848" },
  { id: "almond", label: "Almond", color: "#B47743" },
  { id: "chestnut", label: "Chestnut", color: "#A16335" },
  { id: "espresso", label: "Espresso", color: "#794626" },
];

const MultiStepQuestionnaire = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState("welcome"); // welcome, height, bodyShape, skinTone, success
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    heightVal: 178, // stored as cm internal reference or just value
    unit: "cm", // cm or ft
    heightCm: 178,
    heightFt: "5.10",
    bodyShape: "",
    skinTone: "",
    model: null
  });

  // Load existing data
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        // Checking B2C first as per previous logic
        let ref = doc(db, "b2c_users", user.uid);
        let snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.bodyType || data.skinTone) {
            // Pre-fill
            setFormData(prev => ({
              ...prev,
              bodyShape: data.bodyType || "",
              skinTone: data.skinTone || "",
              heightCm: data.height || 170
              // height handling might need adjustment if not previously saved
            }));
            // If data exists, maybe skip welcome? Or let user choose to edit.
            // setCurrentStep("welcome"); 
          }
        }
      } catch (e) {
        console.error("Load error", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);


  const handleNext = () => {
    if (currentStep === "height") setCurrentStep("bodyShape");
    else if (currentStep === "bodyShape") setCurrentStep("skinTone");
    else if (currentStep === "skinTone") saveProfile();
  };

  const handleBack = () => {
    if (currentStep === "height") setCurrentStep("welcome");
    else if (currentStep === "bodyShape") setCurrentStep("height");
    else if (currentStep === "skinTone") setCurrentStep("bodyShape");
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "b2c_users", user.uid);
      await updateDoc(docRef, {
        bodyType: formData.bodyShape,
        skinTone: formData.skinTone,
        height: formData.heightCm, // Saving standardized CM
        unit: formData.unit,
        updatedAt: new Date().toISOString()
      });
      setCurrentStep("success");
      // Auto revert to welcome or main page after delay?
      setTimeout(() => setCurrentStep("welcome"), 3000);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // --- RENDERERS ---

  if (loading) {
    return <div className="min-h-screen flex text-center items-center justify-center"><Loader2 className="animate-spin text-[#33022F]" /></div>;
  }

  // 1. WELCOME SCREEN
  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FCFCFC] pt-20 pb-20">
        <div className="w-full max-w-sm text-center">
          {/* Icon Graphic */}
          <div className="mx-auto w-24 h-24 bg-[#C84F4F] rounded relative mb-8 flex items-center justify-center">
            {/* Placeholder for the user avatar graphic */}
            <div className="text-white text-6xl">👤</div>
            {/* Sparkles */}
            <div className="absolute -top-2 -right-2 text-yellow-400 text-xl">✨</div>
            <div className="absolute bottom-2 -left-4 text-pink-300 text-lg">✨</div>
          </div>

          <h1 className="text-xl font-bold text-[#141B34] mb-3">Create Your Tryon Profile</h1>
          <p className="text-[#64748B] text-sm mb-12 leading-relaxed">
            Answer a few quick questions to see outfits on a virtual version of you.
          </p>

          <button
            onClick={() => setCurrentStep("height")}
            style={{ background: "var(--villy-primary, #33022F)" }}
            className="w-full py-4 text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition mb-4"
          >
            Start Creating
          </button>

          <button className="w-full py-4 bg-[#F8F9FA] text-[#64748B] text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition">
            Maybe Later
          </button>

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-[#141B34] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Private & Secure
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#141B34] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Takes 2 minutes
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. HEIGHT SCREEN
  if (currentStep === "height") {
    return (
      <WizardLayout
        step={1}
        totalSteps={3}
        onBack={handleBack}
        title="How tall are you?"
        subtitle="We'll use this to scale your virtual try-on accurately."
      >
        <div className="flex flex-col items-center py-10">
          {/* Unit Toggle */}
          <div className="flex bg-[#F3F0F0] p-1 rounded mb-10">
            <button
              onClick={() => setFormData({ ...formData, unit: 'cm' })}
              style={{ background: formData.unit === 'cm' ? "var(--villy-primary, #33022F)" : "transparent" }}
              className={`px-6 py-2 text-sm font-medium transition rounded ${formData.unit === 'cm' ? 'text-white' : 'text-gray-500'}`}
            >
              cm
            </button>
            <button
              onClick={() => setFormData({ ...formData, unit: 'ft' })}
              style={{ background: formData.unit === 'ft' ? "var(--villy-primary, #33022F)" : "transparent" }}
              className={`px-6 py-2 text-sm font-medium transition rounded ${formData.unit === 'ft' ? 'text-white' : 'text-gray-500'}`}
            >
              ft
            </button>
          </div>

          {/* Value Display */}
          <div className="text-center mb-10">
            <span className="text-6xl font-normal text-[#141B34]">
              {formData.unit === 'cm' ? formData.heightCm : formData.heightFt}
            </span>
            <span className="text-2xl text-gray-400 ml-2">{formData.unit}</span>
          </div>

          {/* Slider */}
          <div className="w-full max-w-xs px-4">
            <input
              type="range"
              min={formData.unit === 'cm' ? 140 : 4.0}
              max={formData.unit === 'cm' ? 220 : 7.0}
              step={formData.unit === 'cm' ? 1 : 0.1}
              value={formData.unit === 'cm' ? formData.heightCm : parseFloat(formData.heightFt)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (formData.unit === 'cm') {
                  setFormData({ ...formData, heightCm: val });
                } else {
                  setFormData({ ...formData, heightFt: val.toFixed(1) }); // simplified ft logic
                }
              }}
              className="w-full accent-[#33022F] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleNext}
          style={{ background: "var(--villy-primary, #33022F)" }}
          className="w-full py-4 text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </WizardLayout>
    );
  }

  // 3. BODY SHAPE
  if (currentStep === "bodyShape") {
    return (
      <WizardLayout
        step={2}
        totalSteps={3}
        onBack={handleBack}
        title="Which body shape describes you best?"
        subtitle="This helps us show you how clothes will fit your unique silhouette."
      >
        <div className="grid grid-cols-2 gap-4 mb-8">
          {bodyTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFormData({ ...formData, bodyShape: type.id })}
              className={`p-6 border rounded flex flex-col items-center justify-center gap-4 transition-all h-40 ${formData.bodyShape === type.id
                ? "border-[#FCF5F5] bg-[#FCF5F5] ring-1 ring-[#33022F]"
                : "border-gray-100 bg-white hover:border-gray-200"
                }`}
            >
              <span className="text-sm font-medium text-[#141B34]">{type.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!formData.bodyShape}
          style={{ background: formData.bodyShape ? "var(--villy-primary, #33022F)" : undefined }}
          className={`w-full py-4 text-white text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 ${formData.bodyShape ? "hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </WizardLayout>
    );
  }

  // 4. SKIN TONE
  if (currentStep === "skinTone") {
    return (
      <WizardLayout
        step={3}
        totalSteps={3}
        onBack={handleBack}
        title="Which skin tone is closest to yours?"
        subtitle="This ensures your virtual avatar represents you authentically."
      >
        <div className="grid grid-cols-4 gap-3 mb-10">
          {skinTones.map(tone => (
            <button
              key={tone.id}
              onClick={() => setFormData({ ...formData, skinTone: tone.id })}
              className={`flex flex-col items-center gap-2 group`}
            >
              <div
                className={`w-full aspect-square rounded shadow-sm transition-transform ${formData.skinTone === tone.id ? "scale-110 ring-2 ring-[#33022F] ring-offset-2" : ""
                  }`}
                style={{ backgroundColor: tone.color }}
              />
              <span className={`text-[10px] sm:text-xs font-medium ${formData.skinTone === tone.id ? "text-[#141B34]" : "text-gray-400 group-hover:text-gray-600"
                }`}>
                {tone.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={saveProfile}
          disabled={!formData.skinTone || saving}
          style={{ background: formData.skinTone ? "var(--villy-primary, #33022F)" : undefined }}
          className={`w-full py-4 text-white text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 ${formData.skinTone ? "hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : (
            <>
              Continue
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </WizardLayout>
    );
  }

  // SUCCESS
  if (currentStep === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#141B34] mb-2">Profile Created!</h2>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    )
  }

  return null;
};

// --- HELPER WRAPPER ---
const WizardLayout = ({ step, totalSteps, onBack, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      {/* Header */}
      <div className="pt-8 px-6 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-8">
          <span>{step} of {totalSteps}</span>
          <div className="h-[1px] flex-1 bg-gray-200">
            <div
              style={{ width: `${(step / totalSteps) * 100}%`, background: "var(--villy-primary, #33022F)" }}
              className="h-full transition-all duration-300"
            />
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-medium mb-8"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <h2 className="text-lg font-bold text-[#141B34] mb-2">{title}</h2>
        <p className="text-[#64748B] text-sm mb-10">{subtitle}</p>

        {children}
      </div>
    </div>
  );
};

export default MultiStepQuestionnaire;
