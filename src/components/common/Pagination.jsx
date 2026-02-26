import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Pagination = ({
    currentPage = 1,
    totalPages = 1
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Handle page change by updating URL query params
    const handlePageChange = (page) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page.toString());

        // Scroll to top instantly before navigation to prevent footer flash
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Navigate to same path with updated page param
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first, last, current, and adjacent pages
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 py-8">
            {/* PREV Button */}
            <button
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
          px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors
          ${currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900'
                    }
        `}
            >
                PREV
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-400"
                        >
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`
              min-w-[32px] h-8 px-3 text-sm font-medium transition-colors
              ${page === currentPage
                                ? 'text-gray-900 underline underline-offset-4'
                                : 'text-gray-500 hover:text-gray-900'
                            }
            `}
                    >
                        {page}
                    </button>
                );
            })}

            {/* NEXT Button */}
            <button
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`
          px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors
          ${currentPage >= totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900'
                    }
        `}
            >
                NEXT
            </button>
        </div>
    );
};

export default Pagination;
