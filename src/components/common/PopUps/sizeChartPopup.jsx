import { X, Ruler } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function SizeChartPopup({ onClose }) {
  const sizeChart = {
    title: "Clothing Size Guide",
    units: "All measurements in inches",
    headers: ["Size", "Chest", "Waist", "Hip"],
    data: [
      { size: "S", chest: "34-36", waist: "28-30", hip: "36-38" },
      { size: "M", chest: "38-40", waist: "32-34", hip: "40-42" },
      { size: "L", chest: "42-44", waist: "36-38", hip: "44-46" },
      { size: "XL", chest: "46-48", waist: "40-42", hip: "48-50" },
      { size: "XXL", chest: "50-52", waist: "44-46", hip: "52-54" },
    ],
  };

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
          backgroundColor: "#fff",
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
            <h2 className="text-xl font-bold text-gray-900 mb-1">{sizeChart.title}</h2>
            <p className="text-sm text-gray-600">{sizeChart.units}</p>
          </div>

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {sizeChart.headers.map((header, index) => (
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
                {sizeChart.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700 font-medium">
                      {row.size}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700">{row.chest}</td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700">{row.waist}</td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measurement Guide */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">How to Measure</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                • <strong>Chest:</strong> Measure around the fullest part
              </li>
              <li>
                • <strong>Waist:</strong> Measure around natural waistline
              </li>
              <li>
                • <strong>Hip:</strong> Measure around the fullest part
              </li>
            </ul>
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
