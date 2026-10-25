// Fabriques des 3 modèles prédéfinis -> structure Document (voir types.ts).
// Les champs sont restitués dans le même ordre et les mêmes libellés que les
// fiches déjà produites pour le fouj (dossier shm-fiches-patrouille).

import type { Document, PageContent } from "./types";

export interface HierarchyForm {
  patrolName: string;
  cry: string;
  memberCount: string;
  roles: { role: string; name: string }[];
}

export interface TechnicalForm {
  patrolName: string;
  leaderName: string;
  authorName: string;
  activity: string;
  goal: string;
  slogan: string;
  date: string;
  place: string;
  organizingCategory: string;
  mediaContact: string;
  targetAudience: string;
  participantCount: string;
  needs: string;
  programRows: { time: string; item: string }[];
}

export interface ProposalsForm {
  patrolName: string;
  authorName: string;
  intro: string;
  rows: { date: string; session: string }[];
}

export function emptyHierarchy(): HierarchyForm {
  return {
    patrolName: "",
    cry: "",
    memberCount: "",
    roles: [
      { role: "الرائد", name: "" },
      { role: "الكاتب", name: "" },
      { role: "مراقب الزي", name: "" },
      { role: "أمين المال", name: "" },
      { role: "المساعد", name: "" },
    ],
  };
}

export function emptyTechnical(): TechnicalForm {
  return {
    patrolName: "",
    leaderName: "",
    authorName: "",
    activity: "",
    goal: "",
    slogan: "",
    date: "",
    place: "",
    organizingCategory: "",
    mediaContact: "",
    targetAudience: "",
    participantCount: "",
    needs: "",
    programRows: [{ time: "", item: "" }],
  };
}

export function emptyProposals(): ProposalsForm {
  return {
    patrolName: "",
    authorName: "",
    intro: "",
    rows: [{ date: "", session: "" }],
  };
}

export function buildHierarchyDoc(f: HierarchyForm): Document {
  const page: PageContent = [
    { kind: "title", text: "هيكلة دورية", level: 1, align: "center" },
    { kind: "title", text: "معلومات الدورية", level: 2, align: "right" },
    {
      kind: "keyvalue",
      rows: [
        { label: "اسم الدورية", value: f.patrolName },
        { label: "عدد الأفراد", value: f.memberCount },
        { label: "الصيحة", value: f.cry },
      ],
    },
    { kind: "title", text: "هيكلة الأفراد", level: 2, align: "right" },
    { kind: "keyvalue", rows: f.roles.map((r) => ({ label: r.role, value: r.name })) },
  ];
  return { name: `هيكلة دورية ${f.patrolName}`.trim(), pages: [page] };
}

export function buildTechnicalDoc(f: TechnicalForm): Document {
  const page1: PageContent = [
    { kind: "title", text: "بطاقة تقنية", level: 1, align: "center" },
    { kind: "text", text: `من إعداد دورية ${f.patrolName}`.trim(), align: "center" },
    { kind: "title", text: "تقديم الدورية", level: 2, align: "right" },
    {
      kind: "keyvalue",
      rows: [
        { label: "اسم الدورية", value: f.patrolName },
        { label: "رائد الدورية", value: f.leaderName },
        { label: "معدّ البطاقة التقنية", value: f.authorName },
      ],
    },
    { kind: "title", text: "معلومات النشاط", level: 2, align: "right" },
    {
      kind: "keyvalue",
      rows: [
        { label: "النشاط", value: f.activity },
        { label: "الهدف من النشاط", value: f.goal },
        { label: "شعار النشاط", value: f.slogan },
        { label: "التاريخ", value: f.date },
        { label: "المكان", value: f.place },
        { label: "الفئة المنظمة", value: f.organizingCategory },
        { label: "المكلف بالإعلام", value: f.mediaContact },
        { label: "الفئة المستهدفة", value: f.targetAudience },
        { label: "عدد المشاركين", value: f.participantCount },
        { label: "الحاجيات", value: f.needs },
      ],
    },
  ];
  const page2: PageContent = [
    { kind: "title", text: "برنامج النشاط", level: 1, align: "center" },
    {
      kind: "table",
      columns: ["الوقت", "الفقرة"],
      rows: f.programRows.filter((r) => r.time || r.item).map((r) => [r.time, r.item]),
    },
  ];
  const pages = f.programRows.some((r) => r.time || r.item) ? [page1, page2] : [page1];
  return { name: `بطاقة تقنية ${f.patrolName}`.trim(), pages };
}

export function buildProposalsDoc(f: ProposalsForm): Document {
  const page: PageContent = [
    { kind: "title", text: "اقتراحات المرحلة القادمة", level: 1, align: "center" },
    { kind: "text", text: `من إعداد دورية ${f.patrolName} • ${f.authorName}`.trim(), align: "center" },
    { kind: "text", text: f.intro, align: "right" },
    {
      kind: "table",
      columns: ["التاريخ", "الحصة"],
      rows: f.rows.filter((r) => r.date || r.session).map((r) => [r.date, r.session]),
    },
  ];
  return { name: `اقتراحات ${f.patrolName}`.trim(), pages: [page] };
}
