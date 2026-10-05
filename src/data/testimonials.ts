// PLACEHOLDER CONTENT — pending real quotes/names/photos from clients.
// Names, roles, and quotes below are intentionally generic placeholders,
// not real people. Swap this array with real testimonial data when available;
// no component changes are needed elsewhere.

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarSrc?: string;
  clientName: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "tibet417",
    quote:
      "Communication was clear from the very first call, and updates came without us having to chase them. The team took our idea and shipped a site that felt finished — fast, clean, and exactly on brief.",
    name: "Ngawang Dorjee",
    role: "Founder, Tibet417",
    avatarInitials: "ND",
    avatarSrc: "/testimonials/ngawang-dorjee.jpg",
    clientName: "Tibet417",
  },
  {
    id: "kunphen",
    quote:
      "They took the time to understand how our hospital works and what patients need. The new site is easy to navigate, reflects the care we give in person, and arrived on schedule.",
    name: "Nyima Tsering",
    role: "Managing Director, Kunphen Hospital",
    avatarInitials: "NT",
    avatarSrc: "/testimonials/nyima-tsering.jpg",
    clientName: "Kunphen Medical Center",
  },
  {
    id: "webuddhist",
    quote:
      "Turnaround was faster than we expected without cutting any corners on quality or detail.",
    name: "Sam Example",
    role: "Placeholder Title, Webuddhist",
    avatarInitials: "SE",
    clientName: "Webuddhist",
  },
  {
    id: "letsgokings",
    quote:
      "Every round of feedback was handled quickly — it felt like working with an in-house team, not an agency.",
    name: "Riley Doe",
    role: "Placeholder Title, Let's Go Kings",
    avatarInitials: "RD",
    clientName: "Let's Go Kings",
  },
];
