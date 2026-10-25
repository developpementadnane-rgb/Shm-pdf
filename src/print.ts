// Impression -> PDF via le moteur natif du navigateur (Ctrl/Cmd+P -> "Enregistrer
// en PDF"). Choix délibéré : contrairement à html2canvas+jsPDF (texte rasterisé,
// flou, non sélectionnable, et dépendant d'un CDN), le texte reste net et
// sélectionnable, et aucune librairie externe n'est nécessaire.

import { renderDocument } from "./render";
import type { Document } from "./types";

let printFrame: HTMLIFrameElement | null = null;

export function printDocument(doc: Document, sheetCss: string): void {
  if (printFrame) printFrame.remove();
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "-10000px";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  printFrame = frame;

  const win = frame.contentWindow;
  if (!win) return;
  const docu = win.document;
  docu.open();
  docu.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
    <title>${doc.name.replace(/[<>&]/g, "")}</title>
    <style>${sheetCss}</style>
  </head><body>${renderDocument(doc)}</body></html>`);
  docu.close();

  frame.onload = () => {
    win.focus();
    win.print();
    // Laisser le temps à la boîte de dialogue d'impression de s'ouvrir avant de nettoyer.
    setTimeout(() => {
      frame.remove();
      if (printFrame === frame) printFrame = null;
    }, 1000);
  };
}
