import { CONTACT_INFO } from "../config/contact";

export default function WhatsAppWidget() {
  return (
    <a href={`https://wa.me/${CONTACT_INFO.whatsappDigits}`} target="_blank" className="whatsapp-widget bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.587-1.528l-6.191 1.686zM8.118 18.332c1.462.877 3.139 1.363 4.872 1.364 5.418 0 9.801-4.383 9.802-9.802-.001-5.419-4.384-9.802-9.802-9.802-5.418 0-9.801 4.383-9.802 9.802-.001 1.802.49 3.531 1.438 5.093l-1.018 3.725 3.809-1.021z" /></svg>
    </a>
  );
}


