import Image from "next/image";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-40 bg-dark-navy/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">What Our Clients Say</h2>
        </div>
        {/* This would be a JS-powered carousel */}
        <div className="testimonial-card glass-card rounded-xl p-10 max-w-3xl mx-auto text-center">
          <Image src="https://i.pravatar.cc/100?u=a042581f4e29026704d" alt="Client" width={96} height={96} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold" />
          <p className="text-lg text-gray-300 mb-4">&quot;Absolutely outstanding service. Pat was punctual, professional, and the quality of his work was second to none. He transformed our flat. Highly recommended!&quot;</p>
          <h4 className="text-xl font-bold text-white">Sarah L.</h4>
          <p className="text-gold">Kensington</p>
        </div>
      </div>
    </section>
  );
}


