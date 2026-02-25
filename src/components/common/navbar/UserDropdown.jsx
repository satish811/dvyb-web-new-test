import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import B2BAuthService from "../../../services/b2bAuthService";

const UserDropdown = ({ user, onLogout }) => {
    const [isB2B, setIsB2B] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;
        const checkRole = async () => {
            try {
                const profile = await B2BAuthService.getUserCompleteProfile(user.uid);
                if (profile?.success && profile?.data) {
                    const data = profile.data;
                    setIsB2B(!!(data.pan || data.aadhaar));
                }
            } catch {
                setIsB2B(false);
            }
        };
        checkRole();
    }, [user]);

    if (!user) return null;

    // Helper to mask phone or email
    const getMaskedContact = () => {
        if (user.phoneNumber) {
            const phone = user.phoneNumber;
            return phone.substring(0, 2) + "*".repeat(phone.length - 2);
        }
        if (user.email) {
            const [name, domain] = user.email.split("@");
            return name.substring(0, 2) + "*".repeat(Math.max(0, name.length - 2)) + "@" + domain;
        }
        return "";
    };

    const displayName = user.displayName || user.name || "User";
    const contact = getMaskedContact();

    const allLinks = [
        { label: "MY INFO", to: "/profile?tab=my-info", b2cOnly: false },
        { label: "MY ORDERS", to: "/profile?tab=my-orders", b2cOnly: false },
        { label: "MY MODEL", to: "/profile?tab=profile-creation", b2cOnly: true },
        { label: "MY TRY-ON GALLERY", to: "/profile?tab=my-tryon-gallery", b2cOnly: true },
        { label: "MY WISHLIST", to: "/wishlist", b2cOnly: false },
    ];

    const links = isB2B
        ? allLinks.filter((link) => !link.b2cOnly)
        : allLinks;

    return (
        <div className="absolute top-full right-0 mt-0 w-64 bg-white shadow-lg border border-gray-100 py-4 px-6 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out transform translate-y-2 group-hover:translate-y-0 before:content-[''] before:absolute before:top-[-10px] before:right-0 before:w-full before:h-[20px] before:bg-transparent">
            {/* Header */}
            <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                    HELLO {displayName}
                </h3>
                <p className="text-gray-500 text-xs font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {contact}
                </p>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Links */}
            <div className="flex flex-col space-y-4 mb-4">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        to={link.to}
                        className="text-gray-700 text-sm font-medium hover:text-black hover:font-bold transition-colors uppercase"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Logout */}
            <button
                onClick={onLogout}
                className="text-red-600 text-sm font-medium hover:text-black hover:font-bold transition-colors uppercase w-full text-left"
                style={{ fontFamily: "Outfit, sans-serif" }}
            >
                LOGOUT
            </button>
        </div>
    );
};

export default UserDropdown;
