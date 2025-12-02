import React, { useState } from "react";
import { X } from "lucide-react";

export default function FeedbackForm() {
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const [feedback, setFeedback] = useState("");

  const ratings = [
    { emoji: "😢", label: "Very Bad" },
    { emoji: "😕", label: "Bad" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😄", label: "Excellent" },
  ];

  const improvements = [
    "Ease Of Use",
    "Fit Accuracy",
    "Smoothness",
    "Realism",
    "Overall Experience",
  ];

  const toggleImprovement = (item) => {
    if (selectedImprovements.includes(item)) {
      setSelectedImprovements(selectedImprovements.filter((i) => i !== item));
    } else {
      setSelectedImprovements([...selectedImprovements, item]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      rating: selectedRating,
      improvements: selectedImprovements,
      feedback: feedback,
    });
    alert("Thank you for your feedback!");
    setSelectedRating(null);
    setSelectedImprovements([]);
    setFeedback("");
  };

  const handleClose = () => {
    console.log("Closing feedback form");
    // Add logic here to hide the form if needed
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-2 pt-6 pb-6">
      <div className="relative bg-white w-[90%] max-w-lg p-6 shadow-xl my-12 rounded-xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center  mb-6">
          <h4 className="text-xl font-base ">SHARE YOUR EXPERIENCE - IT MEANS A LOT!</h4>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Section */}
          <div className="mb-8">
            <h2 className="text-base font-semibold mb-4">Your Rating</h2>
            <div className="flex gap-4 justify-start">
              {ratings.map((rating, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedRating(index + 1)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    selectedRating === index + 1 ? "scale-125" : "opacity-70"
                  }`}
                  title={rating.label}
                >
                  {rating.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Improvement Options */}
          <div className="mb-8">
            <h2 className="text-base font-semibold mb-4">What Can We Improve</h2>
            <div className="flex flex-wrap gap-3">
              {improvements.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleImprovement(item)}
                  className={`px-6 py-2.5 border-2 rounded transition-colors ${
                    selectedImprovements.includes(item)
                      ? "border-red-800 bg-red-800 text-white"
                      : "border-red-800 text-red-800 hover:bg-red-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="mb-6">
            <h2 className="text-base font-semibold mb-3">
              Do you have any thoughts you'd like to share
            </h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your Feedback (Required)"
              required
              rows="5"
              className="w-full border border-gray-300 rounded p-4 text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-red-900 text-white px-13 py-2 rounded hover:bg-red-800 transition-colors font-medium"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
