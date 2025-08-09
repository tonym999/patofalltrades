"use client";
import { useState } from "react";

export default function ContactForm() {
  return (
    <div className="max-w-xl mx-auto glass-card rounded-xl p-8">
      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input type="text" placeholder="Your Name" className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition" />
          <input type="email" placeholder="Your Email" className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition" />
        </div>
        <textarea placeholder="Tell us about your project..." rows={6} className="w-full bg-light-navy/50 p-3 rounded-lg border border-gray-600 mb-6 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition"></textarea>
        <button type="submit" className="cta-btn w-full text-dark-navy font-bold py-4 px-8 rounded-lg text-lg">Send Message</button>
      </form>
    </div>
  );
}


