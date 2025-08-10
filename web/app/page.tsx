import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import MobileNav from '@/components/MobileNav';
import Scripts from '@/components/Scripts';
import ServiceAreas from '@/components/ServiceAreas';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <ServiceAreas />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <MobileNav />
      <Scripts />
    </>
  );
}
