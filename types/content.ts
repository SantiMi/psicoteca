export type CategorySlug = "psicopatologia" | "psicoterapia" | "evaluacion" | "psicofarmacologia" | "desarrollo" | "teoria";
export type Section = { heading: string; text: string; bullets?: string[] };
export type Reference = { title: string; author: string; year?: string; url?: string };
export type Concept = {
  slug: string;
  title: string;
  category: CategorySlug;
  tags: string[];
  synonyms: string[];
  featured?: boolean;
  summary: string;
  essentials: Section[];
  deeper: Section[];
  references: Reference[];
  related: string[];
  reviewNotice?: string;
};
export type Category = { slug: CategorySlug; title: string; description: string; tint: string };
