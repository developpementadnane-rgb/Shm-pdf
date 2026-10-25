// Modèle de données commun aux 4 types de documents.

export type Align = "right" | "center" | "left";

export interface KeyValueRow {
  label: string;
  value: string;
}

export interface TableBlock {
  kind: "table";
  title?: string;
  columns: string[];
  rows: string[][];
}

export interface TitleBlock {
  kind: "title";
  text: string;
  level: 1 | 2;
  align: Align;
}

export interface TextBlock {
  kind: "text";
  text: string;
  align: Align;
}

export interface KeyValueBlock {
  kind: "keyvalue";
  rows: KeyValueRow[];
}

export type Block = TitleBlock | TextBlock | TableBlock | KeyValueBlock;

export type PageContent = Block[];

export interface Document {
  /** Nom du document, utilisé pour le nom de fichier au moment de l'impression. */
  name: string;
  pages: PageContent[];
}

// ---------------------------------------------------------------- modèles prédéfinis

export type TemplateId = "hierarchy" | "technical" | "proposals" | "custom";

export interface TemplateDef {
  id: TemplateId;
  label: string;
  description: string;
}

export const TEMPLATES: TemplateDef[] = [
  { id: "hierarchy", label: "هيكلة دورية", description: "تحديد أدوار أفراد الدورية" },
  { id: "technical", label: "بطاقة تقنية", description: "تفاصيل نشاط أو خرجة" },
  { id: "proposals", label: "مقترحات مرحلة", description: "برنامج الدورية للموسم" },
  { id: "custom", label: "نموذج حر", description: "عناوين ونصوص وجداول حسب الحاجة" },
];
