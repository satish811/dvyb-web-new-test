// components/footer/Footer.jsx
import { useState } from "react";
import FooterLinks from "./footerLinks";
import FooterSocials from "./footerSocials";
import FooterAppLinks from "./footerAppLinks";
import FooterAccordion from "./FooterAccordion";
import FooterGuarantee from "./FooterGuarantee";
import { footerSections } from "./footerData";
import { motion } from "framer-motion"; // ✨ Animation import
import { fadeIn, staggerContainer, slideUp } from "../../../utils/animations"; // ✨ Global animations

export default function Footer() {
  const [feedbackForm, setFeedbackForm] = useState({ phone: "", email: "", message: "" });
  const [feedbackStatus, setFeedbackStatus] = useState("");

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();

    if (!feedbackForm.phone || !feedbackForm.email || !feedbackForm.message) {
      setFeedbackStatus("Please fill in all fields.");
      return;
    }

    setFeedbackStatus("Thank you for your feedback!");
    setFeedbackForm({ phone: "", email: "", message: "" });
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="bg-white md:mx-12 md:px-9"
    >
      <div className=" py-12 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mb-8 px-4 text-center">
          <p className="text-sm text-gray-600">
            All the images generated are AI images.
          </p>
        </div>
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
          {/* 2x2 Grid for Footer Links on Mobile */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 mb-8">
            {footerSections.map((section) => (
              <div key={section.key}>
                <FooterLinks {...section} />
              </div>
            ))}
          </div>

          <div className="py-6 text-center space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">Follow Us On</h5>
              <div className="text-center flex justify-center">
                <FooterSocials />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h5 className="font-medium uppercase text-xs tracking-wider mb-4">
                Experience Villy App on Mobile
              </h5>
              <div className="flex justify-center">
                <FooterAppLinks />
              </div>
            </div>
          </div>

        </div>

        <div className="mx-auto max-w-3xl rounded-[24px] border border-gray-200 bg-[#FAF8FF] p-6 mt-8">
          <h5 className="text-base font-semibold text-gray-900 mb-4">Feedback</h5>
          <form onSubmit={handleFeedbackSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="tel"
                value={feedbackForm.phone}
                onChange={(e) => setFeedbackForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900"
              />
              <input
                type="email"
                value={feedbackForm.email}
                onChange={(e) => setFeedbackForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900"
              />
            </div>
            <textarea
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Feedback"
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#74136C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5a0f54] transition-all"
            >
              Submit Feedback
            </button>
            {feedbackStatus && (
              <p className="text-sm text-green-600">{feedbackStatus}</p>
            )}
          </form>
        </div>

        {/* GUARANTEE SECTION - Both Mobile & Desktop */}
        <motion.div variants={fadeIn}>
          <FooterGuarantee />
        </motion.div>
      </div>
    </motion.footer>
  );
}
