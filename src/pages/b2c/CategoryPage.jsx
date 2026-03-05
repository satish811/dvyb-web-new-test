import { useParams, Navigate } from "react-router-dom";
import ProductLayout from "../../layout/ProductLayout";

/**
 * CategoryPage - Dedicated page for each product category
 * Routes: /women/saree, /women/lehenga, etc.
 * 
 * Note: Filter management is handled by ProductLayout.
 * ProductLayout syncs the category from URL params to FilterContext automatically.
 */
const CategoryPage = ({ products, loading }) => {
    const { category } = useParams();

    // Validate category exists
    if (!category) {
        return <Navigate to="/womenwear" replace />;
    }

    return <ProductLayout products={products} categoryFromRoute={category} loading={loading} />;
};

export default CategoryPage;
