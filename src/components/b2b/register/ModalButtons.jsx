// ModalButtons.jsx
import React from "react";

/**
 * Modal Buttons Component: Back and Next/Submit
 * - Props: step, onBack, onNext
 */

const ModalButtons = ({ step, onBack, onNext }) => {
  return (
    <div className="flex gap-3">
      {step === 2 && (
        <button
          onClick={onBack}
          className="flex-1 text-sm border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      )}
      <button
        onClick={onNext}
        className="flex-1 text-sm bg-rose-700 hover:bg-rose-800 disabled:bg-gray-300 text-white rounded-md px-4 py-2 transition-colors"
      >
        {step === 1 ? "Next" : "Submit"}
      </button>
    </div>
  );
};

export default ModalButtons;
