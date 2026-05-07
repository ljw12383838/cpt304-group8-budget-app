import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createChart } from "../src/chart.js";
import { applyTranslations, getTranslator, translations } from "../src/i18n.js";
import { calculateSummary, calculateTotal, createEntry, ENTRY_TYPES, formatMoney } from "../src/model.js";
import {
  clearStoredEntries,
  getStoredConsentChoice,
  hasStorageConsent,
  loadEntries,
  loadLanguage,
  saveEntries,
  saveLanguage,
  setStorageConsent,
  STORAGE_KEYS,
} from "../src/storage.js";
import { validateEntryInput } from "../src/validation.js";

const MAX_TITLE_LENGTH = 40;
const MAX_AMOUNT = 1_000_000;

const validationMessages = {
  titleRequired: "title required",
  titleTooLong: (limit) => `too long ${limit}`,
  amountInvalid: "invalid amount",
  amountPositive: "positive only",
  amountTooLarge: (limit) => `too large ${limit}`,
  amountTwoDecimals: "two decimals only",
};

function mockCanvasContext() {
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "",
  };

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  return ctx;
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("budget model", () => {
  it("calculates income, expenses and signed balance", () => {
    const entries = [
      { type: ENTRY_TYPES.INCOME, amount: 1200 },
      { type: ENTRY_TYPES.EXPENSE, amount: 250.5 },
      { type: ENTRY_TYPES.EXPENSE, amount: 49.5 },
    ];

    expect(calculateTotal(ENTRY_TYPES.INCOME, entries)).toBe(1200);
    expect(calculateTotal(ENTRY_TYPES.EXPENSE, entries)).toBe(300);
    expect(calculateSummary(entries)).toEqual({
      income: 1200,
      expense: 300,
      balance: 900,
    });
  });

  it("handles empty and malformed numeric entries safely", () => {
    expect(calculateTotal(ENTRY_TYPES.INCOME)).toBe(0);

    expect(
        calculateSummary([{ type: ENTRY_TYPES.INCOME, amount: undefined }])
    ).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
    });
  });

  it("creates normalised entries and formats money safely", () => {
    const entry = createEntry(ENTRY_TYPES.INCOME, "  Salary  ", "100.567");

    expect(entry.title).toBe("Salary");
    expect(entry.amount).toBe(100.57);
    expect(entry.type).toBe(ENTRY_TYPES.INCOME);
    expect(entry.id).toBeTruthy();
    expect(new Date(entry.createdAt).toString()).not.toBe("Invalid Date");

    expect(formatMoney(-12.5)).toBe("12.50");
    expect(formatMoney(undefined)).toBe("0.00");
    expect(formatMoney("4.2")).toBe("4.20");
  });

  it("falls back to timestamp-based IDs when randomUUID is unavailable", () => {
    const originalCrypto = globalThis.crypto;

    vi.stubGlobal("crypto", {});
    const entry = createEntry(ENTRY_TYPES.EXPENSE, "Food", 10);

    expect(entry.id).toContain("-");

    vi.stubGlobal("crypto", originalCrypto);
  });
});

describe("validateEntryInput", () => {
  it("accepts clean valid input and normalises it", () => {
    const result = validateEntryInput(" Rent ", "123.40", validationMessages);

    expect(result).toEqual({
      valid: true,
      value: {
        title: "Rent",
        amount: 123.4,
      },
    });
  });

  it("accepts one-decimal and integer amounts", () => {
    expect(validateEntryInput("Coffee", "4.5", validationMessages)).toMatchObject({
      valid: true,
      value: {
        amount: 4.5,
      },
    });

    expect(validateEntryInput("Book", "10", validationMessages)).toMatchObject({
      valid: true,
      value: {
        amount: 10,
      },
    });
  });

  it("rejects invalid titles and amounts", () => {
    const longTitle = "a".repeat(MAX_TITLE_LENGTH + 1);

    expect(validateEntryInput(" ", "12", validationMessages).message).toBe(
        "title required"
    );

    expect(validateEntryInput(null, "12", validationMessages).message).toBe(
        "title required"
    );

    expect(validateEntryInput(longTitle, "12", validationMessages).message).toBe(
        `too long ${MAX_TITLE_LENGTH}`
    );

    expect(validateEntryInput("Food", "abc", validationMessages).message).toBe(
        "invalid amount"
    );

    expect(validateEntryInput("Food", "Infinity", validationMessages).message).toBe(
        "invalid amount"
    );

    expect(validateEntryInput("Food", "-1", validationMessages).message).toBe(
        "positive only"
    );

    expect(validateEntryInput("Food", "0", validationMessages).message).toBe(
        "positive only"
    );

    expect(
        validateEntryInput("Food", String(MAX_AMOUNT + 1), validationMessages).message
    ).toBe(`too large ${MAX_AMOUNT}`);

    expect(validateEntryInput("Food", "1.999", validationMessages).message).toBe(
        "two decimals only"
    );
  });

  it("uses default validation messages if no translation object is supplied", () => {
    expect(validateEntryInput("", "12").message).toBe("Please enter a title.");

    expect(validateEntryInput("a".repeat(MAX_TITLE_LENGTH + 1), "12").message).toBe(
        "Title must be 40 characters or fewer."
    );

    expect(validateEntryInput("Food", String(MAX_AMOUNT + 1)).message).toBe(
        "Amount must not exceed 1000000."
    );

    expect(validateEntryInput("Food", "1.999").message).toBe(
        "Amount can have at most two decimal places."
    );
  });
});

describe("localStorage privacy gate", () => {
  it("does not load or save entries before consent", () => {
    expect(hasStorageConsent()).toBe(false);
    expect(saveEntries([{ title: "Salary" }])).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.entries)).toBeNull();
    expect(loadEntries()).toEqual([]);
  });

  it("saves, loads and clears entries after consent", () => {
    setStorageConsent(true);

    expect(getStoredConsentChoice()).toBe("accepted");
    expect(saveEntries([{ type: "income", title: "Salary", amount: 100 }])).toBe(
        true
    );

    expect(loadEntries()).toEqual([
      {
        type: "income",
        title: "Salary",
        amount: 100,
      },
    ]);

    clearStoredEntries();

    expect(loadEntries()).toEqual([]);
  });

  it("returns an empty array for missing, invalid, or non-array stored entries", () => {
    setStorageConsent(true);

    expect(loadEntries()).toEqual([]);

    localStorage.setItem(STORAGE_KEYS.entries, "not-json");
    expect(loadEntries()).toEqual([]);

    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify({ title: "bad" }));
    expect(loadEntries()).toEqual([]);
  });

  it("stores language preference separately", () => {
    expect(loadLanguage()).toBe("en");
    expect(loadLanguage("zh")).toBe("zh");

    saveLanguage("zh");

    expect(loadLanguage()).toBe("zh");
  });

  it("fails safely when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("localStorage blocked");
    });

    expect(hasStorageConsent()).toBe(false);
    expect(getStoredConsentChoice()).toBeNull();
    expect(loadEntries()).toEqual([]);
    expect(saveEntries([{ type: "income", title: "Salary", amount: 100 }])).toBe(
        false
    );

    expect(() => setStorageConsent(true)).not.toThrow();
    expect(() => clearStoredEntries()).not.toThrow();

    expect(loadLanguage("zh")).toBe("zh");
    expect(() => saveLanguage("zh")).not.toThrow();
  });
});

describe("i18n", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="language-toggle"></button>
      <h2 data-i18n="dashboard"></h2>
      <input data-i18n-placeholder="titlePlaceholder" />
      <span data-i18n="missingKey"></span>
    `;
  });

  it("returns translations, fallbacks and dynamic messages", () => {
    expect(getTranslator("en")("dashboard")).toBe("Dashboard");
    expect(getTranslator("zh")("dashboard")).toBe("仪表盘");
    expect(getTranslator("fr")("income")).toBe("Income");
    expect(getTranslator("en")("unknown.key")).toBe("unknown.key");

    expect(getTranslator("zh")("titleTooLong", 40)).toBe(
        "标题不能超过 40 个字符。"
    );

    expect(getTranslator("en")("titleTooLong", 40)).toBe(
        "Title must be 40 characters or fewer."
    );

    expect(getTranslator("en")("amountTooLarge", 100)).toBe(
        "Amount must not exceed 100."
    );

    expect(getTranslator("zh")("amountTooLarge", 1000000)).toBe(
        "金额不能超过 1000000。"
    );

    expect(getTranslator("zh")("amountTwoDecimals")).toBe(
        "金额最多只能保留两位小数。"
    );
  });

  it("applies translated text, placeholders, document title and language metadata", () => {
    applyTranslations("zh");

    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.title).toBe(translations.zh.documentTitle);
    expect(document.querySelector("[data-i18n='dashboard']").textContent).toBe(
        "仪表盘"
    );
    expect(document.querySelector("input").getAttribute("placeholder")).toBe(
        "例如：工资"
    );
    expect(document.querySelector("#language-toggle").textContent).toBe("EN");
    expect(document.querySelector("#language-toggle").getAttribute("aria-label")).toBe(
        "Switch to English"
    );
  });

  it("applies English metadata and works without a language toggle", () => {
    document.querySelector("#language-toggle").remove();

    applyTranslations("en");

    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe(translations.en.documentTitle);
    expect(document.querySelector("[data-i18n='dashboard']").textContent).toBe(
        "Dashboard"
    );
  });
});

describe("chart rendering", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="chart"></div>';
  });

  it("creates a canvas and draws the empty-state chart", () => {
    const ctx = mockCanvasContext();
    const container = document.querySelector(".chart");
    const updateChart = createChart(container);

    updateChart(0, 0);

    expect(container.querySelector("canvas")).toBeTruthy();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 64, 64);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });

  it("draws the expense segment when totals are positive", () => {
    const ctx = mockCanvasContext();
    const updateChart = createChart(document.querySelector(".chart"));

    updateChart(75, 25);

    expect(ctx.arc).toHaveBeenCalledTimes(3);
    expect(ctx.stroke).toHaveBeenCalledTimes(3);
  });
});