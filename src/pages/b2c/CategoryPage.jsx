import { useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ProductLayout from "../../layout/ProductLayout";
import { useFilter } from "../../context/FilterContext";

/**
 * CategoryPage - Dedicated page for each product category
 * Routes: /women/saree, /women/lehenga, etc.
 */
const CategoryPage = ({ products }) => {
    const { category } = useParams();
    const { clearAllFilters } = useFilter();

    // Reset filters when category changes
    useEffect(() => {
        clearAllFilters();
    }, [category, clearAllFilters]);

    // Validate category exists
    if (!category) {
        return <Navigate to="/womenwear" replace />;
    }

    return <ProductLayout products={products} categoryFromRoute={category} />;
};

export default CategoryPage;
