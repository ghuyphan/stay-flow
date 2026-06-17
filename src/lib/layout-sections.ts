export const layoutSectionIds = [
  "hero",
  "search",
  "rooms",
  "trust",
  "gallery",
  "amenities",
  "faq",
] as const;

export type LayoutSectionId = (typeof layoutSectionIds)[number];

export type LayoutSectionDefinition = {
  id: LayoutSectionId;
  name: string;
  description: string;
  defaultEnabled: boolean;
};

export const layoutSectionDefinitions: LayoutSectionDefinition[] = [
  {
    id: "hero",
    name: "Hero",
    description: "Large opening image, headline, and primary pitch.",
    defaultEnabled: true,
  },
  {
    id: "search",
    name: "Search bar",
    description: "Location and date search directly under the hero.",
    defaultEnabled: true,
  },
  {
    id: "rooms",
    name: "Featured rooms",
    description: "Public cards for available short-stay properties.",
    defaultEnabled: true,
  },
  {
    id: "trust",
    name: "Trust points",
    description: "Short proof points for self check-in, food delivery, and privacy.",
    defaultEnabled: true,
  },
  {
    id: "gallery",
    name: "Gallery",
    description: "Compact visual strip using property images.",
    defaultEnabled: false,
  },
  {
    id: "amenities",
    name: "Amenities",
    description: "Gen Z-friendly extras such as consoles, delivery, and staffless arrival.",
    defaultEnabled: false,
  },
  {
    id: "faq",
    name: "FAQ",
    description: "Simple guest expectations and arrival notes.",
    defaultEnabled: false,
  },
];

export function getLayoutSectionDefinition(id: string) {
  return layoutSectionDefinitions.find((section) => section.id === id);
}
