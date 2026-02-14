import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ProductGrid from "../../components/b2c/products/ProductGrid";
import { useFilter } from "../../context/FilterContext";

const WomenwearPage = () => {
    const location = useLocation();
    const { updateFilter, selectedFilters } = useFilter();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get("category");

        // Map URL param → display label
        const paramToLabel = {
            lehenga: "LEHENGA",
            saree: "SAREE",
            "kurta-sets": "KURTA SETS",
            anarkalis: "ANARKALIS",
            shararas: "SHARARAS",
            pret: "PRÊT",
            fusion: "FUSION",
            wedding: "WEDDING",
            sale: "SALE",
        };

        const label = categoryParam ? paramToLabel[categoryParam] : null;

        // Sync URL → filter state
        if (label && selectedFilters.categories[0] !== label) {
            updateFilter("categories", label);
        }
        // If URL has no category, but filter has one → clear it
        else if (!categoryParam && selectedFilters.categories.length > 0) {
            updateFilter("categories", selectedFilters.categories[0]);
        }
    }, [location.search, updateFilter, selectedFilters.categories]);

    return (
        <MainLayout>
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16 py-8 2xl:py-12">
                <h2 className="text-3xl md:text-4xl 2xl:text-6xl font-bold text-gray-900 mb-6 2xl:mb-10 font-serif">Womenwear</h2>
                <ProductGrid />
            </div>
        </MainLayout>
    );
};

export default WomenwearPage;
