// Modèle libre : l'utilisateur compose sa propre page (titres, textes,
// tableaux) puis peut ajouter d'autres pages avant de générer le PDF.

import type { Block, Document, PageContent } from "./types";
import { el, field, textArea, textInput } from "./ui";

interface EditableTable {
  title: string;
  columns: string[];
  rows: string[][];
}

type EditableBlock =
  | { kind: "title"; text: string; level: 1 | 2 }
  | { kind: "text"; text: string }
  | { kind: "table"; data: EditableTable };

function newTable(): EditableTable {
  return { title: "", columns: ["", ""], rows: [["", ""]] };
}

function tableToBlock(t: EditableTable): Block {
  return { kind: "table", title: t.title || undefined, columns: t.columns, rows: t.rows };
}

/** Construit l'éditeur d'une page personnalisée ; retourne son élément DOM et un accesseur vers le contenu courant. */
export function buildCustomPageEditor(onChange: () => void): { node: HTMLElement; getBlocks: () => PageContent } {
  const blocks: EditableBlock[] = [];
  const list = el("div", { class: "custom-blocks" });

  function renderList(): void {
    list.replaceChildren();
    blocks.forEach((b, idx) => list.append(renderBlockEditor(b, idx)));
  }

  function renderBlockEditor(b: EditableBlock, idx: number): HTMLElement {
    const removeBtn = el("button", { class: "btn-ghost small", text: "حذف العنصر", attrs: { type: "button" } });
    removeBtn.onclick = () => {
      blocks.splice(idx, 1);
      renderList();
      onChange();
    };

    if (b.kind === "title") {
      const input = textInput(b.text, "نص العنوان");
      input.oninput = () => { b.text = input.value; onChange(); };
      return el("div", { class: "block-card" }, [
        el("div", { class: "block-head" }, [el("span", { text: b.level === 1 ? "عنوان رئيسي" : "عنوان فرعي" }), removeBtn]),
        field("النص", input),
      ]);
    }
    if (b.kind === "text") {
      const area = textArea(b.text, 3);
      area.oninput = () => { b.text = area.value; onChange(); };
      return el("div", { class: "block-card" }, [
        el("div", { class: "block-head" }, [el("span", { text: "فقرة نصية" }), removeBtn]),
        field("النص", area),
      ]);
    }
    // tableau
    const t = b.data;
    const titleInput = textInput(t.title, "عنوان الجدول (اختياري)");
    titleInput.oninput = () => { t.title = titleInput.value; onChange(); };

    const grid = el("div", { class: "grid-editor" });
    function renderGrid(): void {
      grid.replaceChildren();
      // en-têtes de colonnes
      const headRow = el("div", { class: "grid-row grid-head" });
      t.columns.forEach((c, ci) => {
        const inp = textInput(c, `عمود ${ci + 1}`);
        inp.oninput = () => { t.columns[ci] = inp.value; onChange(); };
        headRow.append(inp);
      });
      const delCol = el("button", { class: "btn-ghost small", text: "− عمود", attrs: { type: "button" } });
      delCol.onclick = () => {
        if (t.columns.length <= 1) return;
        t.columns.pop();
        t.rows.forEach((r) => r.pop());
        renderGrid(); onChange();
      };
      const addCol = el("button", { class: "btn-ghost small", text: "+ عمود", attrs: { type: "button" } });
      addCol.onclick = () => {
        t.columns.push("");
        t.rows.forEach((r) => r.push(""));
        renderGrid(); onChange();
      };
      headRow.append(addCol, delCol);
      grid.append(headRow);

      t.rows.forEach((row, ri) => {
        const r = el("div", { class: "grid-row" });
        row.forEach((val, ci) => {
          const inp = textInput(val);
          inp.oninput = () => { t.rows[ri][ci] = inp.value; onChange(); };
          r.append(inp);
        });
        const delRow = el("button", { class: "btn-ghost small", text: "حذف السطر", attrs: { type: "button" } });
        delRow.onclick = () => { t.rows.splice(ri, 1); renderGrid(); onChange(); };
        r.append(delRow);
        grid.append(r);
      });

      const addRow = el("button", { class: "btn-ghost small", text: "+ سطر", attrs: { type: "button" } });
      addRow.onclick = () => { t.rows.push(t.columns.map(() => "")); renderGrid(); onChange(); };
      grid.append(addRow);
    }
    renderGrid();

    return el("div", { class: "block-card" }, [
      el("div", { class: "block-head" }, [el("span", { text: "جدول" }), removeBtn]),
      field("", titleInput),
      grid,
    ]);
  }

  const addTitle1 = el("button", { class: "btn-ghost", text: "+ عنوان رئيسي", attrs: { type: "button" } });
  addTitle1.onclick = () => { blocks.push({ kind: "title", text: "", level: 1 }); renderList(); onChange(); };
  const addTitle2 = el("button", { class: "btn-ghost", text: "+ عنوان فرعي", attrs: { type: "button" } });
  addTitle2.onclick = () => { blocks.push({ kind: "title", text: "", level: 2 }); renderList(); onChange(); };
  const addText = el("button", { class: "btn-ghost", text: "+ فقرة نصية", attrs: { type: "button" } });
  addText.onclick = () => { blocks.push({ kind: "text", text: "" }); renderList(); onChange(); };
  const addTable = el("button", { class: "btn-ghost", text: "+ جدول", attrs: { type: "button" } });
  addTable.onclick = () => { blocks.push({ kind: "table", data: newTable() }); renderList(); onChange(); };

  const toolbar = el("div", { class: "custom-toolbar" }, [addTitle1, addTitle2, addText, addTable]);
  const node = el("div", { class: "custom-page" }, [toolbar, list]);

  function getBlocks(): PageContent {
    return blocks.map((b): Block => {
      if (b.kind === "title") return { kind: "title", text: b.text, level: b.level, align: b.level === 1 ? "center" : "right" };
      if (b.kind === "text") return { kind: "text", text: b.text, align: "right" };
      return tableToBlock(b.data);
    });
  }

  return { node, getBlocks };
}

export function makeCustomDocument(name: string, pages: PageContent[]): Document {
  return { name: name || "تقرير", pages };
}
