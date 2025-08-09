"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const resp = await fetch("/api/contact", { method: "POST", body: data });
      if (resp.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto glass-card rounded-xl p-8">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input name="name" required type="text" placeholder="Your Name" className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition" />
          <input name="email" required type="email" placeholder="Your Email" className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition" />
        </div>
        <input name="phone" type="tel" placeholder="Phone (optional)" className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition mb-6" />
        <textarea name="message" required placeholder="Tell us about your project..." rows={6} className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 mb-6 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition"></textarea>
        <button type="submit" className="cta-btn w-full text-dark-navy font-bold py-4 px-8 rounded-lg text-lg">
          {status === "submitting" ? "Sending..." : "Send Message"}
        </button>
        {status === "success" && <p className="mt-3 text-green-400">Thanks! I’ll get back to you shortly.</p>}
        {status === "error" && <p className="mt-3 text-red-400">Something went wrong. Please try again later.</p>}
      </form>
    </div>
  );
}


