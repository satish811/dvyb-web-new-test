/**
 * FULLY DYNAMIC category extraction - NO HARDCODING
 * Extracts categories and subcategories directly from product data
 */

/**
 * Extract main categories from products dynamically
 */
export function extractCategories(products) {
    if (!products || products.length === 0) return [];

    const categoryMap = new Map();

    products.forEach((product) => {
        const cat = (String(product.category || "")).toUpperCase().trim();
        const dressType = (String(product.dressType || "")).toUpperCase().trim();
        const subDressType = (String(product.subDressType || "")).toUpperCase().trim();

        const potentialCategories = [cat, dressType, subDressType].filter(c => c && c.length > 0);

        potentialCategories.forEach(categoryValue => {
            let normalized = categoryValue;

            if (categoryValue.endsWith('S') && categoryValue.length > 3) {
                const singular = categoryValue.slice(0, -1);
                normalized = singular;
            }

            if (normalized.length < 3) return;
            if (normalized === 'NEW' || normalized === 'WOMEN') return;

            const existing = categoryMap.get(normalized);
            categoryMap.set(normalized, {
                name: normalized,
                count: (existing?.count || 0) + 1
            });
        });
    });

    return Array.from(categoryMap.values())
        .filter(cat => cat.count > 0)
        .sort((a, b) => b.count - a.count);
}

/**
 * Extract subcategories dynamically from product data for a specific main category
 * Checks multiple possible fields and sources for subcategory data
 */
export function extractSubcategories(products, mainCategory) {
    if (!mainCategory || !products || products.length === 0) {
        console.log("[extractSubcategories] Invalid input");
        return [];
    }

    const mainCatUpper = mainCategory.toUpperCase().trim();
    const subcategorySet = new Set();
    let matchedProducts = 0;

    console.log(`[extractSubcategories] Looking for subcategories of: ${mainCatUpper}`);
    console.log(`[extractSubcategories] Total products: ${products.length}`);

    products.forEach((product, index) => {
        if (index < 3) {
            console.log(`[extractSubcategories] Sample product ${index}:`, product);
        }

        const cat = (String(product.category || "")).toUpperCase().trim();
        const dressType = (String(product.dressType || "")).toUpperCase().trim();
        const subDressType = (String(product.subDressType || "")).toUpperCase().trim();

        // Check if this product belongs to the main category
        const belongsToCategory =
            cat.includes(mainCatUpper) ||
            dressType.includes(mainCatUpper) ||
            subDressType.includes(mainCatUpper) ||
            cat === mainCatUpper ||
            dressType === mainCatUpper ||
            subDressType === mainCatUpper;

        if (!belongsToCategory) return;

        matchedProducts++;

        // Try multiple fields for subcategory data
        const possibleSubcategoryFields = [
            product.subcategory,
            product.subCategory,
            product.sub_category,
            product.subDressType,
            product.dressType
        ];

        possibleSubcategoryFields.forEach(field => {
            if (field) {
                const subCat = String(field).trim();
                if (subCat && subCat.length > 0 && subCat.toUpperCase() !== mainCatUpper) {
                    subcategorySet.add(subCat);
                }
            }
        });
    });

    const result = Array.from(subcategorySet).sort();

    console.log(`[extractSubcategories] Matched ${matchedProducts} products for ${mainCatUpper}`);
    console.log(`[extractSubcategories] Found ${result.length} subcategories:`, result);

    return result;
}
