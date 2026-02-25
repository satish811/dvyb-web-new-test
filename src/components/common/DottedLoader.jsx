import React from 'react';

const DottedLoader = ({ size = "w-12 h-12", color = "bg-gray-800" }) => {
    return (
        <div className={`relative ${size}`}>
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-full h-full left-0 top-0"
                    style={{
                        transform: `rotate(${i * 30}deg)`,
                    }}
                >
                    <div
                        className={`w-[15%] h-[15%] rounded-full mx-auto ${color}`}
                        style={{
                            animation: `fade 1.2s linear infinite`,
                            animationDelay: `-${1.2 - i * 0.1}s`,
                        }}
                    />
                </div>
            ))}
            <style>{`
        @keyframes fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
        </div>
    );
};

export default DottedLoader;
