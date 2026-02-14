// import React from "react";
// import logo from "@/assets/b2c/images/FAQ/Logo.svg";
// import logoName from "@/assets/b2c/images/FAQ/LogoName.svg";
export default function TermsAndConditions() {
  return (
    <div className=" bg-white flex flex-col mt-34 items-center  mx-12 ">
      {/* Header */}
      {/* <div className="flex justify-center pt-4 pb-">
        <div className="flex items-center justify-center w-17 cursor-pointer mb-10">
          <img src={logo} alt="LOGO" />
          <img src={logoName} alt="LOGOName" />
        </div>
      </div> */}

      {/* Content */}
      <div className="px-5 pb-8 w-full">
        {/* Title */}
        <h2 className="font-medium text-2xl text-gray-900 mb-1">Terms & Conditions</h2>

        {/* Intro */}
        <p className="text-lg font-light text-gray-700 mb-6">
          Welcome to VILLY Bulk Ordering. These Terms & Conditions govern your use of our mobile
          application and services related to bulk ordering purchases. By accessing or using our
          App, you agree to be bound by these Terms. If you do not agree, please do not use the App.
        </p>

        {/* Eligibility */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Eligibility</h2>
        <p className="text-lg font-light text-gray-700 mb-2">
          You must be at least 18 years old (or the legal age in your country) to use the App.
        </p>
        <p className="text-lg font-light text-gray-700 mb-6">
          By registering, you confirm that the information you provide is accurate and complete.
        </p>

        {/* Account Registration */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Account Registration</h2>
        <ul className="space-y-2 mb-6 ml-3">
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>To place bulk orders, you may need to create an account.</span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>
              You are responsible for maintaining the confidentiality of your login details.
            </span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>
              You are not responsible for unauthorized use of your account caused by your
              negligence.
            </span>
          </li>
        </ul>

        {/* Orders & Payments */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Orders & Payments</h2>
        <ul className="space-y-2 mb-6 ml-3">
          <li className="text-lg font-light text-gray-700 flex ">
            <span className="mr-2">•</span>
            <span>All orders are subject to acceptance and availability.</span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>
              Bulk discounts and offers are displayed in the App and may change without prior
              notice.
            </span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>Payments must be completed through our secure payment gateways.</span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>
              Once confirmed, orders cannot be cancelled or changed unless allowed under our
              return/refund policy.
            </span>
          </li>
        </ul>

        {/* Pricing & Offers */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Pricing & Offers</h2>
        <p className="text-lg font-light text-gray-700 mb-2">
          Prices displayed in the App are in [currency] and may include or exclude taxes as per
          local laws.
        </p>
        <p className="text-lg font-light text-gray-700 mb-2">
          Discounts and offers are applicable only to bulk orders as defined in the App.
        </p>
        <p className="text-lg font-light text-gray-700 mb-6">
          We reserve the right to modify or withdraw offers at any time.
        </p>

        {/* Shipping & Delivery */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Shipping & Delivery</h2>
        <p className="text-lg font-light text-gray-700 mb-2">
          Delivery times will be provided during checkout but may vary due to logistics or
          unforeseen events.
        </p>
        <p className="text-lg font-light text-gray-700 mb-6">
          We are not liable for delays caused by courier partners or incorrect delivery details
          provided by users.
        </p>

        {/* Returns & Refunds */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Returns & Refunds</h2>
        <p className="text-lg font-light text-gray-700 mb-2">
          Returns and refunds (if applicable) are subject to our Return & Refund Policy, available
          in the App.
        </p>
        <p className="text-lg font-light text-gray-700 mb-6">
          Bulk order discounts may affect eligibility for returns or refunds.
        </p>

        {/* Data Security */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Data Security</h2>
        <p className="text-lg font-light text-gray-700 mb-6">
          We use encryption, secure servers, and limited access protocols to protect your data.
          However, no online platform can guarantee 100% security.
        </p>

        {/* Your Rights */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Your Rights</h2>
        <p className="text-lg font-light text-gray-700 mb-2">
          Depending on your location, you may have rights to:
        </p>
        <ul className="space-y-2 mb-6 ml-3">
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>Access, update, or delete your personal data.</span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>Opt out of marketing emails or notifications.</span>
          </li>
          <li className="text-lg font-light text-gray-700 flex">
            <span className="mr-2">•</span>
            <span>Withdraw consent to data processing (may limit app functionality).</span>
          </li>
        </ul>

        {/* Cookies & Tracking */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Cookies & Tracking</h2>
        <p className="text-lg font-light text-gray-700 mb-6">
          Our App may use cookies or similar technologies to personalize content, remember
          preferences, and analyze usage trends.
        </p>

        {/* Children's Privacy */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Children's Privacy</h2>
        <p className="text-lg font-light text-gray-700 mb-6">
          Our App is not intended for children under 13 (or relevant local age). We do not knowingly
          collect their data.
        </p>

        {/* Third-Party Links */}
        <h2 className="font-medium text-2xltext-gray-900 mb-2">Third-Party Links</h2>
        <p className="text-lg font-light text-gray-700 mb-6">
          Our App may contain links to third-party websites/services. We are not responsible for
          their privacy practices.
        </p>

        {/* Changes to this Policy */}
        <h2 className="font-medium text-2xl text-gray-900 mb-2">Changes to this Policy</h2>
        <p className="text-lg font-light text-gray-700 mb-6">
          We may update this Privacy Policy from time to time. Any changes will be posted within the
          App with a revised "Effective Date."
        </p>

        {/* Contact Us */}
        <h2 className="font-medium text-2xltext-gray-900 mb-2">Contact Us</h2>
        <p className="text-lg font-light text-gray-700 mb-2">
          If you have questions or concerns about this Privacy Policy, please contact us at:
        </p>
        <div className="space-y-2">
          <p className="text-lg font-light text-gray-700 flex items-center">
            <span className="mr-2">✉</span>
            <span>Email: [support@youapp.com]</span>
          </p>
          <p className="text-lg font-light text-gray-700 flex items-center">
            <span className="mr-2">📞</span>
            <span>Phone: [Your Support Number]</span>
          </p>
        </div>
      </div>
    </div>
  );
}
