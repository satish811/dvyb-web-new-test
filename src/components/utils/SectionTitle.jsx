import { useNavigate } from "react-router-dom";

export default function SectionTitle({ children, viewAll }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-4 px-2  sm:px-2 md:px-4 lg:px-8">
      <h2 className="sm:text-[12px] px-0 sm:px-2 md:text-xl lg:text-2xl text-textDark uppercase font-medium">
        {children}
      </h2>
      {viewAll && (
        <button
          type="button"
          onClick={() => navigate("/womenwear")}
          className="text-[8px] px-1 font-normal sm:text-[8px] sm:mx-2 lg:m-0 md:text-[10px] pt-2 lg:text-base hover:text-primary uppercase cursor-pointer"
        >
          view all
        </button>
      )}
    </div>
  );
}
