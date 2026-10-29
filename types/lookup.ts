export type LookupItem = {id: string; title: string; summary: string; href: string};
export type LookupResult = {
  kind: "answer" | "comparison" | "choices" | "empty";
  query: string;
  heading: string;
  answer?: {title: string; summary: string; points: string[]; href: string; links: {label: string; href: string}[]; sources: {label: string; url: string}[]};
  comparison?: {shared: string[]; columns: {title: string; points: string[]}[]; href: string; documented: boolean; sources: {label: string; url: string}[]};
  items: LookupItem[];
};
