export const translations = {
  en: {
    documentTitle: "Budget App | CPT304 Enhanced",
    eyebrow: "Personal Finance",
    summaryTitle: "Budget summary",
    balance: "Balance",
    income: "Income",
    expense: "Expenses",
    expensesTab: "Expenses",
    dashboard: "Dashboard",
    clearAll: "Clear all",
    all: "All",
    titleLabel: "Title",
    amountLabel: "Amount",
    titlePlaceholder: "e.g. Salary",
    amountPlaceholder: "0.00",
    addIncome: "Add income",
    addExpense: "Add expense",
    edit: "Edit",
    delete: "Delete",
    noEntries: "No entries yet.",
    entryAdded: "Entry added successfully.",
    entryDeleted: "Entry deleted.",
    entryReadyToEdit: "Entry moved back to the form for editing.",
    allDataCleared: "All stored entries were cleared.",
    clearConfirm: "Clear all budget entries?",
    cookieTitle: "Privacy notice",
    cookieText: "This app stores budget entries in your browser localStorage only after consent. No data is sent to a server.",
    accept: "Accept",
    decline: "Decline",
    privacyPolicy: "Privacy policy",
    privacyTitle: "Privacy Policy",
    privacyBody1: "This enhanced Budget App stores entries, language preference and consent status in browser localStorage. The data remains on the user's device.",
    privacyBody2: "Users can refuse storage, continue using the app in memory, or clear stored data at any time using the Clear all button.",
    close: "Close",
    titleRequired: "Please enter a title.",
    titleTooLong: (limit) => `Title must be ${limit} characters or fewer.`,
    amountInvalid: "Please enter a valid amount.",
    amountPositive: "Amount must be greater than 0.",
    amountTooLarge: (limit) => `Amount must not exceed ${limit}.`,
    amountTwoDecimals: "Amount can have at most two decimal places.",
  },
  zh: {
    documentTitle: "预算应用 | CPT304 增强版",
    eyebrow: "个人财务",
    summaryTitle: "预算概览",
    balance: "余额",
    income: "收入",
    expense: "支出",
    expensesTab: "支出",
    dashboard: "仪表盘",
    clearAll: "清空",
    all: "全部",
    titleLabel: "标题",
    amountLabel: "金额",
    titlePlaceholder: "例如：工资",
    amountPlaceholder: "0.00",
    addIncome: "添加收入",
    addExpense: "添加支出",
    edit: "编辑",
    delete: "删除",
    noEntries: "暂无记录。",
    entryAdded: "记录已添加。",
    entryDeleted: "记录已删除。",
    entryReadyToEdit: "记录已放回表单，可继续编辑。",
    allDataCleared: "所有本地记录已清空。",
    clearConfirm: "确定清空所有预算记录吗？",
    cookieTitle: "隐私提示",
    cookieText: "本应用仅在你同意后把预算记录保存在浏览器 localStorage 中，不会上传到服务器。",
    accept: "同意",
    decline: "拒绝",
    privacyPolicy: "隐私政策",
    privacyTitle: "隐私政策",
    privacyBody1: "增强版 Budget App 会把预算记录、语言偏好和存储同意状态保存在浏览器 localStorage 中，数据保留在用户设备上。",
    privacyBody2: "用户可以拒绝存储并以内存模式继续使用，也可以随时点击“清空”删除已保存数据。",
    close: "关闭",
    titleRequired: "请输入标题。",
    titleTooLong: (limit) => `标题不能超过 ${limit} 个字符。`,
    amountInvalid: "请输入有效金额。",
    amountPositive: "金额必须大于 0。",
    amountTooLarge: (limit) => `金额不能超过 ${limit}。`,
    amountTwoDecimals: "金额最多只能保留两位小数。",
  },
};

export function getTranslator(language = "en") {
  const dictionary = translations[language] || translations.en;
  return function translate(key, ...args) {
    const value = dictionary[key] ?? translations.en[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
  };
}

export function applyTranslations(language = "en", root = document) {
  const t = getTranslator(language);
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = t("documentTitle");

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  const languageToggle = root.querySelector("#language-toggle");
  if (languageToggle) {
    languageToggle.textContent = language === "en" ? "中文" : "EN";
    languageToggle.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "Switch to English");
  }
}
