import ContactForm from './ContactForm';

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Get In Touch</h2>
          <p className="text-lg text-gray-400 mt-4">Ready to start your next project? Let's talk.</p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
