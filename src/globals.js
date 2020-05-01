export const EVENT_ADD_FIAT_TRANSACTION = "addFiatTransaction";
export const EVENT_ASSETS_UPDATED = "updatedAssets";
export const EVENT_ADD_ASSET = "addAsset";
export const EVENT_UPDATED_FIAT_TRANSACTIONS = "fiatTransactionsUpdated";
export const EVENT_REMOVE_ASSET_BY_INDEX = "removeAssetByIndex";
export const EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX =
  "removeFiatTransactionByIndex";

export const TYPE_DEPOSIT = "Deposit";
export const TYPE_WITHDRAW = "Withdraw";

export const CATEGORY_CRYPTO = "crypto";
export const CATEGORY_RESOURCE = "resource";
export const CATEGORY_STOCK = "stock";

export const numberToLocal = (numberOrString) =>
  Number(numberOrString).toLocaleString("en-CH");

export const createColumn = (label, value) => {
  const column = document.createElement("li");
  column.innerHTML = `<label for="${label.toLowerCase()}_input">${label}:</label><input id="${label.toLowerCase()}_input" value="${value}" disabled>`;
  return column;
};
