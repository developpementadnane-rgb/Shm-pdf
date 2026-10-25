import { SHEET_CSS as sheetCss } from "./sheet-css";
import { checkLogin } from "./auth";
import { buildCustomPageEditor, makeCustomDocument } from "./custom";
import { printDocument } from "./print";
import {
  buildHierarchyDoc, buildProposalsDoc, buildTechnicalDoc,
  emptyHierarchy, emptyProposals, emptyTechnical,
} from "./templates";
import type { HierarchyForm, ProposalsForm, TechnicalForm } from "./templates";
import { TEMPLATES, type Document as ShmDocument, type PageContent, type TemplateId } from "./types";
import { clear, el, field, textArea, textInput } from "./ui";

const app = document.querySelector<HTMLDivElement>("#app")!;

// ---------------------------------------------------------------- écran de connexion

function renderLogin(): void {
  clear(app);
  const pinInput = el("input", {
    class: "ctl ctl-pin",
    attrs: { type: "text", inputmode: "numeric", autocomplete: "off", placeholder: "••••••••••••••••", maxlength: "32" },
  });
  const passInput = el("input", { class: "ctl", attrs: { type: "password", placeholder: "كلمة السر", autocomplete: "off" } });
  const error = el("p", { class: "error" });

  const form = el("form", { class: "login-card" }, [
    el("p", { class: "login-eyebrow", text: "فوج عمر الفاروق — نظام التقارير" }),
    el("h1", { text: "تسجيل الدخول" }),
    field("الرمز السري (PIN)", pinInput),
    field("كلمة السر", passInput),
    error,
    el("button", { class: "btn-primary", text: "دخول", attrs: { type: "submit" } }),
  ]);

  form.onsubmit = async (e) => {
    e.preventDefault();
    error.textContent = "";
    const ok = await checkLogin(pinInput.value, passInput.value);
    if (ok) {
      sessionStorage.setItem("shm_session", "1");
      renderHome();
    } else {
      error.textContent = "الرمز السري أو كلمة السر غير صحيحة.";
    }
  };

  app.append(el("div", { class: "login-screen" }, [form]));
}

// ---------------------------------------------------------------- accueil : 4 fiches façon classeur

function renderHome(): void {
  clear(app);

  const topbar = el("div", { class: "topbar" }, [
    el("span", { class: "topbar-user", text: "فوج عمر الفاروق" }),
    (() => {
      const b = el("button", { class: "btn-ghost small", text: "قفل الجلسة", attrs: { type: "button" } });
      b.onclick = () => { sessionStorage.removeItem("shm_session"); renderLogin(); };
      return b;
    })(),
  ]);

  const tabs = el("div", { class: "tabset" },
    TEMPLATES.map((t) => {
      const card = el("button", { class: "tab-card", attrs: { type: "button" } }, [
        el("span", { class: "tab-label", text: t.label }),
        el("span", { class: "tab-desc", text: t.description }),
      ]);
      card.onclick = () => renderForm(t.id);
      return card;
    })
  );

  app.append(
    el("div", { class: "home-screen" }, [
      topbar,
      el("h1", { class: "home-title", text: "اختر نوع المستند" }),
      tabs,
    ])
  );
}

// ---------------------------------------------------------------- écran générique de formulaire

function formShell(title: string, backTo: () => void): { body: HTMLElement; actions: HTMLElement } {
  clear(app);
  const back = el("button", { class: "btn-ghost small", text: "⟵ رجوع", attrs: { type: "button" } });
  back.onclick = backTo;
  const body = el("div", { class: "form-body" });
  const actions = el("div", { class: "form-actions" });
  app.append(
    el("div", { class: "form-screen" }, [
      el("div", { class: "form-header" }, [back, el("h1", { text: title })]),
      body,
      actions,
    ])
  );
  return { body, actions };
}

function generateButton(onClick: () => void): HTMLButtonElement {
  const b = el("button", { class: "btn-primary", text: "إنشاء PDF", attrs: { type: "button" } });
  b.onclick = onClick;
  return b;
}

// ---------------------------------------------------------------- 1) هيكلة دورية

function renderHierarchyForm(): void {
  const f: HierarchyForm = emptyHierarchy();
  const { body, actions } = formShell("هيكلة دورية", renderHome);

  const patrolInput = textInput();
  const cryInput = textInput();
  const countInput = textInput();
  patrolInput.oninput = () => (f.patrolName = patrolInput.value);
  cryInput.oninput = () => (f.cry = cryInput.value);
  countInput.oninput = () => (f.memberCount = countInput.value);

  const roleInputs = f.roles.map((r) => {
    const i = textInput();
    i.oninput = () => (r.name = i.value);
    return field(r.role, i);
  });

  body.append(
    el("div", { class: "fieldset" }, [
      el("h2", { text: "معلومات الدورية" }),
      field("اسم الدورية", patrolInput),
      field("عدد الأفراد", countInput),
      field("الصيحة", cryInput),
    ]),
    el("div", { class: "fieldset" }, [el("h2", { text: "هيكلة الأفراد" }), ...roleInputs])
  );

  actions.append(generateButton(() => printDocument(buildHierarchyDoc(f), sheetCss)));
}

// ---------------------------------------------------------------- 2) بطاقة تقنية

function renderTechnicalForm(): void {
  const f: TechnicalForm = emptyTechnical();
  const { body, actions } = formShell("بطاقة تقنية", renderHome);

  const bind = (input: HTMLInputElement | HTMLTextAreaElement, key: keyof TechnicalForm) => {
    input.oninput = () => { (f[key] as string) = input.value; };
  };

  const patrolInput = textInput(); bind(patrolInput, "patrolName");
  const leaderInput = textInput(); bind(leaderInput, "leaderName");
  const authorInput = textInput(); bind(authorInput, "authorName");
  const activityInput = textInput(); bind(activityInput, "activity");
  const goalInput = textArea("", 2); bind(goalInput, "goal");
  const sloganInput = textInput(); bind(sloganInput, "slogan");
  const dateInput = textInput("", ); bind(dateInput, "date");
  const placeInput = textInput(); bind(placeInput, "place");
  const orgCatInput = textInput(); bind(orgCatInput, "organizingCategory");
  const mediaInput = textInput(); bind(mediaInput, "mediaContact");
  const audienceInput = textArea("", 2); bind(audienceInput, "targetAudience");
  const participantsInput = textInput(); bind(participantsInput, "participantCount");
  const needsInput = textArea("", 2); bind(needsInput, "needs");

  const programList = el("div", { class: "grid-editor" });
  function renderProgram(): void {
    programList.replaceChildren();
    f.programRows.forEach((row, idx) => {
      const timeI = textInput(row.time, "التوقيت");
      timeI.oninput = () => (row.time = timeI.value);
      const itemI = textInput(row.item, "الفقرة");
      itemI.oninput = () => (row.item = itemI.value);
      const del = el("button", { class: "btn-ghost small", text: "حذف", attrs: { type: "button" } });
      del.onclick = () => { f.programRows.splice(idx, 1); renderProgram(); };
      programList.append(el("div", { class: "grid-row" }, [timeI, itemI, del]));
    });
    const add = el("button", { class: "btn-ghost small", text: "+ إضافة فقرة", attrs: { type: "button" } });
    add.onclick = () => { f.programRows.push({ time: "", item: "" }); renderProgram(); };
    programList.append(add);
  }
  renderProgram();

  body.append(
    el("div", { class: "fieldset" }, [
      el("h2", { text: "تقديم الدورية" }),
      field("اسم الدورية", patrolInput),
      field("رائد الدورية", leaderInput),
      field("معدّ البطاقة التقنية", authorInput),
    ]),
    el("div", { class: "fieldset" }, [
      el("h2", { text: "معلومات النشاط" }),
      field("النشاط", activityInput),
      field("الهدف من النشاط", goalInput),
      field("شعار النشاط", sloganInput),
      field("التاريخ", dateInput),
      field("المكان", placeInput),
      field("الفئة المنظمة", orgCatInput),
      field("المكلف بالإعلام", mediaInput),
      field("الفئة المستهدفة", audienceInput),
      field("عدد المشاركين", participantsInput),
      field("الحاجيات", needsInput),
    ]),
    el("div", { class: "fieldset" }, [
      el("h2", { text: "برنامج النشاط (اختياري — صفحة ثانية)" }),
      programList,
    ])
  );

  actions.append(generateButton(() => printDocument(buildTechnicalDoc(f), sheetCss)));
}

// ---------------------------------------------------------------- 3) مقترحات مرحلة

function renderProposalsForm(): void {
  const f: ProposalsForm = emptyProposals();
  const { body, actions } = formShell("مقترحات مرحلة", renderHome);

  const patrolInput = textInput(); patrolInput.oninput = () => (f.patrolName = patrolInput.value);
  const authorInput = textInput(); authorInput.oninput = () => (f.authorName = authorInput.value);
  const introInput = textArea("", 3); introInput.oninput = () => (f.intro = introInput.value);

  const rowsList = el("div", { class: "grid-editor" });
  function renderRows(): void {
    rowsList.replaceChildren();
    f.rows.forEach((row, idx) => {
      const dateI = textInput(row.date, "التاريخ");
      dateI.oninput = () => (row.date = dateI.value);
      const sessionI = textInput(row.session, "الحصة");
      sessionI.oninput = () => (row.session = sessionI.value);
      const del = el("button", { class: "btn-ghost small", text: "حذف", attrs: { type: "button" } });
      del.onclick = () => { f.rows.splice(idx, 1); renderRows(); };
      rowsList.append(el("div", { class: "grid-row" }, [dateI, sessionI, del]));
    });
    const add = el("button", { class: "btn-ghost small", text: "+ إضافة حصة", attrs: { type: "button" } });
    add.onclick = () => { f.rows.push({ date: "", session: "" }); renderRows(); };
    rowsList.append(add);
  }
  renderRows();

  body.append(
    el("div", { class: "fieldset" }, [
      el("h2", { text: "معلومات عامة" }),
      field("اسم الدورية", patrolInput),
      field("إعداد", authorInput),
      field("مقدمة", introInput),
    ]),
    el("div", { class: "fieldset" }, [el("h2", { text: "البرنامج المقترح" }), rowsList])
  );

  actions.append(generateButton(() => printDocument(buildProposalsDoc(f), sheetCss)));
}

// ---------------------------------------------------------------- 4) نموذج حر

function renderCustomForm(): void {
  const { body, actions } = formShell("نموذج حر", renderHome);
  const nameInput = textInput("", "اسم المستند");
  const pages: { getBlocks: () => PageContent }[] = [];
  const pagesHost = el("div", { class: "custom-pages" });

  function addPage(): void {
    const n = pages.length + 1;
    const editor = buildCustomPageEditor(() => {});
    pages.push(editor);
    pagesHost.append(el("div", { class: "custom-page-wrap" }, [el("h2", { text: `صفحة ${n}` }), editor.node]));
  }
  addPage();

  const addPageBtn = el("button", { class: "btn-ghost", text: "+ صفحة جديدة", attrs: { type: "button" } });
  addPageBtn.onclick = () => { addPage(); };

  body.append(el("div", { class: "fieldset" }, [field("اسم المستند", nameInput)]), pagesHost, addPageBtn);

  actions.append(
    generateButton(() => {
      const doc: ShmDocument = makeCustomDocument(nameInput.value, pages.map((p) => p.getBlocks()));
      printDocument(doc, sheetCss);
    })
  );
}

function renderForm(id: TemplateId): void {
  if (id === "hierarchy") return renderHierarchyForm();
  if (id === "technical") return renderTechnicalForm();
  if (id === "proposals") return renderProposalsForm();
  return renderCustomForm();
}

// ---------------------------------------------------------------- démarrage

if (sessionStorage.getItem("shm_session")) renderHome();
else renderLogin();
