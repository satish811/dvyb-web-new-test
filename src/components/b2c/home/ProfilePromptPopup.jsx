import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { profileService } from "../../../services/profileService";
import { X } from "lucide-react";

export default function ProfilePromptPopup() {
    const { user, userRole, loading } = useAuth();
    const navigate = useNavigate();

    const [isVisible, setIsVisible] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Don't run while auth is still loading — wait for user/role to be resolved
        if (loading) return;

        let isMounted = true;

        const checkProfileAndShowPopup = async () => {
            // Already dismissed in this session — skip
            if (sessionStorage.getItem('profilePromptDismissed') === 'true') {
                if (isMounted) setHasChecked(true);
                return;
            }

            // Only show for logged-in B2C users (not guests, not B2B)
            if (!user || userRole === "B2B") {
                if (isMounted) setHasChecked(true);
                return;
            }

            try {
                const profile = await profileService.getProfile();
                const hasModel = !!(profile && (profile.photoUrl || (Array.isArray(profile.savedModels) && profile.savedModels.length > 0)));

                if (!isMounted) return;

                if (!hasModel) {
                    setIsVisible(true);
                    document.body.style.overflow = 'hidden';
                }
            } catch (err) {
                // Silently handle — don't crash the page
                console.warn("ProfilePromptPopup: Could not check profile:", err.message);
            } finally {
                if (isMounted) setHasChecked(true);
            }
        };

        checkProfileAndShowPopup();

        // Cleanup: cancel stale async updates + restore body scroll
        return () => {
            isMounted = false;
            document.body.style.overflow = '';
        };
    }, [user, userRole, loading]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('profilePromptDismissed', 'true');
        document.body.style.overflow = '';
    };

    const handleNavigate = () => {
        handleClose();
        navigate("/profile?tab=profile-creation");
    };

    // Don't render anything while loading, not yet checked, or dismissed
    if (loading || !hasChecked || !isVisible) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-20 md:pt-28 bg-black/30 backdrop-blur-sm overflow-y-auto"
            onClick={handleClose}
        >
            {/* Modal Container — stop click propagation so clicking inside doesn't close */}
            <div
                className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-w-lg w-[calc(100%-2rem)] p-8 md:p-10 relative flex flex-col items-center text-center my-4"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Top Icon */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#532653] to-[#33022F] flex items-center justify-center mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>

                {/* Heading */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: "Outfit, sans-serif" }}>
                    Save Your First Model
                </h2>

                {/* Sub-text */}
                <p className="text-sm md:text-base text-[#45556C] leading-relaxed max-w-sm mx-auto mb-8"
                    style={{ fontFamily: "Inter, sans-serif" }}>
                    Give your model a name, upload a photo, and save up to 4 models for future try-ons.
                </p>

                {/* CTA Button */}
                <button
                    onClick={handleNavigate}
                    className="bg-[#33022F] text-white w-full max-w-xs py-4 text-sm font-bold tracking-[0.15em] uppercase hover:bg-[#460341] hover:shadow-xl transition-all duration-300 rounded-[4px]"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                >
                    SAVE MY MODEL
                </button>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-[11px] md:text-xs font-semibold text-gray-600">Private & Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="text-[11px] md:text-xs font-semibold text-gray-600">Up to 4 Saved Models</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span className="text-[11px] md:text-xs font-semibold text-gray-600">AI-Powered Try-On</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
