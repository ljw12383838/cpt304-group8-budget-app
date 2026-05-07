const MAX_TITLE_LENGTH = 40;
const MAX_AMOUNT = 1_000_000;

export function validateEntryInput(title, amount, t = defaultValidationMessages) {
  const cleanTitle = String(title ?? "").trim();
  const numericAmount = Number(amount);

  if (cleanTitle.length === 0) {
    return { valid: false, message: t.titleRequired };
  }

  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return { valid: false, message: t.titleTooLong(MAX_TITLE_LENGTH) };
  }

  if (!Number.isFinite(numericAmount)) {
    return { valid: false, message: t.amountInvalid };
  }

  if (numericAmount <= 0) {
    return { valid: false, message: t.amountPositive };
  }

  if (numericAmount > MAX_AMOUNT) {
    return { valid: false, message: t.amountTooLarge(MAX_AMOUNT) };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(String(amount).trim())) {
    return { valid: false, message: t.amountTwoDecimals };
  }

  return {
    valid: true,
    value: {
      title: cleanTitle,
      amount: Number(numericAmount.toFixed(2)),
    },
  };
}

const defaultValidationMessages = {
  titleRequired: "Please enter a title.",
  titleTooLong: (limit) => `Title must be ${limit} characters or fewer.`,
  amountInvalid: "Please enter a valid amount.",
  amountPositive: "Amount must be greater than 0.",
  amountTooLarge: (limit) => `Amount must not exceed ${limit}.`,
  amountTwoDecimals: "Amount can have at most two decimal places.",
};