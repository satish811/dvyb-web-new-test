import React, { useRef, useEffect, useCallback } from "react";

const OtpInput = ({
  value = "",
  onChange,
  length = 6,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const digit = val.slice(-1);
    const newOtp = value.split("");
    newOtp[index] = digit;
    const newValue = newOtp.join("");

    onChange(newValue);

    if (digit && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (!paste) return;

      const newOtp = paste.padEnd(length, "").split("");
      onChange(newOtp.join(""));

      const nextFocusIndex = Math.min(paste.length, length - 1);
      inputsRef.current[nextFocusIndex].focus();

      if (paste.length === length) {
        onComplete?.(paste);
      }
    },
    [length, onChange, onComplete]
  );

  useEffect(() => {
    const firstInput = inputsRef.current[0];
    if (firstInput) {
      firstInput.addEventListener("paste", handlePaste);
      return () => firstInput.removeEventListener("paste", handlePaste);
    }
  }, [handlePaste]);

  return (
    <div className="flex justify-center gap-3 px-6">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength="1"
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          ref={(el) => (inputsRef.current[i] = el)}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={`
            w-10 h-14 md:w-12 md:h-16
            text-center text-2xl font-medium
            bg-transparent
            border-b border-borderLight
            focus:outline-none
            focus:scale-105
            focus:border-b-2
            disabled:opacity-50 disabled:cursor-not-allowed
            
          `}
          onFocus={(e) => {
            e.target.style.borderBottomColor = "var(--color-textDark)";
            e.target.style.borderBottomWidth = "1px";
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;

// import React from "react";

// const OtpInput = ({ value, onChange, length }) => {
//   const handleChange = (e, index) => {
//     const val = e.target.value.slice(-1);
//     const newOtp = value.split("");
//     newOtp[index] = val;
//     onChange(newOtp.join(""));
//   };

//   return (
//     <div className="flex justify-center gap-3 my-4">
//       {Array.from({ length }).map((_, i) => (
//         <input
//           key={i}
//           type="text"
//           maxLength="1"
//           value={value[i] || ""}
//           onChange={(e) => handleChange(e, i)}
//           className="w-12 h-12 border-b border-borderLight text-center  text-xl  focus:outline-none focus:border-b focus:border-color-primary"
//         />
//       ))}
//     </div>
//   );
// };

// export default OtpInput;

// import React, { useRef, useEffect, useCallback } from "react";

// const OtpInput = ({
//   value = "",
//   onChange,
//   length = 6,
//   onComplete,
//   disabled = false,
//   // error = false,
//   autoFocus = true,
// }) => {
//   const inputsRef = useRef([]);

//   useEffect(() => {
//     if (autoFocus && inputsRef.current[0]) {
//       inputsRef.current[0].focus();
//     }
//   }, [autoFocus]);

//   const handleChange = (e, index) => {
//     const val = e.target.value;
//     if (!/^\d*$/.test(val)) return;

//     const digit = val.slice(-1);
//     const newOtp = value.split("");
//     newOtp[index] = digit;
//     const newValue = newOtp.join("");

//     onChange(newValue);

//     if (digit && index < length - 1) {
//       inputsRef.current[index + 1].focus();
//     }

//     if (newValue.length === length) {
//       onComplete?.(newValue);
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !value[index] && index > 0) {
//       inputsRef.current[index - 1].focus();
//     } else if (e.key === "ArrowLeft" && index > 0) {
//       e.preventDefault();
//       inputsRef.current[index - 1].focus();
//     } else if (e.key === "ArrowRight" && index < length - 1) {
//       e.preventDefault();
//       inputsRef.current[index + 1].focus();
//     }
//   };

//   const handlePaste = useCallback(
//     (e) => {
//       e.preventDefault();
//       const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
//       if (!paste) return;

//       const newOtp = paste.padEnd(length, "").split("");
//       onChange(newOtp.join(""));

//       const nextFocusIndex = Math.min(paste.length, length - 1);
//       inputsRef.current[nextFocusIndex].focus();

//       if (paste.length === length) {
//         onComplete?.(paste);
//       }
//     },
//     [length, onChange, onComplete]
//   );

//   useEffect(() => {
//     const firstInput = inputsRef.current[0];
//     if (firstInput) {
//       firstInput.addEventListener("paste", handlePaste);
//       return () => firstInput.removeEventListener("paste", handlePaste);
//     }
//   }, [handlePaste]);

//   return (
//     <div className="flex justify-center gap-3 my-4 px-6">
//       {Array.from({ length }, (_, i) => (
//         <input
//           key={i}
//           type="text"
//           inputMode="numeric"
//           autoComplete="one-time-code"
//           maxLength="1"
//           value={value[i] || ""}
//           onChange={(e) => handleChange(e, i)}
//           onKeyDown={(e) => handleKeyDown(e, i)}
//           ref={(el) => (inputsRef.current[i] = el)}
//           disabled={disabled}
//           aria-label={`Digit ${i + 1} of ${length}`}
//           className={`
//             w-10 h-14 md:w-12 md:h-16
//             text-center text-2xl font-medium
//             bg-transparent
//             border-b border-borderLight
//             focus:outline-none
//             focus:scale-105
//             focus:border-b-2
//             disabled:opacity-50 disabled:cursor-not-allowed

//           `}
//           onFocus={(e) => {
//             e.target.style.borderBottomColor = 'var(--color-textDark)';
//             e.target.style.borderBottomWidth = "1px";
//           }}

//         />
//       ))}
//     </div>
//   );
// };

// export default OtpInput;
