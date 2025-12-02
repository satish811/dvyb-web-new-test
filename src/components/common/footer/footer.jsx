// components/footer/Footer.jsx
import FooterLinks from "./footerLinks";
import FooterSocials from "./footerSocials";
import FooterAppLinks from "./footerAppLinks";
import FooterAccordion from "./FooterAccordion";
import FooterGuarantee from "./FooterGuarantee";
import { footerSections } from "./footerData";

export default function Footer() {
  return (
    <footer className="bg-white md:mx-12 md:px-9">
      <div className=" py-12 max-w-7xl mx-auto">
        {/* DESKTOP */}
        <div className="hidden md:grid  grid-cols-2 lg:grid-cols-5 gap-10">
          {footerSections.map((section) => (
            <FooterLinks key={section.key} {...section} />
          ))}

          <div className="space-y-8">
            <div>
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">Follow Us On</h5>
              <FooterSocials />
            </div>

            <div>
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">
                Experience DVYB App on Mobile
              </h5>
              <FooterAppLinks />
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="block md:hidden px-5">
          <FooterAccordion sections={footerSections} />

          <div className="py-6 text-center space-y-6">
            <div>
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">Follow Us On</h5>
              <div className="text-center ">
                <FooterSocials />
              </div>
            </div>

            <div className="border-t pt-6">
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">
                Experience DVYB App on Mobile
              </h5>
              <FooterAppLinks />
            </div>
          </div>
        </div>

        {/* GUARANTEE SECTION - Both Mobile & Desktop */}
        <FooterGuarantee />
      </div>

      {/* Copyright */}
      {/* <div className="bg-gray-50 py-6 text-center text-xs text-gray-500 border-t">
        © 2025 DVYB. All rights reserved.
      </div> */}
    </footer>
  );
}
