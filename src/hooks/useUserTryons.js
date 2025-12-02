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
        const data = await getUserTryOns();
        setTryons(data);
        setError(null);
      } catch (err) {
        console.error("Error loading try-ons:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTryOns();
  }, [user]);

  return { tryons, loading, error };
};
