import { db } from "../config/firebaseConfig";
import { collectionGroup, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";
import { isProductPublishedByBoth } from "../utils/productVisibility";

/**
 * SearchService — Production-level fuzzy search with Fuse.js
 * 
 * How it works (like Myntra/Ajio):
 * 1. Fetches ALL products from Firestore ONCE and caches them in memory
 * 2. Builds a Fuse.js index for instant fuzzy matching
 * 3. Every search query runs against the local index (no network calls)
 * 4. Handles typos, plurals, partial matches automatically
 * 5. Cache auto-refreshes every 5 minutes
 */
class SearchOperationalService {
  static instance = null;

  constructor() {
    if (SearchOperationalService.instance) {
      return SearchOperationalService.instance;
    }
    this._cachedProducts = null;
    this._fuseInstance = null;
    this._cacheTimestamp = 0;
    this._cacheMaxAge = 5 * 60 * 1000; // 5 minutes
    this._loadingPromise = null;
    SearchOperationalService.instance = this;
  }

  /**
   * Common plural/suffix stemming for Indian fashion terms
   * "sarees" → "saree", "lehengas" → "lehenga", "kurtis" → "kurti", etc.
   */
  _stemWord(word) {
    if (!word) return word;
    let w = word.toLowerCase().trim();

    // Known fashion plural mappings
    const pluralMap = {
      sarees: "saree",
      lehengas: "lehenga",
      kurtis: "kurti",
      shararas: "sharara",
      anarkalis: "anarkali",
      gowns: "gown",
      dupattas: "dupatta",
      suits: "suit",
      blouses: "blouse",
      palazzos: "palazzo",
      dresses: "dress",
    };

    if (pluralMap[w]) return pluralMap[w];

    // General English stemming rules (basic)
    if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y"; // "kurtis" already handled above
    if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
    if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);

    return w;
  }

  /**
   * Stem each word in a multi-word query
   */
  _stemQuery(query) {
    if (!query) return "";
    return query
      .split(/\s+/)
      .map((word) => this._stemWord(word))
      .join(" ");
  }

  _tokenizeQuery(query) {
    if (!query) return [];
    return query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  _isProductVisible(product) {
    return isProductPublishedByBoth(product);
  }

  _matchesStrictQuery(product, queryTokens = []) {
    if (!queryTokens.length) return true;

    const searchableText = [
      product?.productCode,
      product?.sku,
      product?.code,
      product?.id,
      product?.title,
      product?.name,
      product?.category,
      product?.subcategory,
      product?.dressType,
      product?.brand,
      ...(Array.isArray(product?.tags) ? product.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Require every token to exist as a direct substring for strict dropdown relevance.
    return queryTokens.every((token) => searchableText.includes(token));
  }

  /**
   * Load and cache all products from Firestore, build Fuse index
   */
  async _ensureProductsCached(signal) {
    const now = Date.now();
    const cacheExpired = now - this._cacheTimestamp > this._cacheMaxAge;

    if (this._cachedProducts && !cacheExpired) {
      return; // Cache is fresh
    }

    // Prevent duplicate parallel fetches
    if (this._loadingPromise) {
      await this._loadingPromise;
      return;
    }

    this._loadingPromise = (async () => {
      try {
        console.log("🔄 Loading products into search cache...");

        if (signal?.aborted) {
          const error = new Error("Aborted");
          error.name = "AbortError";
          throw error;
        }

        const q = collectionGroup(db, "products");
        const querySnapshot = await getDocs(q);

        if (signal?.aborted) {
          const error = new Error("Aborted");
          error.name = "AbortError";
          throw error;
        }

        this._cachedProducts = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              title: data.title || data.name || "Untitled Product",
              name: data.name || data.title || "Untitled Product",
              productCode: data.productCode || data.sku || data.code || doc.id,
              sku: data.sku,
              code: data.code,
              // Pre-compute a combined searchable text field for better matching
              _searchText: [
                data.productCode,
                data.sku,
                data.code,
                doc.id,
                data.title,
                data.name,
                data.category,
                data.subcategory,
                data.description,
                data.dressType,
                data.fabric,
                data.craft,
                data.shopName,
                data.boutiqueName,
                data.brand,
                ...(Array.isArray(data.tags) ? data.tags : []),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase(),
            };
          })
          .filter((product) => this._isProductVisible(product));

        // Build Fuse.js index
        this._fuseInstance = new Fuse(this._cachedProducts, {
          keys: [
            { name: "productCode", weight: 0.75 },
            { name: "sku", weight: 0.7 },
            { name: "code", weight: 0.7 },
            { name: "title", weight: 0.3 },
            { name: "name", weight: 0.3 },
            { name: "category", weight: 0.2 },
            { name: "subcategory", weight: 0.15 },
            { name: "dressType", weight: 0.15 },
            { name: "description", weight: 0.05 },
            { name: "tags", weight: 0.15 },
            { name: "fabric", weight: 0.1 },
            { name: "craft", weight: 0.1 },
            { name: "shopName", weight: 0.2 },
            { name: "boutiqueName", weight: 0.2 },
            { name: "brand", weight: 0.25 },
          ],
          threshold: 0.35,        // 0 = exact, 1 = very loose
          distance: 100,          // How far to search within text
          minMatchCharLength: 1,  // Allow single character matches
          includeScore: true,
          shouldSortByScore: true,
          ignoreLocation: true,   // Match anywhere in the string
          useExtendedSearch: false,
          findAllMatches: true,
        });

        this._cacheTimestamp = now;
        console.log(`✅ Cached ${this._cachedProducts.length} products for search`);
      } finally {
        this._loadingPromise = null;
      }
    })();

    await this._loadingPromise;
  }

  /**
   * Search products by keyword using Fuse.js fuzzy matching
   * @param {string} searchQuery - User's search text
   * @param {object} options - Additional filters (limit, category, minPrice, maxPrice)
   */
  async searchProducts(searchQuery, options = {}) {
    try {
      const {
        limit = 20,
        category = null,
        minPrice = null,
        maxPrice = null,
        signal,
        strictMatch = false,
      } = options;

      // Empty query = no results (not ALL products)
      if (!searchQuery || !searchQuery.trim()) {
        return [];
      }

      await this._ensureProductsCached(signal);

      if (signal?.aborted) {
        const error = new Error("Aborted");
        error.name = "AbortError";
        throw error;
      }

      const originalQuery = searchQuery.trim().toLowerCase();
      const stemmedQuery = this._stemQuery(originalQuery);
      const queryTokens = this._tokenizeQuery(originalQuery);

      console.log(`🔍 Searching: "${originalQuery}" (stemmed: "${stemmedQuery}")`);

      let results = [];

      // Strategy 1: Fuse.js fuzzy search with original query
      const fuseResults = this._fuseInstance.search(originalQuery);

      // Strategy 2: Also try stemmed query if different
      let stemmedResults = [];
      if (stemmedQuery !== originalQuery) {
        stemmedResults = this._fuseInstance.search(stemmedQuery);
      }

      // Strategy 3: Direct substring match as fallback (catches cases Fuse might miss)
      const substringResults = this._cachedProducts.filter((product) => {
        return (
          product._searchText.includes(originalQuery) ||
          product._searchText.includes(stemmedQuery)
        );
      });

      // Merge and deduplicate results, prioritizing:
      // 1. Exact substring matches (highest priority)
      // 2. Fuse stemmed matches
      // 3. Fuse original matches
      const seenIds = new Set();
      const mergedResults = [];

      // Add substring matches first (exact matches are most relevant)
      for (const product of substringResults) {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          mergedResults.push({ ...product, _matchScore: 0 }); // Best score
        }
      }

      // Add stemmed Fuse results
      for (const { item, score } of stemmedResults) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          mergedResults.push({ ...item, _matchScore: score });
        }
      }

      // Add original Fuse results
      for (const { item, score } of fuseResults) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          mergedResults.push({ ...item, _matchScore: score });
        }
      }

      results = mergedResults;

      // Apply additional filters
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

      if (strictMatch) {
        results = results.filter((p) => this._matchesStrictQuery(p, queryTokens));
      }

      // Always exclude unpublished or hidden products from final output.
      results = results.filter((p) => this._isProductVisible(p));

      // Sort: exact matches first, then by fuzzy score (lower = better)
      results.sort((a, b) => {
        const aExact =
          a.title?.toLowerCase() === originalQuery ||
          a.name?.toLowerCase() === originalQuery ||
          a.productCode?.toLowerCase() === originalQuery ||
          a.sku?.toLowerCase() === originalQuery ||
          a.code?.toLowerCase() === originalQuery ||
          a.id?.toLowerCase() === originalQuery ||
          a.title?.toLowerCase() === stemmedQuery ||
          a.name?.toLowerCase() === stemmedQuery ||
          a.productCode?.toLowerCase() === stemmedQuery ||
          a.sku?.toLowerCase() === stemmedQuery ||
          a.code?.toLowerCase() === stemmedQuery;
        const bExact =
          b.title?.toLowerCase() === originalQuery ||
          b.name?.toLowerCase() === originalQuery ||
          b.productCode?.toLowerCase() === originalQuery ||
          b.sku?.toLowerCase() === originalQuery ||
          b.code?.toLowerCase() === originalQuery ||
          b.id?.toLowerCase() === originalQuery ||
          b.title?.toLowerCase() === stemmedQuery ||
          b.name?.toLowerCase() === stemmedQuery ||
          b.productCode?.toLowerCase() === stemmedQuery ||
          b.sku?.toLowerCase() === stemmedQuery ||
          b.code?.toLowerCase() === stemmedQuery;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return (a._matchScore || 0) - (b._matchScore || 0);
      });

      // Apply limit
      results = results.slice(0, limit);

      // Clean up internal fields before returning
      results = results.map(({ _searchText, _matchScore, ...rest }) => rest);

      console.log(`✅ Found ${results.length} matching products`);
      return results;
    } catch (error) {
      if (error.name === "AbortError") throw error;
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
      if (!searchQuery || searchQuery.trim().length < 1) {
        return [];
      }

      const results = await this.searchProducts(searchQuery, { limit, strictMatch: true });

      const suggestions = new Set();

      results.forEach((product) => {
        if (product.productCode) suggestions.add(product.productCode);
        if (product.sku) suggestions.add(product.sku);
        if (product.code) suggestions.add(product.code);
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
   * Get all cached products (used by SearchDropdown for Fuse instance)
   * This avoids duplicate Firestore fetches
   */
  async getAllProducts() {
    await this._ensureProductsCached();
    return this._cachedProducts || [];
  }

  /**
   * Get popular/trending search terms
   * This could be dynamically fetched from analytics in future
   */
  async getPopularSearches() {
    return ["Saree", "shararas", "lehenga", "kurta-sets"];
  }

  /**
   * Invalidate the cache (useful after product updates)
   */
  invalidateCache() {
    this._cachedProducts = null;
    this._fuseInstance = null;
    this._cacheTimestamp = 0;
    console.log("🗑️ Search cache invalidated");
  }
}

/**
 * Export Singleton instance
 */
export const searchService = new SearchOperationalService();
