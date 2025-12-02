import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faPinterestP,
  faFacebookF,
  faTwitter,
  faTelegramPlane,
} from "@fortawesome/free-brands-svg-icons";
import { faHandsHelping, faGem, faUsers, faLightbulb } from "@fortawesome/free-solid-svg-icons";

import bannerImg from "@/assets/b2c/images/OurStory/Banner.svg";
import redSaree from "@/assets/b2c/images/OurStory/redSaree.svg";
import pinkSaree from "@/assets/b2c/images/OurStory/pinkSaree.svg";
import bride from "@/assets/b2c/images/OurStory/bride.svg";
import hand from "@/assets/b2c/images/OurStory/hand.svg";

const ourStory = () => {
  const socialIcons = [
    { icon: faInstagram, hover: "hover:text-pink-600", color: "text-gray-700" },
    { icon: faPinterestP, hover: "hover:text-red-600", color: "text-gray-700" },
    { icon: faFacebookF, hover: "hover:text-blue-600", color: "text-gray-700" },
    { icon: faTwitter, hover: "hover:text-sky-500", color: "text-gray-700" },
    {
      icon: faTelegramPlane,
      hover: "hover:text-blue-500",
      color: "text-gray-700",
    },
  ];

  const coreValues = [
    {
      title: "Celebrating Tradition",
      text: "We celebrate India’s artistry with curated sarees and ethnic wear that honor our culture.",
      icon: faHandsHelping,
    },
    {
      title: "Quality & Authenticity",
      text: "Every weave, embroidery, and design is sourced with care to maintain originality and craftsmanship.",
      icon: faGem,
    },
    {
      title: "Customer First",
      text: "Your comfort and confidence are our priority. Our platform offers clarity, convenience, and joy in shopping.",
      icon: faUsers,
    },
    {
      title: "Tech-Enabled Experience",
      text: "From 2D previews to 3D virtual try-ons, we use innovation to make shopping more immersive and trustworthy.",
      icon: faLightbulb,
    },
  ];

  const galleryImages = {
    image1: redSaree,
    image2: bannerImg,
    image3: bride,
    image4: hand,
    image5: pinkSaree,
  };

  return (
    <div className="w-full flex flex-col items-center bg-white text-gray-900">
      {/* Navbar space */}
      <div className="w-full h-[80px]" />

      {/* Our Story */}
      <section className="max-w-7xl w-full px-4 sm:px-1 lg:px-8 py-10  text-center">
        <h1 className="font-semibold text-5xl mb-2">Our Story</h1>

        <div className="w-[40%] h-[30%]  flex justify-center mb-10 max-w-4xl mx-auto">
          <img
            src={galleryImages.image2}
            alt="Our Story Group"
            className="rounded-lg w-full h-auto object-cover shadow-xl max-h-[880px]"
          />
        </div>

        <div className="max-w-4xl mx-auto mb-8 space-y-7 text-center">
          <p className="text-[24px] leading-[46px] font-[400]  text-gray-600 capitalize">
            DVYB Was Born With A Vision To Make Ethnic Fashion Timeless Yet Effortless. In India,
            Every Weave Tells A Story — From The Grace Of Kanchipuram Silks To The Artistry Of
            Kalamkari And The Elegance Of Banarasi Sarees. But Bringing These Traditions To Modern
            Shoppers, Especially Online, Often Felt Complicated.
          </p>

          <p className="text-[24px] leading-[46px] font-[400] text-gray-600 capitalize">
            That’s Why DVYB Blends Technology With Tradition. Through Our 2D And 3D Virtual Try-On,
            You Don’t Just Shop — You Experience How A Saree, Lehenga, Or Ethnic Outfit Looks On You
            Before Making A Choice. We Bring Together Regional Weaves, Heritage Crafts, And Festive
            Collections Under One Platform, Making It Simple For Anyone, Anywhere, To Embrace
            India’s Rich Culture In Style.
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-3">
          {socialIcons.map((item, i) => (
            <a
              key={i}
              href="#"
              aria-label={item.icon.iconName}
              className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-900 bg-white ${item.color} ${item.hover} transition duration-300 transform hover:scale-110`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-xl" />
            </a>
          ))}
        </div>
        <p className="text-sm text-gray-600">Follow us for more stories, weaves & inspirations</p>
      </section>

      {/* Mission */}
      <section className="max-w-5xl w-full text-center px-4 sm:px-6 py-2">
        <h2 className="text-4xl font-bold mb-3">Our Mission</h2>
        <p className=" font-semibold text-[24px] leading-[46px] tracking-[0] text-gray-700 text-center capitalize">
          To Make Ethnic Fashion Accessible, Interactive, And Authentic. We Want Shoppers To
          Discover The Beauty Of Traditional Sarees And Ethnic Wear While Enjoying A Modern,
          Tech-Driven Shopping Experience With Features Like Virtual Try-Ons, Personalized Curation,
          And Seamless Browsing.
        </p>
      </section>

      {/* Vision */}
      <section className="max-w-4xl w-full text-center px-4 sm:px-6 py-14">
        <h2 className="text-4xl font-bold mb-2">Our Vision</h2>
        <p className=" font-semibold text-[24px] leading-[46px] tracking-[0] text-gray-700 text-center capitalize">
          To Become The Go-To Digital Destination For Ethnic Wear Worldwide Celebrating India’s
          Diverse Handlooms, Crafts, And Designs, While Reimagining The Shopping Journey With
          Technology. We Aim To Connect Generations To Their Roots By Offering Heritage Pieces With
          A Modern Twist And A Shopping Experience That Feels Immersive, Inspiring, And Inclusive.
        </p>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl w-full text-center px-4 sm:px-3 lg:px-8 py-1">
        <h2 className="text-4xl font-bold mb-16">Our Core Values</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mb-20">
          {coreValues.map((value, index) => (
            <div key={index} className="flex flex-col items-center px-2">
              <FontAwesomeIcon icon={value.icon} className="text-3xl text-gray-500 mb-4" />
              <h4 className="font-outfit font-medium text-[22px] leading-[30px] tracking-[0] text-gray-900 text-center mb-1">
                {value.title}
              </h4>
              <p className=" font-normal text-[16px] leading-[20px] tracking-[0] text-gray-600 text-center max-w-[200px] mx-auto">
                {value.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-19  w-[80%] mx-auto">
          {/* First Row */}
          <div className="flex flex-col md:flex-row gap-1">
            <div className="rounded-lg overflow-hidden shadow-xl transition duration-300 hover:scale-[1.005] flex-1">
              <img
                src={galleryImages.image1}
                alt="Bridal wear close-up"
                className="w-full object-cover sm:h-[300px] md:h-96"
              />
            </div>
            <div className="mt-4 md:mt-20 rounded-lg overflow-hidden shadow-xl transition duration-300 hover:scale-[1.005] flex-[0.5]">
              <img
                src={galleryImages.image5}
                alt="Woman in pink lehenga"
                className="w-full bg-red-800 object-cover sm:h-[250px] md:h-76"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-col md:flex-row gap-1 p-2">
            <div className="h-76 rounded-lg overflow-hidden shadow-xl transition duration-300 hover:scale-[1.005] flex-[0.5]">
              <img
                src={galleryImages.image3}
                alt="Woman in maroon lehenga"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-96 rounded-lg overflow-hidden shadow-xl transition duration-300 hover:scale-[1.005] flex-1">
              <img
                src={galleryImages.image4}
                alt="Embroidered saree detail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer space */}
      <div className="w-full h-[80px]" />
    </div>
  );
};

export default ourStory;
