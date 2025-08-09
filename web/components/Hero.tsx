"use client";

export default function Hero() {
  return (
    <section id="hero" className="h-screen flex items-center justify-center relative overflow-hidden parallax-bg" style={{backgroundImage: "url('hero.png')"}}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div id="hero-content" className="text-center z-10 px-4">
        <h1 id="hero-title" className="text-5xl md:text-7xl font-black text-white uppercase tracking-wider mb-4" style={{textShadow: '2px 2px 10px rgba(0,0,0,0.5)'}}>London&apos;s Premier Handyman</h1>
        <p id="hero-subtitle" className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto" style={{textShadow: '1px 1px 5px rgba(0,0,0,0.5)'}}>Reliable. Professional. Unmatched Quality.</p>
        <div className="mt-8">
          <a href="#contact" className="cta-btn text-dark-navy font-bold py-4 px-8 rounded-lg text-lg">Book a Consultation</a>
        </div>
      </div>
      <div id="currently-serving" className="absolute bottom-5 left-5 z-10 text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
        Currently serving: <span id="borough-name">London</span>
      </div>
    </section>
  );
}


