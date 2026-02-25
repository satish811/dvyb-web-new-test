import React from "react";
import DottedLoader from "./DottedLoader";

const LogoutSkeleton = () => {
    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex flex-col justify-center items-center z-[10000]">
            <DottedLoader size="w-16 h-16" color="bg-gray-800" />
        </div>
    );
};

export default LogoutSkeleton;
