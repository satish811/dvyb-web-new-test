import { X, Ruler } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const DEFAULT_HEADERS = ["Size", "Bust", "Waist", "Hip"];

const normalizeCellValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

// const buildRows = (sizeChart) => {
//   if (!sizeChart || typeof sizeChart !== "object") return [];

//   const unit = (sizeChart.unit || "inch").toLowerCase();
//   const sourceRows = unit === "cm" ? sizeChart.rowsCm : sizeChart.rows;

//   if (!Array.isArray(sourceRows)) return [];

//   return sourceRows.map((row) => ({
//     size: normalizeCellValue(row?.size),
//     bust: normalizeCellValue(row?.bust),
//     waist: normalizeCellValue(row?.waist),
//     hip: normalizeCellValue(row?.hip),
//   }));
// };

const buildRows = (sizeChart) => {
  if (!sizeChart || typeof sizeChart !== "object") return [];

  const unit = (sizeChart.unit || "inch").toLowerCase();

  let sourceRows = [];

  if (unit === "cm" && Array.isArray(sizeChart.rowsCm)) {
    sourceRows = sizeChart.rowsCm;
  } else if (Array.isArray(sizeChart.rows)) {
    sourceRows = sizeChart.rows;
  }

  return sourceRows.map((row) => ({
    size: normalizeCellValue(row?.size),
    bust: normalizeCellValue(row?.bust),
    waist: normalizeCellValue(row?.waist),
    hip: normalizeCellValue(row?.hip),
  }));
};

export default function SizeChartPopup({ onClose, sizeChart }) {
  const title = sizeChart?.title || "Clothing Size Guide";
  const unit = (sizeChart?.unit || "inch").toLowerCase();
  const unitsLabel = unit === "cm" ? "All measurements in centimeters" : "All measurements in inches";
  // const headers = sizeChart?.headers || DEFAULT_HEADERS;
  const headers =
  Array.isArray(sizeChart?.headers) && sizeChart.headers.length === 4
    ? sizeChart.headers
    : DEFAULT_HEADERS;
  const data = buildRows(sizeChart);

  // Lock body scroll while modal is open, preserving current scroll position
  useEffect(() => {
    const scrollY = window.scrollY;
    const originalStyle = document.body.style.cssText;
    document.body.style.cssText = `overflow: hidden; position: fixed; top: -${scrollY}px; left: 0; right: 0;`;

    return () => {
      document.body.style.cssText = originalStyle;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 9999,
        overflow: "auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#F2E1F0",
          maxWidth: "448px",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        <div className="pt-10 pb-6 px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Ruler className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-600">{unitsLabel}</p>
          </div>

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            {data.length > 0 ? (
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-3 py-2 text-gray-700 font-medium">
                        {row.size}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-700">{row.bust}</td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-700">{row.waist}</td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-700">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-600">
                Size chart not available for this product.
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Sizes may vary between brands. Contact us for help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
