const sections = [
  {
    id: 1,
    title: 'Disclaimer',
    intro:
      'Villy (operated by Digiware House) provides this platform and its services on an "as-is" and "as-available" basis.',
    items: [
      {
        label: 'Visual Representation',
        text:
          'While we use advanced rendering, we do not guarantee that the product colors, textures, or details displayed on your device will be an exact match to the physical product due to varying display calibrations and the nature of AI-generated imagery.',
      },
      {
        label: 'Service Limitations',
        text:
          'We do not warrant that the website will be error-free or that the server is free of viruses. Use of the platform is at your own risk.',
      },
      {
        label: 'External Content',
        text:
          'We are not responsible for the content or privacy practices of any third-party websites linked to our platform.',
      },
    ],
  },
  {
    id: 2,
    title: 'Cancellation, Returns, Exchange, Shipping & Refund Policy',
    items: [
      {
        label: 'Shipping',
        text:
          'We aim to dispatch orders within 24-48 hours. Delivery typically takes 3-7 business days across India. Shipping costs are calculated at checkout based on location and weight.',
      },
      {
        label: 'Cancellation',
        text:
          'You may cancel your order at any time before it is marked as "Dispatched" via the user dashboard.',
      },
      {
        label: 'Returns & Exchange',
        text:
          'We offer a 7-day return/exchange window from the delivery date for items that are damaged, defective, or significantly different from the description. Items must be unworn, unwashed, and include all original tags.',
      },
      {
        label: 'Refunds',
        text:
          'Once the returned item passes our quality check, refunds are initiated to the original payment method within 5-7 working days (or as per RBI settlement guidelines).',
      },
    ],
  },
  {
    id: 3,
    title: 'Consumer Protection Rights',
    intro:
      'In strict adherence to the Central Consumer Protection Authority (CCPA) guidelines and the Consumer Protection Act, 2019:',
    items: [
      {
        label: 'Right to Safety',
        text:
          'Protection against the marketing of goods which are hazardous to life and property.',
      },
      {
        label: 'Right to be Informed',
        text:
          'Transparent disclosure of all costs (GST, shipping), country of origin, and seller details.',
      },
      {
        label: 'Right to Redressal',
        text:
          'A robust grievance mechanism is in place to address consumer complaints within statutory timelines (acknowledgment within 48 hours).',
      },
    ],
  },
  {
    id: 4,
    title: 'Consumer Protection & Statutory Adherence',
    intro: 'Villy operates under the highest legal standards in India:',
    items: [
      {
        label: 'E-Commerce Rules 2020',
        text:
          'We maintain a "fallback liability" for sellers and provide clear pre-purchase information, including a "Country of Origin" filter.',
      },
      {
        label: 'Indian Contracts Act 1872',
        text:
          'All electronic transactions on Villy are recognized as valid and binding digital contracts.',
      },
      {
        label: 'IT Act 2000 & Data Protection',
        text:
          'We utilize 256-bit encryption for all data transfers.',
      },
      {
        label: 'Privacy Lockdown',
        text:
          'Villy does NOT store any user-uploaded pictures (e.g., for virtual trials or profile customization) to ensure zero risk of personal data misuse or identity theft.',
      },
      {
        label: 'Payment & Settlements Systems Act 2007',
        text:
          'We use only RBI-authorized payment aggregators. All customer funds are routed through secure escrow accounts.',
      },
      {
        label: 'Truthful Advertising (1986, 2019 Act)',
        text:
          'We strictly prohibit misleading advertisements. All claims regarding product performance or quality are backed by factual data.',
      },
    ],
  },
  {
    id: 5,
    title: 'Cookie Policy',
    intro: 'We use cookies to enhance your browsing and shopping experience.',
    items: [
      {
        label: 'Strictly Necessary',
        text: 'Required for cart functionality and secure login.',
      },
      {
        label: 'Analytical Cookies',
        text: 'Help us optimize the UI/UX by understanding how you interact with Villy.',
      },
      {
        label: 'Choice',
        text:
          'You can choose to opt-out of non-essential cookies via your browser settings, though this may limit your access to certain personalized features.',
      },
    ],
  },
  {
    id: 6,
    title: 'National Retail Policy',
    intro: 'Villy is aligned with the National Retail Policy objectives to:',
    bullets: [
      'Foster a modern, digitally-driven retail ecosystem.',
      'Improve supply chain efficiency through streamlined warehousing.',
      'Support small-scale Indian manufacturers by providing a transparent digital marketplace.',
    ],
  },
  {
    id: 7,
    title: 'Privacy Policy',
    items: [
      {
        label: 'Data Collection',
        text:
          'We collect only the minimum data required for order fulfillment (Name, Email, Phone, Address).',
      },
      {
        label: 'AI Disclosure',
        text:
          'To protect human privacy and ensure creative consistency, all Mannequin Models on Villy are AI-Generated and NOT humans.',
      },
      {
        label: 'Data Sharing',
        text:
          'We never sell your personal information. Data is shared only with logistics (for delivery) and payment partners (for transactions).',
      },
    ],
  },
  {
    id: 8,
    title: 'Track Order',
    items: [
      {
        label: 'Live Tracking',
        text:
          'Once dispatched, a real-time tracking link will be provided via SMS and your "My Orders" dashboard.',
      },
      {
        label: 'Milestones',
        text:
          'Users will receive updates for Order Confirmed, Packed, Shipped, Out for Delivery, and Delivered.',
      },
      {
        label: 'Support',
        text:
          'If a shipment is delayed beyond the estimated delivery date, users can escalate the issue directly through the "Track Order" interface.',
      },
    ],
  },
  {
    id: 9,
    title: 'Terms of Service / Use',
    items: [
      {
        label: 'Intellectual Property',
        text:
          'All designs, logos, and UI elements (including the "Villy" brand) are the exclusive property of Digiware House.',
      },
      {
        label: 'Rights & Trademark Infringement',
        text:
          'We have a zero-tolerance policy for counterfeit goods. If you believe your IP rights are being infringed, please contact our Nodal Officer.',
      },
      {
        label: 'User Conduct',
        text:
          'Users are prohibited from using bots, data scrapers, or engaging in fraudulent transaction patterns on the platform.',
      },
    ],
  },
];

function SectionContent({ section }) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          {section.id}. {section.title}
        </h2>
        {section.intro && <p className="text-base sm:text-lg text-gray-700 leading-7">{section.intro}</p>}
      </div>

      {section.items && (
        <div className="space-y-4">
          {section.items.map((item) => (
            <div key={`${section.id}-${item.label}`} className="space-y-1">
              <p className="text-base sm:text-lg text-gray-800 leading-7">
                <span className="font-semibold">{item.label}:</span> {item.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {section.bullets && (
        <ul className="space-y-2 pl-5 list-disc text-base sm:text-lg text-gray-700 leading-7">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function TermsAndConditions() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center mb-5">
            <span className="text-4xl sm:text-5xl font-black tracking-wide text-[#4B0A4B]">
              VILLY
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Terms & Conditions</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-6">
            Please read these terms carefully before using the Villy platform and related services.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-12">
          {sections.map((section) => (
            <SectionContent key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
