import React from "react";

// import logo from '@/assets/b2c/images/FAQ/Logo.svg';
// import logoName from '@/assets/b2c/images/FAQ/LogoName.svg';

export default function PrivacyPolicy() {
  return (
    <>
      <div className="min-h-screen bg-white mx-10 mt-0">
        {/* Header */}

        {/* Content */}
        <div className=" mx-auto px-1 py-8">
          <h2 className=" text-2xl mb-1 font-medium ">Privacy Policy</h2>

          <p className="font-light text-gray-700 mb-6">
            JOYR values your trust and is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, store, and protect your personal information when you use
            our mobile application and services related to bulk clothing purchases.
          </p>

          <section className="mb-6 ">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Information We Collect</h2>
            <p className="text-gray-700 mb-3">
              When you use our App, we may collect the following types of information:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-xl text-gray-900">Personal Information:</h3>
                <p className="text-gray-700">
                  Name, email address, phone number, billing/shipping address.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-xl text-gray-900">Account Information:</h3>
                <p className="text-gray-700">Login credentials, preferences, order history.</p>
              </div>

              <div>
                <h3 className="font-medium text-xl text-gray-900">Payment Information:</h3>
                <p className="font-normal text-gray-700">
                  Credit card details, UPI, or other payment method (processed securely by
                  third-party providers; we do not store sensitive details).
                </p>
              </div>

              <div>
                <h3 className="font-medium text-xl text-gray-900">Device Information:</h3>
                <p className="font-normal text-gray-700">
                  Device type, operating system, unique device identifiers, IP address.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-xl text-gray-900">Usage Data:</h3>
                <p className="font-normal text-gray-700">
                  Pages viewed, time spent on the App, clicks, and interactions for improving user
                  experience.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="font-medium text-xl text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="font-normal text-gray-700 mb-3">We use your information to:</p>

            <ul className="list-disc font-light pl-5 space-y-2 text-gray-700 ml-3">
              <li>Process and deliver bulk clothing orders.</li>
              <li>Provide discounts, offers, and personalized deals.</li>
              <li>Send order updates, confirmations, and customer support messages.</li>
              <li>Improve our services, user interface, and customer experience.</li>
              <li>Prevent fraud, unauthorized transactions, and maintain security.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section className="mb-1">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Sharing of Information</h2>
            <p className="text-gray-700 mb-3">
              We do not sell or rent your personal information. We may share your information with:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-gray-700 ml-3">
              <li className="font-light">
                <span className="font-normal">Service Providers:</span> Payment gateways, delivery
                partners, cloud storage providers.
              </li>
              <li className="font-light">
                <span className="font-normal">Business Partners:</span> To provide offers,
                promotions, or additional services.
              </li>
              <li className="font-light">
                <span className="font-normal">Legal Authorities:</span> If required by law or to
                protect rights, safety, and property.
              </li>
            </ul>
          </section>

          <section className="mb-1   p-4">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-700">
              We use encryption, secure servers, and limited access protocols to protect your data.
              However, no online platform can guarantee 100% security.
            </p>
          </section>

          <section className="mb-1  p-4">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-700 mb-3">
              Depending on your location, you may have rights to:
            </p>

            <ul className="list-disc font-light pl-5 space-y-2 text-gray-700 ml-3">
              <li>Access, update, or delete your personal data.</li>
              <li>Opt out of marketing emails or notifications.</li>
              <li>Withdraw consent to data processing (may limit app functionality).</li>
            </ul>
          </section>

          <section className="mb-1 p-4">
            <h2 className="font-medium text-xl text-gray-900 mb-2">Cookies & Tracking</h2>
            <p className="text-gray-700 font-normal">
              Our App may use cookies or similar technologies to personalize content, remember
              preferences, and analyze usage. You can manage cookies in your device settings.
            </p>
          </section>

          <section className="mb-1  p-4">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Children's Privacy</h2>
            <p className="text-gray-700 font-normal">
              Our App is not intended for children under 13 (or relevant local age). We do not
              knowingly collect their data.
            </p>
          </section>

          <section className="mb-1  p-4">
            <h2 className="font-medium text-xltext-gray-900 mb-3">Third-Party Links</h2>
            <p className="text-gray-700 font-normal">
              Our App may contain links to third-party websites/services. We are not responsible for
              their privacy practices.
            </p>
          </section>

          <section className="mb-1  p-4">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Changes to this Policy</h2>
            <p className="text-gray-700 font-normal">
              We may update this Privacy Policy from time to time. Any changes will be posted within
              the App with a revised "Effective Date."
            </p>
          </section>

          <section className="mb-6  p-4">
            <h2 className="font-medium text-xl text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-700 mb-3 font-normal">
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>

            <div className="space-y-2 text-gray-700">
              <p>📧 Email: [support@yourapp.com]</p>
              <p>📞 Phone: [Your Support Number]</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
