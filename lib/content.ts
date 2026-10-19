import { categories } from "@/data/categories";
import { concepts } from "@/data/concepts";
import type { CategorySlug } from "@/types/content";

export function normalizeText(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}
export function searchConcepts(query: string, category?: CategorySlug) {
  const needle = normalizeText(query);
  return concepts.filter(concept => {
    if (category && concept.category !== category) return false;
    if (!needle) return true;
    const fields = [concept.title, ...concept.tags, ...concept.synonyms];
    return fields.some(field => normalizeText(field).includes(needle));
  });
}
export const getConcept = (slug: string) => concepts.find(concept => concept.slug === slug);
export const getCategory = (slug: string) => categories.find(category => category.slug === slug);
