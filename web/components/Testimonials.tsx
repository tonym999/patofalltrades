import { testimonials } from "@/lib/data";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-dark-navy/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">What Our Clients Say</h2>
        </div>
        {/* This would be a JS-powered carousel */}
        <div className="testimonial-card glass-card rounded-xl p-8 max-w-3xl mx-auto text-center">
          <img src="https://i.pravatar.cc/100?u=a042581f4e29026704d" alt="Client" className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold" />
          <p className="text-lg text-gray-300 mb-4">"Absolutely outstanding service. Pat was punctual, professional, and the quality of his work was second to none. He transformed our flat. Highly recommended!"</p>
          <h4 className="text-xl font-bold text-white">Sarah L.</h4>
          <p className="text-gold">Kensington</p>
        </div>
      </div>
    </section>
  );
}


