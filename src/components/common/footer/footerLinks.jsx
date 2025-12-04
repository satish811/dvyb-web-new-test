// components/footer/FooterLinks.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext"; // Adjust path as needed
import { useUI } from "../../../context/UIContext";

export default function FooterLinks({ title, links }) {
  const { signOutUser } = useAuth();
  const navigate = useNavigate();

  const { setTryOnModalOpen } = useUI();

  const handleLinkClick = (link) => {
    if (link.label === "wholesaler") {
      signOutUser();
      navigate("/usertype=b2b");
    } else if (link.label === "Virtual Try On") {
      setTryOnModalOpen(true);
    } else if (link.label === "Exclusives") {
      alert("Coming Soon");
    }
  };

  return (
    <div>
      <h5 className="font-semibold uppercase text-sm tracking-wider text-gray-900 mb-4">{title}</h5>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            {link.label === "wholesaler" || link.label === "Virtual Try On" || link.label === "Exclusives" ? (
              <button
                onClick={() => handleLinkClick(link)}
                className="text-sm text-gray-600 hover:text-gray-900 transition uppercase bg-transparent border-none cursor-pointer p-0 text-left"
              >
                {link.label}
              </button>
            ) : (
              <Link
                to={link.to}
                className="text-sm text-gray-600 hover:text-gray-900 transition uppercase"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
