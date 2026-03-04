/**
 * FULLY DYNAMIC category extraction - NO HARDCODING
 * Extracts categories and subcategories directly from product data
 */

/**
 * Extract main categories from products dynamically
 */
export function extractCategories(products) {
    if (!products || products.length === 0) return [];

    // Known plural → canonical display name mappings
    const PLURAL_MAP = {
        'SAREES': 'SAREE',
        'LEHENGAS': 'LEHENGA',
        'ANARKALIS': 'ANARKALI',
        'SHARARAS': 'SHARARA',
        'KURTA SETS': 'KURTA-SET',
        'KURTA-SETS': 'KURTA-SET',
        'KURTA SET': 'KURTA-SET',
        'KURTAS': 'KURTA-SET',
        'SALWAR SUITS': 'SALWAR SUIT',
        'SALWAR-SUITS': 'SALWAR SUIT',
        'BLOUSES': 'BLOUSE',
        'GOWNS': 'GOWN',
        'DUPATTAS': 'DUPATTA',
        'DRESSES': 'DRESS',
    };

    // Words that should be ignored as standalone categories
    const IGNORE_LIST = new Set(['NEW', 'WOMEN', 'WOMAN', 'ALL', '']);

    const categoryMap = new Map();

    products.forEach((product) => {
        // Only use dressType as the primary category field
        const dressType = (String(product.dressType || "")).toUpperCase().trim();

        if (!dressType || dressType.length < 2) return;
        if (IGNORE_LIST.has(dressType)) return;

        // Normalize via plural map or use as-is
        const normalized = PLURAL_MAP[dressType] || dressType;

        // Skip compound/multi-word names that are clearly subcategories
        // e.g. "FESTIVE FABRIC", "EMBROIDERED KURTA SET", "SILK SHARARA FABRIC"
        // Keep known multi-word main categories like "KURTA-SET", "SALWAR SUIT", "INDO WESTERN"
        const ALLOWED_MULTIWORD = new Set([
            'KURTA-SET', 'KURTA SET', 'SALWAR SUIT', 'INDO WESTERN', 'INDO-WESTERN',
        ]);
        const wordCount = normalized.split(/[\s-]+/).length;
        if (wordCount > 2 && !ALLOWED_MULTIWORD.has(normalized)) return;

        const existing = categoryMap.get(normalized);
        categoryMap.set(normalized, {
            name: normalized,
            count: (existing?.count || 0) + 1
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
