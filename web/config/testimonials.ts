export interface Testimonial {
  name: string;
  area: string;
  rating: number; // from 1 to 5
  service: string;
  text: string;
  date?: string;
  verified?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    area: "Kensington",
    rating: 5,
    text:
      "Absolutely outstanding service. Pat was punctual, professional, and the quality of his work was second to none. He transformed our flat. Highly recommended!",
    service: "Kitchen Renovation",
    verified: true,
  },
  {
    name: "Michael Chen",
    area: "Camden",
    rating: 5,
    text:
      "Brilliant work on our bathroom renovation. Pat's attention to detail is exceptional and he completed everything on time and within budget.",
    service: "Bathroom Refit",
    verified: true,
  },
  {
    name: "Emma Williams",
    area: "Shoreditch",
    rating: 5,
    text:
      "Professional, reliable, and reasonably priced. Pat fixed our electrical issues quickly and safely. Will definitely use again for future projects.",
    service: "Electrical Repairs",
  },
  {
    name: "James Thompson",
    area: "Chelsea",
    rating: 5,
    text:
      "Exceptional craftsmanship! Pat painted our entire house and the finish is flawless. Clean, professional, and great value for money.",
    service: "Full House Painting",
  },
];


