// components/footer/FooterAccordion.jsx
import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

export default function FooterAccordion({ sections }) {
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <div className="divide-y divide-gray-200">
      {sections.map((section) => (
        <div key={section.key}>
          <button
            onClick={() => toggle(section.key)}
            className="w-full flex justify-between items-center py-4 text-sm font-medium uppercase tracking-wider text-[#200000]"
          >
            {section.title}
            <span
              className={`transform transition-transform duration-200 ${openKey === section.key ? "rotate-180" : ""}`}
            >
              <MdOutlineKeyboardArrowDown size={22} />
            </span>
          </button>

          {openKey === section.key && (
            <ul className="pb-4 pl-4 space-y-2">
              {section.links.map((link) => (
                <li key={link.to}>
                  <a href={link.to} className="block text-sm text-gray-600 hover:text-gray-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
