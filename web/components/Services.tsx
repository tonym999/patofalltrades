"use client";

export default function Services() {
  return (
    <section id="services" className="py-16 sm:py-20 md:py-40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Our Services</h2>
          <p className="text-base sm:text-lg text-gray-300/90 mt-3 sm:mt-4">From minor repairs to major renovations, we do it all.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Service Card 1 */}
          <div className="service-card glass-card rounded-xl p-6 sm:p-8 text-center">
            <div className="text-gold mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">General Repairs</h3>
            <p className="text-gray-300/90">Fixing leaks, patching walls, assembling furniture, and all the small jobs you need done right.</p>
          </div>
          {/* Service Card 2 */}
          <div className="service-card glass-card rounded-xl p-6 sm:p-8 text-center">
            <div className="text-gold mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Painting & Decorating</h3>
            <p className="text-gray-300/90">Transform your space with professional interior and exterior painting services.</p>
          </div>
          {/* Service Card 3 */}
          <div className="service-card glass-card rounded-xl p-6 sm:p-8 text-center">
            <div className="text-gold mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Plumbing & Electrical</h3>
            <p className="text-gray-300/90">Certified experts for fixture installation, minor electrical work, and plumbing repairs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}



