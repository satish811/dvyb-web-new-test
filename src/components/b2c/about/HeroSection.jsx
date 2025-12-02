import aboutBg from "@/assets/b2c/images/about/aboutPageBg.png";

export default function HeroSection() {
  return (
    <section
      className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${aboutBg})` }}
    >
      {/* Background overlay if needed */}
      <div className="absolute inset-0"></div>

      {/* Text container positioned slightly above bottom (10px gap) */}
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 z-10">
        <h1
          className="text-[100px] sm:text-[60px] md:text-[100px] lg:text-[120px] 
           font-extrabold tracking-[3px]"
          style={{
            color: "white",
            textShadow: "2px 2px 8px rgba(0,0,0,0.4)",
            letterSpacing: "1px",
          }}
        >
          About Us
        </h1>
      </div>
    </section>
  );
}
