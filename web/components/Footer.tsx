import { Mail, MessageCircle, Phone } from "lucide-react";
import { CONTACT_INFO, whatsappHref } from "@/config/contact";

const footerLinkClassName =
  "group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-[color:var(--gold)] hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1f2e]";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-navy border-t border-white/10 pt-10 pb-[calc(var(--cta-height)+2rem)] md:py-10">
      <div className="container mx-auto flex flex-col gap-8 px-6 text-body md:flex-row md:items-start md:justify-between">
        <div className="max-w-md text-center md:text-left">
          <p className="text-lg font-semibold text-white">Pat Of All Trades</p>
          <p className="mt-2 text-sm text-muted">Premium Handyman Services in London</p>
          <p className="mt-4 text-sm">&copy; {currentYear} Pat Of All Trades. All Rights Reserved.</p>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-center text-xl font-semibold text-white md:text-left">Contact Pat</h2>
          <address className="mt-4 not-italic">
            <ul className="grid gap-3">
              <li>
                <a
                  href={`tel:${CONTACT_INFO.phoneE164}`}
                  className={footerLinkClassName}
                >
                  <Phone size={18} aria-hidden="true" className="text-[var(--gold)]" />
                  <span>
                    <span className="block font-semibold text-white">Call Pat</span>
                    <span className="text-sm text-muted">{CONTACT_INFO.phoneDisplay}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref()}
                  rel="noopener noreferrer"
                  target="_blank"
                  className={footerLinkClassName}
                >
                  <MessageCircle size={18} aria-hidden="true" className="text-[#25D366]" />
                  <span>
                    <span className="block font-semibold text-white">WhatsApp Pat</span>
                    <span className="text-sm text-muted">Fastest way to share photos and project details</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className={footerLinkClassName}
                >
                  <Mail size={18} aria-hidden="true" className="text-[var(--gold)]" />
                  <span>
                    <span className="block font-semibold text-white">Email Pat</span>
                    <span className="text-sm text-muted">{CONTACT_INFO.email}</span>
                  </span>
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>
    </footer>
  );
}
