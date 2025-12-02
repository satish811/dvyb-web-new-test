// components/navbar/CategoryCard.jsx

import { useNavigate } from "react-router-dom";

export default function CategoryCard({ name, icon, link, onClose }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col cursor-pointer group">
        <div
          className="w-full aspect-[3/4] overflow-hidden mb-3"
          onClick={() => {
            onClose();
            navigate(link);
          }}
        >
          <img
            src={icon}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <span className="text-xs font-semibold text-gray-800 uppercase ">{name}</span>
      </div>
    </>
  );
}
