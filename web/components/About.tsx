import Image from "next/image";
export default function About() {
  return (
    <section id="about" className="py-24 md:py-40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white">About Us</h2>
          <p className="text-lg text-gray-400 mt-4">A decade of dedication to London homes.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
              <Image src="/skilled-handman.png" alt="Craftsman" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div className="md:w-1/2">
            <p className="text-gray-300 mb-6 text-lg">Founded in 2014, Pat Of All Trades was born from a simple mission: to provide Londoners with a handyman service that is not just reliable, but remarkably professional. We believe in clear communication, transparent pricing, and a finished product that exceeds expectations every time.</p>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <span className="counter text-5xl font-bold text-gold" data-target="10">0</span>
                <p className="text-gray-400">Years Experience</p>
              </div>
              <div>
                <span className="counter text-5xl font-bold text-gold" data-target="2500">0</span>
                <p className="text-gray-400">Jobs Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


