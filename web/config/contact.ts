export const CONTACT_INFO = {
  // E.164 format for tel: links
  phoneE164: "+447123456789",
  // Digits only for WhatsApp wa.me links
  whatsappDigits: "447123456789",
  email: "pat@patofalltrades.co.uk",
} as const;

export const WHATSAPP_PRESET = "Hi Pat, ";

const WA_BASE = "https://wa.me/" as const;

const resolveWithAnchor = (pathname: string, search: string): string | null => {
  if (typeof document === "undefined") return null;
  const anchor = document.createElement("a");
  anchor.href = WA_BASE;
  anchor.pathname = pathname;
  anchor.search = search;
  return anchor.href;
};

const resolveWithURL = (pathname: string, search: string): string => {
  const url = new URL(pathname, WA_BASE);
  url.search = search;
  return url.toString();
};

export const whatsappHref = (preset: string = WHATSAPP_PRESET): string => {
  const cleanDigits = CONTACT_INFO.whatsappDigits.replace(/\D+/g, "");
  if (!cleanDigits) {
    throw new Error("Missing WhatsApp digits for wa.me link");
  }
  const pathname = `/${cleanDigits}`;
  const search = `?text=${encodeURIComponent(preset)}`;
  return resolveWithAnchor(pathname, search) ?? resolveWithURL(pathname, search);
};


