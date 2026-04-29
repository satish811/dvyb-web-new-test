import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
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
    }
  };

  return (
    <div>
      <h5 className="font-semibold uppercase text-sm tracking-wider text-gray-900 mb-4">{title}</h5>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to + link.label}>
            {link.label === "wholesaler" || link.label === "Virtual Try On" ? (
              <button
                onClick={() => handleLinkClick(link)}
                className="text-sm text-gray-600 hover:text-gray-900 transition uppercase bg-transparent border-none cursor-pointer p-0 text-left"
              >
                {link.label}
              </button>
            ) : link.external ? (
              <a
                href={link.to}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition uppercase"
              >
                {link.label}
              </a>
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
