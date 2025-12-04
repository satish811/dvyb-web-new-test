import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { wishlistService } from "../../services/wishlistService";
import { auth } from "../../config";
import B2BAuthService from "../../services/b2bAuthService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const WishlistHeartButton = ({ 
  productId, 
  productData, 
  className = "",
  userRole: propUserRole, 
  userId: propUserId 
}) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(propUserRole || "b2c");
  const [userId, setUserId] = useState(propUserId || null);
  const navigate = useNavigate();

  useEffect(() => {
    
    if (!propUserRole || !propUserId) {
      const getUserRole = async () => {
        const user = auth.currentUser;

        if (user) {
          try {
            const userData = await B2BAuthService.getUserById(user.uid);
            const role = userData.data.role;
            const userId = userData.data.userId;
            setUserId(userId);
            if (userData.success && userData.data) {
              setUserRole(role);
            } else {
              setUserRole("b2c");
            }
          } catch (error) {
            console.log("User not found in B2B, defaulting to B2C");
            setUserRole("b2c");
          }
        } else {
          setUserRole("b2c");
        }
      };

      getUserRole();
      const unsubscribe = auth.onAuthStateChanged(() => {
        getUserRole();
      });

      return () => unsubscribe();
    }
  }, [propUserRole, propUserId]);

  useEffect(() => {
    if (productId) {
      checkWishlistStatus();
    }
  }, [productId, userId]);

  const checkWishlistStatus = async () => {
    try {
      const status = await wishlistService.isInWishlist(productId);
      setInWishlist(status);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleToggleWishlist = async () => {
    // B2B users might not require login for wishlist functionality
    // Or they might have different rules
    
    // OPTION 1: Allow B2B users even without userId
    if (userRole !== "B2B" && !userId) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }
    
    // OPTION 2: Show different message for B2B users
    // if (!userId) {
    //   if (userRole === "B2B") {
    //     toast.error("Please contact sales to manage B2B wishlist");
    //   } else {
    //     toast.error("Please login to add items to wishlist");
    //     navigate("/login");
    //   }
    //   return;
    // }

    setLoading(true);
    try {
      const result = await wishlistService.toggleWishlist(productId, productData, userRole);
      setInWishlist(result.inWishlist);

      if (result.inWishlist) {
        toast.success(`Added to ${userRole === "B2B" ? "B2B" : "B2C"} wishlist`);
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      
      // More specific error handling
      if (error.message?.includes("requires authentication")) {
        if (userRole === "B2B") {
          toast.error("B2B wishlist requires login. Please contact sales.");
        } else {
          toast.error("Please login to manage wishlist");
          navigate("/login");
        }
      } else {
        toast.error("Failed to update wishlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`w-8 h-8 flex items-center justify-center relative transition-all duration-200 ${className}`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="w-7 h-7 flex items-center justify-center">
          <Heart
            className={`${inWishlist ? "fill-current text-red-500" : "text-gray-700"}`}
            size={28.44}
            strokeWidth={1.5}
          />
        </div>
      )}
    </button>
  );
};

export default WishlistHeartButton;