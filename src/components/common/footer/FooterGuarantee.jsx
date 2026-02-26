// components/footer/FooterGuarantee.jsx
import returnIcon from "../../../assets/b2c/landing/Landing-villy/ReturnPolicy.png";
import originalIconn from "../../../assets/b2c/landing/Landing-villy/Original1.png";

export default function FooterGuarantee() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-5 border-t border-gray-200 text-center md:text-left">
      <div className="flex items-start justify-center md:justify-start gap-3">
        <img src={originalIconn} alt="100% Original" className="w-12 h-12" />
        <div className="mt-2">
          <p className="font-semibold text-sm">100% ORIGINAL</p>
          <p className="text-xs text-gray-600">guarantee for all products at villy.in</p>
        </div>
      </div>
      {/* Place 14 Days Return at the end */}
      <div className="flex items-start justify-center md:justify-start gap-2 order-last md:order-last">
        <img src={returnIcon} alt="14 Days Return" className="w-14 h-14" />
        <div className="mt-2">
          <p className="font-semibold text-sm">RETURN WITHIN 14 DAYS</p>
          <p className="text-xs text-gray-600">of receiving your order</p>
        </div>
      </div>
    </div>
  );
}
