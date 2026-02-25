import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";
import { updatePassword } from "firebase/auth";

const B2BUserDetails = ({ userData }) => {
    const [saving, setSaving] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    const [form, setForm] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
        aadhaar: "",
        pan: "",
    });

    // Load data from Firestore via userData prop
    useEffect(() => {
        if (userData) {
            setForm({
                email: userData.email || "",
                newPassword: "",
                confirmPassword: "",
                aadhaar: userData.aadhaar || "",
                pan: userData.pan || "",
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return alert("Not authenticated");

        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            return alert("Passwords do not match");
        }

        if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar)) {
            return alert("Aadhaar number must be exactly 12 digits");
        }

        if (
            form.pan &&
            !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase())
        ) {
            return alert("Invalid PAN format (e.g., ABCDE1234F)");
        }

        try {
            setSaving(true);

            await updateDoc(doc(db, "B2BBulkOrders_users", uid), {
                aadhaar: form.aadhaar,
                pan: form.pan.toUpperCase(),
                updatedAt: new Date(),
            });

            if (form.newPassword) {
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error("No authenticated user");
                await updatePassword(currentUser, form.newPassword);
            }

            setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
            alert("Profile updated successfully");
        } catch (error) {
            console.error("B2B profile update failed:", error);
            if (error.code === "auth/requires-recent-login") {
                alert("Please log out and log back in before changing your password.");
            } else {
                alert(error.message || "Failed to update profile");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (userData) {
            setForm({
                email: userData.email || "",
                newPassword: "",
                confirmPassword: "",
                aadhaar: userData.aadhaar || "",
                pan: userData.pan || "",
            });
        }
        setShowNewPwd(false);
        setShowConfirmPwd(false);
    };

    // Dotted border field with legend label (matches 3rd screenshot)
    const DottedField = ({
        label,
        name,
        value,
        onChange,
        type = "text",
        maxLength,
        disabled = false,
        showEye = false,
        eyeOpen,
        onToggleEye,
    }) => (
        <fieldset
            style={{
                border: "1.5px dashed #b0b0b0",
                borderRadius: "3px",
                padding: "0 0 4px 0",
                margin: 0,
            }}
        >
            <legend
                style={{
                    marginLeft: 10,
                    padding: "0 6px",
                    fontSize: 13,
                    color: "#888",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                }}
            >
                {label}
            </legend>
            <div style={{ display: "flex", alignItems: "center", padding: "0 14px" }}>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    maxLength={maxLength}
                    style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 14,
                        color: disabled ? "#999" : "#222",
                        padding: "6px 0",
                        cursor: disabled ? "not-allowed" : "text",
                    }}
                />
                {showEye && (
                    <button
                        type="button"
                        onClick={onToggleEye}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {eyeOpen ? (
                            <EyeOff size={18} color="#777" strokeWidth={1.5} />
                        ) : (
                            <Eye size={18} color="#777" strokeWidth={1.5} />
                        )}
                    </button>
                )}
            </div>
        </fieldset>
    );

    return (
        <div style={{ marginBottom: 48 }}>
            <h2
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 28,
                }}
            >
                User Details
            </h2>

            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Email ID — loaded from Firestore, read only */}
                <DottedField
                    label="Email ID"
                    name="email"
                    value={form.email}
                    disabled={true}
                />

                {/* New Password */}
                <DottedField
                    label="New Password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    type={showNewPwd ? "text" : "password"}
                    showEye={true}
                    eyeOpen={showNewPwd}
                    onToggleEye={() => setShowNewPwd(!showNewPwd)}
                />

                {/* Confirm Password */}
                <DottedField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPwd ? "text" : "password"}
                    showEye={true}
                    eyeOpen={showConfirmPwd}
                    onToggleEye={() => setShowConfirmPwd(!showConfirmPwd)}
                />

                {/* Aadhar Card Number — loaded from Firestore */}
                <DottedField
                    label="Aadhar Card Number"
                    name="aadhaar"
                    value={form.aadhaar}
                    onChange={handleChange}
                    maxLength={12}
                />

                {/* PAN Card Number — loaded from Firestore */}
                <DottedField
                    label="PAN Card Number"
                    name="pan"
                    value={form.pan}
                    onChange={handleChange}
                    maxLength={10}
                />

                {/* Save / Cancel buttons */}
                <div style={{ display: "flex", gap: 16, paddingTop: 16 }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            minWidth: 140,
                            padding: "14px 0",
                            background: "#290325",
                            color: "#fff",
                            fontSize: 15,
                            fontWeight: 600,
                            border: "none",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.6 : 1,
                        }}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        style={{
                            minWidth: 140,
                            padding: "14px 0",
                            background: "#f0f0f0",
                            color: "#999",
                            fontSize: 15,
                            fontWeight: 600,
                            border: "none",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.6 : 1,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default B2BUserDetails;
