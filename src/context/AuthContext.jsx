// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth, db } from "../config";
import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCollection, setUserCollection] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [intendedUserType, setIntendedUserType] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const detectUserType = () => {
    const urlParams = new URLSearchParams(location.search);
    const userType = urlParams.get("usertype");
    const path = location.pathname;

    if (userType === "b2b" || path.includes("b2b")) {
      return "B2B";
    } else if (userType === "b2c" || path.includes("b2c")) {
      return "B2C";
    } else if (userRole) {
      return userRole;
    } else {
      return "B2C";
    }
  };

  const getCollectionInfo = (userType) => {
    if (userType === "B2B") {
      return {
        collection: "B2BBulkOrders_users",
        role: "B2B",
        route: "/usertype=b2b",
      };
    } else {
      return {
        collection: "b2c_users",
        role: "B2C",
        route: "/",
      };
    }
  };

  const ensureUserCollection = async (firebaseUser) => {
    try {
      const detectedType = detectUserType();
      const currentUserType = getCollectionInfo(detectedType);

      const [b2cSnap, b2bSnap] = await Promise.all([
        getDoc(doc(db, "b2c_users", firebaseUser.uid)),
        getDoc(doc(db, "B2BBulkOrders_users", firebaseUser.uid)),
      ]);

      let userCollection, userRole, userData;

      // Determine role based on HOW the user signed in
      const providerId = firebaseUser.providerData?.[0]?.providerId;
      const isPhoneLogin = providerId === "phone";
      const isEmailLogin = providerId === "password";

      console.log("AuthContext: sign-in provider:", providerId, "| isPhone:", isPhoneLogin, "| isEmail:", isEmailLogin);

      if (isPhoneLogin) {
        // Phone OTP login = ALWAYS B2C
        if (b2cSnap.exists()) {
          userCollection = "b2c_users";
          userRole = "B2C";
          userData = b2cSnap.data();
        } else {
          // Create B2C doc for phone user
          userCollection = "b2c_users";
          userRole = "B2C";
          userData = {
            uid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber || null,
            email: firebaseUser.email || null,
            name: firebaseUser.displayName || "",
            address: "",
            wishlist: [],
            cart: [],
            orders: [],
            gender: "",
            dob: "",
            profilePic: "",
            role: "B2C",
            userType: "b2c",
            extraData: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setDoc(doc(db, userCollection, firebaseUser.uid), userData);
          console.log("✅ Created new B2C user (phone login) in b2c_users");
        }
      } else if (isEmailLogin && b2bSnap.exists()) {
        // Email/password login + exists in B2B collection = B2B
        userCollection = "B2BBulkOrders_users";
        userRole = "B2B";
        userData = b2bSnap.data();
      } else if (b2cSnap.exists()) {
        // Fallback: check B2C collection
        userCollection = "b2c_users";
        userRole = "B2C";
        userData = b2cSnap.data();
      } else if (b2bSnap.exists()) {
        // Fallback: check B2B collection (for non-phone, non-standard providers)
        userCollection = "B2BBulkOrders_users";
        userRole = "B2B";
        userData = b2bSnap.data();
      } else {
        const intendedType = intendedUserType || detectedType;
        const targetCollection = getCollectionInfo(intendedType);

        userCollection = targetCollection.collection;
        userRole = targetCollection.role;

        userData = {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || null,
          email: firebaseUser.email || null,
          name: firebaseUser.displayName || "",
          address: "",
          wishlist: [],
          cart: [],
          orders: [],
          gender: "",
          dob: "",
          profilePic: "",
          role: userRole,
          userType: userRole.toLowerCase(),
          extraData: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, userCollection, firebaseUser.uid), userData);
        console.log(`✅ Created new ${userRole} user in ${userCollection}`);
      }

      // Auto-redirect based on actual role
      // if (userRole === "B2B" && !location.pathname.includes('b2b') && !location.search.includes('usertype=b2b')) {
      //   console.log("🔄 Auto-redirecting B2B user to B2B route");
      //   navigate("/usertype=b2b", { replace: true });
      // } else if (userRole === "B2C" && (location.pathname.includes('b2b') || location.search.includes('usertype=b2b'))) {
      //   console.log("🔄 Auto-redirecting B2C user to B2C route");
      //   navigate("/", { replace: true });
      // }

      // Persist B2B mode in sessionStorage so navbar can detect it immediately
      if (userRole === "B2B") {
        sessionStorage.setItem("villy_b2b_mode", "true");
      } else {
        sessionStorage.removeItem("villy_b2b_mode");
      }

      setUserCollection(userCollection);
      setUserRole(userRole);
      setUserProfile(userData);

      return userData;
    } catch (error) {
      console.error("Error ensuring user collection:", error);
      return null;
    }
  };

  const setIntendedType = (type) => {
    setIntendedUserType(type);
  };

  // Auth state listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem("authToken", token);

        const userData = await ensureUserCollection(firebaseUser);
        setUser({ ...firebaseUser, ...userData });
        setUserProfile(userData);

        // Trigger guest data merge (will be handled by CartProvider)
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
        if (guestCart.length > 0 || guestWishlist.length > 0) {
          console.log("📦 Guest data detected, ready for merge");
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
        setUserCollection(null);
        setIntendedUserType(null);
        localStorage.removeItem("authToken");
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, [location, intendedUserType]);

  useEffect(() => {
    const unsubToken = onIdTokenChanged(auth, async (u) => {
      if (u) {
        try {
          const fresh = await u.getIdToken();
          setToken(fresh);
          sessionStorage.setItem("authToken", fresh);
        } catch (e) {
          console.error("Failed to get ID token:", e);
          setToken(null);
          sessionStorage.removeItem("authToken");
        }
      } else {
        setToken(null);
        sessionStorage.removeItem("authToken");
      }
    });
    return () => unsubToken();
  }, []);

  const signOutUser = async () => {
    try {
      setLoggingOut(true);
      // Add 3 second delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await signOut(auth);
      // Clear all auth-related data
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("villy_b2b_mode");
      localStorage.removeItem("authToken");
      setToken(null);
      setUserRole(null);
      setUserCollection(null);
      setUserProfile(null);
      setIntendedUserType(null);
      setUser(null); // Explicitly set user to null for immediate UI update

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear state and redirect even if there's an error
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("villy_b2b_mode");
      localStorage.removeItem("authToken");
      setToken(null);
      setUserRole(null);
      setUserCollection(null);
      setUserProfile(null);
      setIntendedUserType(null);
      setUser(null);
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user || !userCollection) return false;

    try {
      const userRef = doc(db, userCollection, user.uid);
      await setDoc(
        userRef,
        {
          ...updates,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setUserProfile((prev) => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  };

  const switchUserType = (targetType) => {
    if (targetType === "b2b") {
      navigate("/usertype=b2b");
    } else {
      navigate("/");
    }
  };

  const value = useMemo(
    () => ({
      user,
      userRole,
      userProfile,
      userCollection,
      token,
      loading,
      signOutUser,
      updateUserProfile,
      switchUserType,
      setIntendedType,
      intendedUserType,
      loggingOut,
    }),
    [user, userRole, userProfile, userCollection, token, loading, intendedUserType, loggingOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
