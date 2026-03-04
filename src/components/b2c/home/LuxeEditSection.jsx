// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// // Asset Imports
// import mainImg from "../../../assets/b2c/landing/Landing-villy/Luxewomen.png";
// import decorLeftBottom from "../../../assets/b2c/landing/Landing-villy/Borderdesign2.png";
// import Luxeeditsectionframe from "../../../assets/b2c/landing/Landing-villy/Luxeeditsectionframe.png";
// import decorLeftTop from "../../../assets/b2c/landing/Landing-villy/Borderdesignbottom.png";
// import decorRight from "../../../assets/b2c/landing/Landing-villy/flower1.png";

// // Grid Images
// import bridalImg from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";
// import under20kImg from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
// import bridesmaidImg from "../../../assets/b2c/landing/Landing-villy/silksaree.jpg";
// import designerImg from "../../../assets/b2c/landing/Landing-villy/florallehanga.jpg";

// // Mobile Assets
// import mobileLeftImg from "../../../assets/b2c/landing/Landing-villy/MobileLuxeditleft.png";
// import mobileRightImg from "../../../assets/b2c/landing/Landing-villy/mobileLuxeedit.png";

// const LuxeEditSection = () => {
//     const navigate = useNavigate();

//     const gridItems = [
//         { id: 1, title: "BRIDAL EDIT", img: bridalImg, link: "/womenwear?category=wedding" },
//         { id: 2, title: "UNDER ₹20K", img: under20kImg, link: "/womenwear?priceMax=20000" },
//         { id: 3, title: "BRIDES MADE EDIT", img: bridesmaidImg, link: "/womenwear?category=saree" },
//         { id: 4, title: "DESIGNER LEHENGAS", img: designerImg, link: "/womenwear?category=lehenga" },
//     ];

//     return (
//         <section className="relative w-full overflow-hidden">

//             {/* ================= MOBILE LAYOUT (Luxury Redesign) ================= */}
//             <div className="block lg:hidden w-full relative h-[100vh] overflow-hidden"
//                 style={{ background: 'radial-gradient(circle at 50% 30%, #7A0068 0%, #3F0036 100%)' }}>

//                 {/* Title */}
//                 <div className="absolute top-12 w-full text-center z-30">
//                     <h2 className="text-6xl text-white tracking-widest uppercase font-thin"
//                         style={{
//                             fontFamily: 'Catchye Demo',
//                             letterSpacing: '0.15em',
//                             textShadow: '0 4px 10px rgba(0,0,0,0.3)'
//                         }}>
//                         LUXE <span className="italic">EDIT</span>
//                     </h2>
//                 </div>

//                 {/* Images Container */}
//                 <div className="absolute inset-x-0 bottom-0 h-[85%] w-full z-10 pointer-events-none">
//                     {/* Left Model - Bottom Left */}
//                     <img
//                         src={mobileLeftImg}
//                         alt="Luxe Edit Left"
//                         className="absolute bottom-0 left-[-5%] w-[65%] h-auto object-contain z-10"
//                         style={{ filter: 'drop-shadow(10px 0 20px rgba(0,0,0,0.4))' }}
//                     />
//                     {/* Right Model - Bottom Right */}
//                     <img
//                         src={mobileRightImg}
//                         alt="Luxe Edit Right"
//                         className="absolute bottom-0 right-[-5%] w-[60%] h-auto object-contain z-20"
//                         style={{ filter: 'drop-shadow(-10px 0 20px rgba(0,0,0,0.4))' }}
//                     />
//                 </div>

//                 {/* CTA Button */}
//                 <div className="absolute bottom-12 w-full flex justify-center z-40">
//                     <button
//                         onClick={() => navigate('/womenwear')}
//                         className="bg-white text-black px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-100 transition-transform transform active:scale-95"
//                     >
//                         Shop Now
//                     </button>
//                 </div>
//             </div>


//             {/* ================= DESKTOP LAYOUT (Existing) ================= */}
//             <div className="hidden lg:flex items-center justify-center relative w-full"
//                 style={{
//                     minHeight: '630px',
//                     height: 'auto',
//                     paddingTop: '0px',
//                     paddingBottom: '40px',
//                     backgroundImage: `url(${Luxeeditsectionframe})`,
//                     backgroundSize: 'cover',
//                     backgroundPosition: 'center',
//                     backgroundRepeat: 'no-repeat'
//                 }}
//             >
//                 <div className="relative z-10 w-full max-w-[1330px] mx-auto flex flex-col lg:flex-row items-center justify-end px-4 lg:px-0">

//                     {/* RIGHT SECTION: 2x2 Grid - Positioned to the right */}
//                     <div className="w-full lg:w-[600px] grid grid-cols-2 gap-[15px] mt-10 lg:mt-0 relative z-20">
//                         {gridItems.map((item, index) => (
//                             <motion.div
//                                 key={item.id}
//                                 initial={{ opacity: 0, y: 30 }}
//                                 whileInView={{ opacity: 1, y: 0 }}
//                                 viewport={{ once: true }}
//                                 transition={{ delay: index * 0.1 }}
//                                 onClick={() => navigate(item.link)}
//                                 className="group cursor-pointer relative overflow-hidden rounded-[13px] shadow-lg border border-transparent hover:border-[#FFD700]/20 transition-all duration-300 transform hover:-translate-y-1"
//                                 style={{
//                                     width: '100%',
//                                     maxWidth: '213px',
//                                     height: '271px', // Keep original height
//                                     background: '#3F083B',
//                                     paddingBottom: '34px' // Added padding for label area
//                                 }}
//                             >
//                                 <div className="w-full h-full overflow-hidden rounded-[13px]">
//                                     <img
//                                         src={item.img}
//                                         alt={item.title}
//                                         className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
//                                     />
//                                 </div>

//                                 {/* Bottom Label Banner - Full Width Dark */}
//                                 <div className="absolute bottom-0 left-0 right-0 py-3 text-center transition-colors group-hover:bg-[#580040]"
//                                     style={{
//                                         background: '#3F083B',
//                                         borderBottomLeftRadius: '13.13px',
//                                         borderBottomRightRadius: '13.13px',
//                                         height: '34px', // Fixed height for label area
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center'
//                                     }}>
//                                     <span className="text-white text-[10px] font-bold tracking-[0.05em] uppercase block">
//                                         {item.title}
//                                     </span>
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default LuxeEditSection;











import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Desktop Assets
import Luxeeditsectionframe from "../../../assets/b2c/landing/Landing-villy/LuxEditbanner.png";
import bridalImg from "../../../assets/b2c/landing/Landing-villy/Bridal.jpg";
import under20kImg from "../../../assets/b2c/landing/Landing-villy/Sarees.png";
import bridesmaidImg from "../../../assets/b2c/landing/Landing-villy/silksaree.jpg";
import designerImg from "../../../assets/b2c/landing/Landing-villy/DesignerLehangas.jpg";

// Mobile Assets
import mobileFullImg from "../../../assets/b2c/landing/Landing-villy/MobileLuxeEdit2.png";

const LuxeEditSection = () => {
  const navigate = useNavigate();

  const gridItems = [
    { id: 1, title: "BRIDAL EDIT", img: bridalImg, link: "/womenwear?category=wedding" },
    { id: 2, title: "UNDER ₹20K", img: under20kImg, link: "/womenwear?priceMax=20000" },
    { id: 3, title: "BRIDESMAID EDIT", img: bridesmaidImg, link: "/womenwear?category=saree" },
    { id: 4, title: "DESIGNER LEHENGAS", img: designerImg, link: "/womenwear?category=lehenga" },
  ];

  return (
    <section className="relative w-full overflow-hidden">

      {/* ================= MOBILE (GAP FIXED) ================= */}
      {/* ================= MOBILE (GAP FIXED V2) ================= */}
      {/* ================= MOBILE (ROBUST LAYOUT V3) ================= */}
      {/* ================= MOBILE & TABLET (using new MobileLuxeEdit2 image) ================= */}
      <div
        className="relative md:hidden w-full h-auto flex flex-col items-center justify-center bg-[#5d004d] cursor-pointer"
        onClick={() => navigate("/womenwear")}
      >
        <img
          src={mobileFullImg}
          alt="Luxe Edit Mobile"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* ================= DESKTOP ================= */}
      <div
        className="hidden md:flex items-center justify-center relative w-full min-h-[500px] lg:min-h-[630px] 2xl:min-h-[850px] pb-10 2xl:pb-20"
        style={{
          backgroundImage: `url(${Luxeeditsectionframe})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 w-full max-w-[1330px] 2xl:max-w-[1920px] mx-auto flex justify-end px-4 md:px-8 xl:px-12 2xl:px-16">
          {/* Added md:pr-10 lg:pr-32 2xl:pr-[180px] to push the grid away from the floral elements on the right safely on all sizes */}
          <div
            className="w-full relative z-20 mt-10 md:mt-0 grid grid-cols-2 md:mr-10 lg:mr-32 2xl:mr-[180px] md:gap-x-10 lg:gap-x-[66.69px] gap-y-[26.92px] max-w-[400px] lg:max-w-[472.83px]"
          >
            {gridItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(item.link)}
                className="cursor-pointer relative overflow-hidden group shadow-lg flex flex-col w-[203.07px] h-[263.84px] rounded-[13.13px] border-[0.82px] border-transparent pb-[4.92px] gap-[4.92px] bg-[#3F083B]"
              >
                <div className="w-full flex-grow relative overflow-hidden"
                  style={{ borderTopLeftRadius: '13.13px', borderTopRightRadius: '13.13px' }}>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div
                  className="w-full flex items-center justify-center transition-colors group-hover:bg-[#580040]"
                  style={{
                    height: '28px', // Remaining height for the text area
                    background: "#3F083B",
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                  }}
                >
                  <span
                    className="text-white uppercase"
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section >
  );
};

export default LuxeEditSection;
