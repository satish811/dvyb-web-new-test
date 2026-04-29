import React, { useState } from "react";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({ phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Feedback submitted:", formData);
    setSubmitted(true);
    setFormData({ phone: "", email: "", message: "" });
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 md:px-10">
      <section className="rounded-3xl bg-white/10 p-8 shadow-xl shadow-black/10 ring-1 ring-white/10 backdrop-blur-xl text-white">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-purple-950">Feedback</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Share your feedback with VILLY</h1>
          <p className="mt-4 max-w-2xl text-base text-black/80">
            Tell us about your experience, suggestions, or questions. We appreciate your input and will review it promptly.
          </p>
        </div>

        {submitted && (
          <div className="mb-6 rounded-2xl bg-green-500/15 p-4 text-sm text-purple-950 ring-1 ring-green-200/30">
            Thank you! Your feedback has been received.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-black/80">Phone Number</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange("phone")}
              placeholder="Enter your phone number"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-violet-400/30"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-black/80">Email Address</span>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="Enter your email"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-violet-400/30"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-black/80">Message</span>
            <textarea
              value={formData.message}
              onChange={handleChange("message")}
              rows={5}
              placeholder="Write your feedback here"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-violet-400/30"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-gray-100"
          >
            Submit Feedback
          </button>
        </form>
      </section>
    </main>
  );
}
