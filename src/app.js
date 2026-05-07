import { createChart } from "./chart.js";
import { applyTranslations, getTranslator } from "./i18n.js";
import { calculateSummary, createEntry, ENTRY_TYPES, formatMoney } from "./model.js";
import {
  clearStoredEntries,
  getStoredConsentChoice,
  loadEntries,
  loadLanguage,
  saveEntries,
  saveLanguage,
  setStorageConsent,
} from "./storage.js";
import { validateEntryInput } from "./validation.js";

const state = {
  entries: loadEntries(),
  activePanel: "all",
  language: loadLanguage("en"),
};

const elements = {
  balanceValue: document.querySelector(".balance-value"),
  incomeTotal: document.querySelector(".income-total"),
  expenseTotal: document.querySelector(".expense-total"),
  allList: document.querySelector("#all-list"),
  incomeList: document.querySelector("#income-list"),
  expenseList: document.querySelector("#expense-list"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  panels: Array.from(document.querySelectorAll(".panel")),
  incomeForm: document.querySelector("#income-form"),
  expenseForm: document.querySelector("#expense-form"),
  status: document.querySelector("#status-message"),
  clearData: document.querySelector("#clear-data"),
  languageToggle: document.querySelector("#language-toggle"),
  cookieBanner: document.querySelector("#cookie-banner"),
  acceptStorage: document.querySelector("#accept-storage"),
  declineStorage: document.querySelector("#decline-storage"),
  openPrivacy: document.querySelector("#open-privacy"),
  privacyDialog: document.querySelector("#privacy-dialog"),
};

const updateChart = createChart(document.querySelector(".chart"));

function t(key, ...args) {
  return getTranslator(state.language)(key, ...args);
}

function setStatus(message, type = "error") {
  elements.status.textContent = message;
  elements.status.classList.toggle("success", type === "success");
}

function setActivePanel(panelName) {
  state.activePanel = panelName;
  elements.tabs.forEach((tab) => {
    const selected = tab.dataset.panel === panelName;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  elements.panels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `panel-${panelName}`);
  });
}

function renderMoney(element, value) {
  const sign = value < 0 ? "-$" : "$";
  element.innerHTML = `<small>${sign}</small>${formatMoney(value)}`;
}

function renderEntry(list, entry, index, allowEdit) {
  const item = document.createElement("li");
  item.className = `entry-item ${entry.type}-entry`;

  const text = document.createElement("div");
  text.className = "entry-text";

  const title = document.createElement("span");
  title.className = "entry-title";
  title.textContent = entry.title;

  const amount = document.createElement("span");
  amount.className = "entry-amount";
  amount.textContent = `${entry.type === ENTRY_TYPES.EXPENSE ? "-" : "+"}$${formatMoney(entry.amount)}`;

  text.append(title, amount);

  const actions = document.createElement("div");
  actions.className = "entry-actions";

  if (allowEdit) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-btn";
    editButton.dataset.action = "edit";
    editButton.dataset.index = String(index);
    editButton.setAttribute("aria-label", `${t("edit")} ${entry.title}`);
    editButton.textContent = "✎";
    actions.appendChild(editButton);
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "icon-btn delete";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.index = String(index);
  deleteButton.setAttribute("aria-label", `${t("delete")} ${entry.title}`);
  deleteButton.textContent = "×";
  actions.appendChild(deleteButton);

  item.append(text, actions);
  list.appendChild(item);
}

function renderList(list, entries, allowEdit = true) {
  list.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = t("noEntries");
    list.appendChild(empty);
    return;
  }

  entries.forEach(({ entry, index }) => renderEntry(list, entry, index, allowEdit));
}

function render() {
  applyTranslations(state.language);

  const summary = calculateSummary(state.entries);
  renderMoney(elements.balanceValue, summary.balance);
  renderMoney(elements.incomeTotal, summary.income);
  renderMoney(elements.expenseTotal, summary.expense);
  updateChart(summary.income, summary.expense);

  renderList(
    elements.allList,
    state.entries.map((entry, index) => ({ entry, index })),
    false,
  );
  renderList(
    elements.incomeList,
    state.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.type === ENTRY_TYPES.INCOME),
  );
  renderList(
    elements.expenseList,
    state.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.type === ENTRY_TYPES.EXPENSE),
  );

  setActivePanel(state.activePanel);
}

function persistAndRender() {
  saveEntries(state.entries);
  render();
}

function handleFormSubmit(type, form) {
  const formData = new FormData(form);
  const result = validateEntryInput(formData.get("title"), formData.get("amount"), {
    titleRequired: t("titleRequired"),
    titleTooLong: (limit) => t("titleTooLong", limit),
    amountInvalid: t("amountInvalid"),
    amountPositive: t("amountPositive"),
    amountTooLarge: (limit) => t("amountTooLarge", limit),
    amountTwoDecimals: t("amountTwoDecimals"),
  });

  if (!result.valid) {
    setStatus(result.message);
    return;
  }

  state.entries.push(createEntry(type, result.value.title, result.value.amount));
  form.reset();
  setStatus(t("entryAdded"), "success");
  persistAndRender();
}

function deleteEntry(index) {
  state.entries.splice(index, 1);
  setStatus(t("entryDeleted"), "success");
  persistAndRender();
}

function editEntry(index) {
  const entry = state.entries[index];
  const form = entry.type === ENTRY_TYPES.INCOME ? elements.incomeForm : elements.expenseForm;
  form.elements.title.value = entry.title;
  form.elements.amount.value = entry.amount;
  state.entries.splice(index, 1);
  setActivePanel(entry.type);
  setStatus(t("entryReadyToEdit"), "success");
  persistAndRender();
  form.elements.title.focus();
}

function handleListAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || !state.entries[index]) return;

  if (button.dataset.action === "delete") deleteEntry(index);
  if (button.dataset.action === "edit") editEntry(index);
}

function bindEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setActivePanel(tab.dataset.panel));
  });

  elements.incomeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleFormSubmit(ENTRY_TYPES.INCOME, elements.incomeForm);
  });

  elements.expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleFormSubmit(ENTRY_TYPES.EXPENSE, elements.expenseForm);
  });

  [elements.allList, elements.incomeList, elements.expenseList].forEach((list) => {
    list.addEventListener("click", handleListAction);
  });

  elements.clearData.addEventListener("click", () => {
    if (!window.confirm(t("clearConfirm"))) return;
    state.entries = [];
    clearStoredEntries();
    setStatus(t("allDataCleared"), "success");
    render();
  });

  elements.languageToggle.addEventListener("click", () => {
    state.language = state.language === "en" ? "zh" : "en";
    saveLanguage(state.language);
    render();
  });

  elements.acceptStorage.addEventListener("click", () => {
    setStorageConsent(true);
    saveEntries(state.entries);
    elements.cookieBanner.classList.add("hidden");
  });

  elements.declineStorage.addEventListener("click", () => {
    setStorageConsent(false);
    clearStoredEntries();
    elements.cookieBanner.classList.add("hidden");
  });

  elements.openPrivacy.addEventListener("click", () => {
    if (typeof elements.privacyDialog.showModal === "function") {
      elements.privacyDialog.showModal();
    }
  });
}

function initialiseCookieBanner() {
  if (getStoredConsentChoice() === null) {
    elements.cookieBanner.classList.remove("hidden");
  }
}

bindEvents();
render();
initialiseCookieBanner();
