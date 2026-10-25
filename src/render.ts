// Construit le HTML imprimable d'un document, avec l'en-tête et le pied de
// page fixes du fouj, exactement dans le style déjà utilisé pour les PDF SHM
// (bordeaux, bandeau beige, Tahoma). Une page = un <section class="sheet">.

import { LOGO_SHM, LOGO_FOUJ } from "./assets/logos";
import type { Block, Document } from "./types";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function todayFR(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

const HEADER = `
  <div class="bar"></div>
  <header class="head">
    <img src="${LOGO_SHM}" alt="شعار الكشفية الحسنية المغربية">
    <div class="txt">
      <p class="t0">بسم الله الرحمن الرحيم</p>
      <p class="t1">الكشفية الحسنية المغربية</p>
      <p class="t2">فرع آسفي &nbsp;•&nbsp; مجموعة الأمل &nbsp;•&nbsp; فوج عمر الفاروق</p>
    </div>
    <img src="${LOGO_FOUJ}" alt="شعار فوج عمر الفاروق">
  </header>
  <div class="bar"></div>`;

function footer(pageNo: number, pageCount: number): string {
  return `<footer class="foot">
    <span>${todayFR()}</span>
    <span>أُنشئ هذا المستند بواسطة نظام إدارة تقارير فوج عمر الفاروق</span>
    <span>${pageNo} / ${pageCount}</span>
  </footer>`;
}

function renderBlock(b: Block): string {
  switch (b.kind) {
    case "title": {
      const tag = b.level === 1 ? "h2" : "h3";
      return `<${tag} class="doc-title" style="text-align:${b.align}">${esc(b.text)}</${tag}>`;
    }
    case "text":
      return `<p class="doc-text" style="text-align:${b.align}">${esc(b.text)}</p>`;
    case "keyvalue":
      return `<div class="tbl"><table class="kv"><tbody>${b.rows
        .map((r) => `<tr><th>${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`)
        .join("")}</tbody></table></div>`;
    case "table":
      return `${b.title ? `<h3 class="tbl-title">${esc(b.title)}</h3>` : ""}<div class="tbl"><table class="grid"><thead><tr>${b.columns
        .map((c) => `<th>${esc(c)}</th>`)
        .join("")}</tr></thead><tbody>${b.rows
        .map((row) => `<tr>${row.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></div>`;
  }
}

/** Rend le document entier en un fragment HTML prêt à être inséré dans la zone d'impression. */
export function renderDocument(doc: Document): string {
  const n = doc.pages.length;
  return doc.pages
    .map(
      (page, i) => `<section class="sheet">
        ${HEADER}
        <div class="body">${page.map(renderBlock).join("")}</div>
        ${footer(i + 1, n)}
      </section>`
    )
    .join("");
}
