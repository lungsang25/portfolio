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
  clientName: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "tibet417",
    quote:
      "The team took our idea and shipped a site that actually felt finished — fast, clean, and exactly on brief.",
    name: "Jane Placeholder",
    role: "Placeholder Title, Tibet417",
    avatarInitials: "JP",
    clientName: "Tibet417",
  },
  {
    id: "kunphen",
    quote:
      "Clear communication from day one and a build that made our clinic look as trustworthy online as it is in person.",
    name: "Alex Sample",
    role: "Placeholder Title, Kunphen Medical Center",
    avatarInitials: "AS",
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
