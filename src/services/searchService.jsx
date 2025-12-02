import { db } from "../config/firebaseConfig";
import { collectionGroup, getDocs } from "firebase/firestore";

/**
 * SearchService
 * A Singleton class to handle product search, suggestions, and trending terms
 */
class SearchOperationalService {
  static instance = null;

  constructor() {
    if (SearchOperationalService.instance) {
      return SearchOperationalService.instance;
    }
    SearchOperationalService.instance = this;
  }

  /**
   * Search products by keyword or filters
   * @param {string} searchQuery - User's search text
   * @param {object} options - Additional filters (limit, category, minPrice, maxPrice)
   */
  async searchProducts(searchQuery, options = {}) {
    try {
      const { limit = 20, category = null, minPrice = null, maxPrice = null } = options;

      console.log("🔍 Searching products with query:", searchQuery);

      const q = collectionGroup(db, "products");
      const querySnapshot = await getDocs(q);

      const searchLower = searchQuery?.toLowerCase().trim();

      let results = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          title: doc.data().title || doc.data().name || "Untitled Product",
          name: doc.data().name || doc.data().title || "Untitled Product",
        }))
        .filter((product) => {
          const titleMatch = product.title?.toLowerCase().includes(searchLower);
          const nameMatch = product.name?.toLowerCase().includes(searchLower);
          const categoryMatch = product.category?.toLowerCase().includes(searchLower);
          const subcategoryMatch = product.subcategory?.toLowerCase().includes(searchLower);
          const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
          const tagsMatch = Array.isArray(product.tags)
            ? product.tags.some((tag) => tag.toLowerCase().includes(searchLower))
            : false;

          return (
            titleMatch ||
            nameMatch ||
            categoryMatch ||
            subcategoryMatch ||
            descriptionMatch ||
            tagsMatch
          );
        });

      if (category) {
        results = results.filter(
          (p) =>
            p.category?.toLowerCase() === category.toLowerCase() ||
            p.subcategory?.toLowerCase() === category.toLowerCase()
        );
      }

      if (minPrice !== null) {
        results = results.filter((p) => parseFloat(p.price) >= minPrice);
      }
      if (maxPrice !== null) {
        results = results.filter((p) => parseFloat(p.price) <= maxPrice);
      }

      results.sort((a, b) => {
        const aExactMatch =
          a.title?.toLowerCase() === searchLower || a.name?.toLowerCase() === searchLower;
        const bExactMatch =
          b.title?.toLowerCase() === searchLower || b.name?.toLowerCase() === searchLower;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        return (a.title || "").localeCompare(b.title || "");
      });

      results = results.slice(0, limit);

      console.log(`✅ Found ${results.length} matching products`);
      return results;
    } catch (error) {
      console.error("❌ Error searching products:", error);
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  /**
   * Get search suggestions based on partial query
   * Returns quick suggestions for autocomplete
   */
  async getSearchSuggestions(searchQuery, limit = 8) {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
      }

      const results = await this.searchProducts(searchQuery, { limit });

      const suggestions = new Set();

      results.forEach((product) => {
        suggestions.add(product.title || product.name);
        if (product.category) suggestions.add(product.category);
        if (product.subcategory) suggestions.add(product.subcategory);
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error("❌ Error getting suggestions:", error);
      return [];
    }
  }

  /**
   * Get popular/trending search terms
   * This could be dynamically fetched from analytics in future
   */
  async getPopularSearches() {
    return ["Saree", "shararas", "lehenga", "kurta-sets"];
  }
}

/**
 * Export Singleton instance
 */
export const searchService = new SearchOperationalService();
