import Image from "next/image";

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-20 md:py-32 bg-dark-navy/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Our Work</h2>
          <p className="text-lg text-gray-400 mt-4">Quality you can see. Results that last.</p>
        </div>

        {/* Before/After Slider */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-white mb-8">Kitchen Renovation</h3>
          <div className="comparison-slider max-w-4xl mx-auto rounded-lg shadow-2xl">
            <img src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070&auto=format&fit=crop" alt="Before" className="before-image" />
            <div className="after-image">
              <img src="https://images.unsplash.com/photo-1600607687939-ce8a67767e5c?q=80&w=2070&auto=format&fit=crop" alt="After" className="after-image-content" />
            </div>
            <div className="slider-handle"></div>
          </div>
        </div>
      </div>
    </section>
  );
}


