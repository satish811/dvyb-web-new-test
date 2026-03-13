import { useState, useEffect } from "react";
import { getUserTryOns } from "../services/tryOnService.js";
import { useAuth } from "../context/AuthContext.jsx";

export const useUserTryons = () => {
  const [tryons, setTryons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTryOns = async () => {
      if (!user) {
        setTryons([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getUserTryOns();

        const transformedData = data.map(entry => ({
          id: entry.id,
          // Fallback to try-on doc id when productId is missing/placeholder
          productId:
            entry.productId && entry.productId !== "unknown"
              ? entry.productId
              : entry.id,
          productName: entry.productName || entry.garmentName || "Product",
          garmentName: entry.garmentName || "",
          garmentImage: entry.garmentImage,
          tryOnImage: entry.tryOnImage,
          modelImage: entry.modelImage,
          modelName: entry.modelName,
          price: entry.price || 0,
          discount: entry.discount || 0,
          fabric: entry.fabric || "",
          selectedColors: entry.selectedColors || [],
          selectedSizes: entry.selectedSizes || [],
          viewMode: entry.viewMode || "2D",
          createdAt: entry.createdAt,
          timestamp: entry.timestamp || ""
        }));

        setTryons(transformedData);
      } catch (err) {
        console.error("Error loading try-ons:", err);
        setError(err.message || "Failed to load try-ons");
      } finally {
        setLoading(false);
      }
    };

    fetchTryOns();
  }, [user]);

  // Return both tryons and setTryons
  return { tryons, setTryons, loading, error };
};
