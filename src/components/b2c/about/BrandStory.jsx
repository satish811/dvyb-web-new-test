import redSaree from "@/assets/b2c/images/about/redSaree.png";
import saree2 from "@/assets/b2c/images/about/saree2.png";

export default function BrandStory() {
  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-8 sm:p-12 lg:p-16">
        <h2 className="text-4xl sm:text-5xl text-center mb-12 text-gray-900">Brand Story</h2>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-6">
            <p className="text-base sm:text-lg leading-relaxed text-gray-700">
              Villy Was Born With A Vision To Make Ethnic Fashion Timeless Yet Effortless. In India,
              Every Weave Tells A Story — From The Grace Of Kanchipuram Silks To The Artistry Of
              Kalamkari And The Elegance Of Banarasi Sarees. But Bringing These Traditions To Modern
              Shoppers, Especially Online, Often Felt Complicated.
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-gray-700">
              That's Why Villy Blends Technology With Tradition. Through Our 2D And 3D Virtual
              Try-On, You Don't Just Shop — You Experience How A Saree, Lehenga, Or Ethnic Outfit
              Looks On You Before Making A Choice. We Bring Together Regional Weaves, Heritage
              Crafts, And Festive Collections Under One Platform, Making It Simple For Anyone,
              Anywhere, To Embrace India's Rich Culture In Style.
            </p>
          </div>
          {/* Image Stack */}
          <div className="lg:w-1/2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md h-[420px] sm:h-[480px]">
              {/* Pink/Red background card with saree2 */}
              <div className="absolute top-0 right-0 w-52 sm:w-60 h-72 sm:h-80 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl overflow-hidden shadow-xl z-10">
                <img
                  src={saree2}
                  alt="Traditional Saree"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              {/* Dark navy background card with redSaree */}
              <div className="absolute bottom-0 left-0 w-48 sm:w-56 h-80 sm:h-96 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={redSaree}
                  alt="Red Saree"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
