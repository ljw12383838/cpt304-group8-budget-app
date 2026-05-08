export const ENTRY_TYPES = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense",
});

export function calculateTotal(type, entries = []) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

export function calculateSummary(entries = []) {
  const income = calculateTotal(ENTRY_TYPES.INCOME, entries);
  const expense = calculateTotal(ENTRY_TYPES.EXPENSE, entries);
  return {
    income,
    expense,
    balance: income - expense,
  };
}

export function createEntry(type, title, amount) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    type,
    title: title.trim(),
    amount: Number(Number(amount).toFixed(2)),
    createdAt: new Date().toISOString(),
  };
}

export function formatMoney(value) {
  return Math.abs(Number(value || 0)).toFixed(2);
}
