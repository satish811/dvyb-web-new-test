import React, { useState } from "react";
import { Phone, MessageCircle, ChevronDown } from "lucide-react";

import brdialImage from "@/assets/b2c/images/FAQ/birdal.svg";
import logoImage from "@/assets/b2c/images/FAQ/Logo.svg";
import LogoName from "@/assets/b2c/images/FAQ/LogoName.svg";

const FaqPage = () => {
  const faqs = [
    {
      question: "Can I modify my delivery address?",
      answer:
        "Yes, you can modify your delivery address before the order is shipped. Please contact our customer support immediately with your order ID and the new address.",
    },
    {
      question: "What is COD (Cash On Delivery)? Are there any additional charges for COD orders?",
      answer:
        "Cash On Delivery allows you to pay for your order at the time of delivery. There might be a small convenience fee for COD orders, which will be clearly displayed during checkout.",
    },
    {
      question: "Can I open and check the contents of my package before accepting delivery?",
      answer:
        "To ensure the safety and integrity of all orders, packages cannot be opened before payment is made and delivery is accepted. If you receive a damaged or incorrect item, please refer to our return policy.",
    },
    {
      question: "I paid cash on delivery, how would I get the refund?",
      answer:
        "For COD orders, refunds are typically processed via bank transfer to your provided account details. Please ensure your bank information is correct when initiating a return or refund request.",
    },
    {
      question: "Why am I being charged GST?",
      answer:
        "As per government regulations, GST (Goods and Services Tax) is applicable on all products and services. The GST amount is included in the final price displayed at checkout.",
    },
    {
      question:
        "My transaction failed but the money was deducted from my account. What should I do?",
      answer:
        "If your transaction failed but money was deducted, please wait for 24-48 hours. The amount is usually reversed automatically. If it's not, contact your bank and our customer support with your transaction details.",
    },
    {
      question: "If I receive a wrong product, can I get it replaced?",
      answer:
        "Absolutely! If you receive a wrong or defective product, you can request a replacement. Please initiate a return request within our specified return window, and we will arrange for a replacement.",
    },
  ];

  const [openFAQIndex, setOpenFAQIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans">
      {/* Top Spacer */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Image */}
        <div className="flex justify-center">
          <img
            src={brdialImage}
            alt="Customer support illustration"
            className="w-full max-w-md rounded-xl shadow-lg object-cover"
          />
        </div>

        {/* Right: Content */}
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center">
            <img src={logoImage} alt="Villy Logo" className="w-24 mb-3" />
            <img src={LogoName} alt="Villy" className="w-32" />
          </div>

          <p className="text-lg md:text-xl leading-relaxed text-gray-800 max-w-2xl mx-auto">
            At Villy, we're here to assist you with shopping that's both simple and budget-friendly,
            all while ensuring you don't sacrifice style, quality, or variety. Whether you're
            preparing for weddings or family gatherings, our carefully selected collections for men,
            women, and kids are tailored to create cohesive looks at incredible prices.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-left">Help & Support</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <span className="pr-8 text-base leading-snug">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${openFAQIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFAQIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                {openFAQIndex === index && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Personal Help?</h2>
        <p className="text-base md:text-lg text-gray-700 mb-10 max-w-3xl">
          Our expert team is here to help you succeed. Get personalized support in your preferred
          language.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Call Us */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <Phone className="w-10 h-10 text-gray-900 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-6">Speak directly with our support team</p>
            <a
              href="tel:+919876543210"
              className="block w-full text-center py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              Call +91 98765 43210
            </a>
          </div>

          {/* Chat With Us */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <MessageCircle className="w-10 h-10 text-gray-900 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chat with Us</h3>
            <p className="text-gray-600 mb-6">Get instant help from our experts</p>
            <button className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              Start Chat
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
