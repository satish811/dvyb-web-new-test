export default function MissionVision() {
  return (
    <section className="w-full bg-[var(--background-light)] py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl  font-normal text-center mb-8 sm:mb-12 text-[var(--text-primary)]">
          Mission & Vision
        </h2>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
          {/* Mission */}
          <div className="text-center">
            <div className="bg-[var(--primary-light)] w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl">🎯</span>
            </div>
            <h3 className="text-xl sm:text-2xl  font-normal mb-3 sm:mb-4 text-[var(--text-primary)]">
              Our Mission
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base">
              To Make Ethnic Fashion Accessible, Interactive, And Authentic. We Want Shoppers To
              Discover The Beauty Of Traditional Sarees And Ethnic Wear While Enjoying A Modern,
              Tech-Driven Shopping Experience With Features Like Virtual Try-Ons, Personalized
              Curation, And Seamless Browsing.
            </p>
          </div>

          {/* Vision */}
          <div className="text-center">
            <div className="bg-[var(--primary-light)] w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl">👁️</span>
            </div>
            <h3 className="text-xl sm:text-2xl  font-normal mb-3 sm:mb-4 text-[var(--text-primary)]">
              Our Vision
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base">
              To Become The Go-To Digital Destination For Ethnic Wear Worldwide — Celebrating
              India's Diverse Handlooms, Crafts, And Designs, While Reimagining The Shopping Journey
              With Technology. We Aim To Connect Generations To Their Roots By Offering Heritage
              Pieces With A Modern Twist.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
