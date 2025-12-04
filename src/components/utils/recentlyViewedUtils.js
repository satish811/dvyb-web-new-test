export const getRecentlyViewed = () => {
    try {
        const stored = localStorage.getItem("recentlyViewed");
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error reading recently viewed:", error);
        return [];
    }
};

export const addRecentlyViewed = (product) => {
    try {
        if (!product || !product.id) return;

        const current = getRecentlyViewed();
        // Remove if already exists to move to top
        const filtered = current.filter((p) => p.id !== product.id);

        // Add to beginning, limit to 6
        const updated = [product, ...filtered].slice(0, 6);

        localStorage.setItem("recentlyViewed", JSON.stringify(updated));
        return updated;
    } catch (error) {
        console.error("Error adding recently viewed:", error);
        return [];
    }
};
