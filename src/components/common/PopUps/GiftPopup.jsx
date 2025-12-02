import GiftPopupimg from "@/assets/b2c/images/GiftPopUp/GiftPopUp.svg";

const GiftPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-md w-[90%] md:w-[750px] flex flex-col md:flex-row justify-between items-center relative shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 cursor-pointer right-4 text-black text-2xl font-semibold hover:text-gray-700"
        >
          ×
        </button>

        {/* Left Section (Text and Form) */}
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="text-lg font-normal tracking-wide text-gray-800">
            SEND A GIFT TO LOVED ONES
          </h2>
          <p className="text-sm font-normal text-gray-600">
            We will Gift wrap it and include a special note with your order
          </p>

          <form className="space-y-3">
            <input
              type="text"
              placeholder="Recipient's Name"
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:border-black"
            />
            <textarea
              placeholder="Your Message"
              className="w-full border border-gray-300 rounded-sm p-2 text-sm h-20 resize-none focus:outline-none focus:border-black"
            ></textarea>
            <input
              type="text"
              placeholder="Sender's Name"
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 mt-2 font-semibold cursor-pointer"
            >
              SAVE AND CONTINUE
            </button>
          </form>
        </div>

        {/* Right Section (Image) */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 flex justify-center">
          <img src={GiftPopupimg} alt="Gift boxes" className="rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default GiftPopup;
