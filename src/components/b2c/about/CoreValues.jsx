const coreValues = [
  {
    icon: "🎨",
    title: "Celebrating Tradition",
    desc: "We honor India's regional artistry by curating sarees and ethnic wear that carry forward the legacy of our culture.",
  },
  {
    icon: "💻",
    title: "Tech-Enabled Experience",
    desc: "From 2D previews to 3D virtual try-ons, we use innovation to make shopping more immersive and trustworthy.",
  },
  {
    icon: "✨",
    title: "Quality & Authenticity",
    desc: "Every weave, embroidery, and design is sourced with care to maintain originality and craftsmanship.",
  },
  {
    icon: "❤️",
    title: "Customer First",
    desc: "Your comfort and confidence matter most. Our platform is built to give you clarity, convenience, and joy while shopping.",
  },
  {
    icon: "🚀",
    title: "Innovation in Ethnic Fashion",
    desc: "We merge timeless designs with modern technology, ensuring heritage wear never goes out of style.",
  },
];

export default function CoreValues() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl serif font-normal text-center mb-8 sm:mb-12 text-[var(--text-primary)]">
          Core Values
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-[var(--border-radius-xl)] p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-[var(--border-light)] hover:border-[var(--primary-color)]/20 group hover:-translate-y-1"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                {value.icon}
              </div>
              <h3 className="text-lg sm:text-xl  font-normal text-center mb-3 sm:mb-4 text-[var(--text-primary)]">
                {value.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-center leading-relaxed text-sm sm:text-base">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
