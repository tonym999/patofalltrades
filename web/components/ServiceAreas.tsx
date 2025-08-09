export default function ServiceAreas() {
  return (
    <section id="service-area" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Our Service Area</h2>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
            Proudly serving North West London and surrounding areas. We are based in Colindale and our core service areas include:
          </p>
        </div>
        <div className="max-w-4xl mx-auto glass-card rounded-xl p-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-light-navy text-gold font-semibold py-2 px-4 rounded-full">Barnet</span>
            <span className="bg-light-navy text-gold font-semibold py-2 px-4 rounded-full">Brent</span>
            <span className="bg-light-navy text-gold font-semibold py-2 px-4 rounded-full">Harrow</span>
            <span className="bg-light-navy text-gold font-semibold py-2 px-4 rounded-full">Camden</span>
            <span className="bg-light-navy text-gold font-semibold py-2 px-4 rounded-full">Hendon</span>
            <span className="bg-light-navy text-gold font-semibold py-2 px-4 rounded-full">Edgware</span>
          </div>
          <p className="text-gray-400 mt-6">Don&apos;t see your area? Contact us to see if we cover your postcode!</p>
        </div>
      </div>
    </section>
  );
}


