// hooks/useUserTryons.js
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export function useUserTryons() {
  const { user } = useAuth();
  const [tryons, setTryons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTryons() {
      if (!user) {
        setTryons([]);
        setLoading(false);
        return;
      }
      const docRef = doc(db, "b2c_users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTryons(data.userTryonItems || []);
      }
      setLoading(false);
    }

    fetchTryons();
  }, [user]);

  return { tryons, loading };
}
