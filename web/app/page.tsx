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
import ProgressBar from '@/components/ProgressBar';
import Scripts from '@/components/Scripts';

export default function Home() {
  return (
    <>
      <ProgressBar />
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
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
