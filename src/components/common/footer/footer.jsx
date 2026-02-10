// components/footer/Footer.jsx
import FooterLinks from "./footerLinks";
import FooterSocials from "./footerSocials";
import FooterAppLinks from "./footerAppLinks";
import FooterAccordion from "./FooterAccordion";
import FooterGuarantee from "./FooterGuarantee";
import { footerSections } from "./footerData";
import { motion } from "framer-motion"; // ✨ Animation import
import { fadeIn, staggerContainer, slideUp } from "../../../utils/animations"; // ✨ Global animations

export default function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="bg-white md:mx-12 md:px-9"
    >
      <div className=" py-12 max-w-7xl mx-auto">
        {/* DESKTOP */}
        <motion.div
          variants={staggerContainer}
          className="hidden md:grid  grid-cols-2 lg:grid-cols-5 gap-10"
        >
          {footerSections.map((section) => (
            <motion.div key={section.key} variants={slideUp}>
              <FooterLinks {...section} />
            </motion.div>
          ))}

          <motion.div variants={slideUp} className="space-y-8">
            <div>
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">Follow Us On</h5>
              <FooterSocials />
            </div>

            <div>
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">
                Experience Villy App on Mobile
              </h5>
              <FooterAppLinks />
            </div>
          </motion.div>
        </motion.div>

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
                Experience Villy App on Mobile
              </h5>
              <FooterAppLinks />
            </div>
          </div>
        </div>

        {/* GUARANTEE SECTION - Both Mobile & Desktop */}
        <motion.div variants={fadeIn}>
          <FooterGuarantee />
        </motion.div>
      </div>
    </motion.footer>
  );
}
