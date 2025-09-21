export const CONTACT_INFO = {
  // E.164 format for tel: links
  phoneE164: "+447123456789",
  // Digits only for WhatsApp wa.me links
  whatsappDigits: "447123456789",
  email: "pat@patofalltrades.co.uk",
} as const;

export const WHATSAPP_PRESET = "Hi Pat, ";

export const whatsappHref = (preset: string = WHATSAPP_PRESET): string =>
  `https://wa.me/${CONTACT_INFO.whatsappDigits}?text=${encodeURIComponent(preset)}`;


