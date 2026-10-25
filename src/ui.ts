// Petits utilitaires de construction du DOM, pour éviter toute dépendance
// externe (pas de framework) tout en gardant src/main.ts lisible.

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: { class?: string; text?: string; attrs?: Record<string, string> } = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  for (const c of children) node.append(c);
  return node;
}

export function field(label: string, input: HTMLElement): HTMLElement {
  return el("label", { class: "field" }, [el("span", { text: label }), input]);
}

export function textInput(value = "", placeholder = ""): HTMLInputElement {
  const i = el("input", { class: "ctl", attrs: { type: "text", placeholder } });
  i.value = value;
  return i;
}

export function textArea(value = "", rows = 3): HTMLTextAreaElement {
  const t = el("textarea", { class: "ctl", attrs: { rows: String(rows) } });
  t.value = value;
  return t;
}

export function clear(node: Element): void {
  node.replaceChildren();
}
