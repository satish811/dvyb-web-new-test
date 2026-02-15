import { useState, useEffect } from "react";
import { getUserTryOns } from "../services/tryOnService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { tryOnProductService } from "../services/tryOnProductService.js";

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

        const data = await tryOnProductService.getUserTryOnHistory(user.uid);

        const transformedData = data.map(entry => ({
          id: entry.id,
          productId: entry.productId,
          productName: entry.tryOnData?.garmentName || entry.tryOnData?.name || "Product",
          garmentName: entry.tryOnData?.garmentName || "",
          garmentImage: entry.garmentImage,
          tryOnImage: entry.modelImage,
          modelImage: entry.modelImage,
          modelName: entry.modelName,
          price: entry.tryOnData?.price || 0,
          discount: entry.tryOnData?.discount || 0,
          fabric: entry.tryOnData?.fabric || "",
          selectedColors: entry.tryOnData?.selectedColors || [],
          selectedSizes: entry.tryOnData?.selectedSizes || [],
          viewMode: entry.is3D ? "3D" : "2D",
          createdAt: { seconds: Date.parse(entry.timestamp) / 1000 },
          timestamp: entry.timestamp
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
