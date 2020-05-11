import "./components/input.js";

export const EVENT_ADD_FIAT_TRANSACTION = "addFiatTransaction";
export const EVENT_ASSETS_UPDATED = "updatedAssets";
export const EVENT_ADD_ASSET = "addAsset";
export const EVENT_UPDATED_FIAT_TRANSACTIONS = "fiatTransactionsUpdated";
export const EVENT_REMOVE_ASSET_BY_INDEX = "removeAssetByIndex";
export const EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX =
  "removeFiatTransactionByIndex";

export const TYPE_DEPOSIT = "Deposit";
export const TYPE_WITHDRAW = "Withdraw";

export const CATEGORY_CRYPTO = "Crypto";
export const CATEGORY_RESOURCE = "Resource";
export const CATEGORY_STOCK = "Stock";
export const CATEGORY_CURRENCY = "Currency";

export const numberToLocal = (numberOrString) =>
  Number(Number(numberOrString).toFixed(2)).toLocaleString("en-CH");

export const createColumn = (label, value) => {
  const column = document.createElement("li");
  column.innerHTML = `<hk-input id="${label.toLowerCase()}_input" value="${value}" disabled><label>${label}</label></hk-input>`;
  return column;
};

export const isValidIsoDateString = (dateString) => {
  return (
    typeof dateString &&
    dateString.length === 10 &&
    dateString.split("-").length === 3 &&
    !isNaN(dateString[0]) &&
    Number(dateString[0]) >= 1 &&
    Number(dateString[0]) < 3 &&
    !isNaN(dateString[1]) &&
    Number(dateString[1]) >= 0 &&
    Number(dateString[1]) <= 9 &&
    !isNaN(dateString[2]) &&
    Number(dateString[2]) >= 0 &&
    Number(dateString[2]) <= 9 &&
    !isNaN(dateString[3]) &&
    Number(dateString[3]) >= 0 &&
    Number(dateString[3]) <= 9 &&
    isNaN(dateString[4]) &&
    !isNaN(dateString[5]) &&
    Number(dateString[5]) >= 0 &&
    Number(dateString[5]) <= 1 &&
    !isNaN(dateString[6]) &&
    Number(dateString[6]) >= 0 &&
    Number(dateString[6]) <= 9 &&
    isNaN(dateString[7]) &&
    !isNaN(dateString[8]) &&
    Number(dateString[8]) >= 0 &&
    Number(dateString[8]) <= 3 &&
    !isNaN(dateString[9]) &&
    Number(dateString[9]) >= 0 &&
    Number(dateString[9]) <= 9 &&
    Number(dateString[5] + dateString[6]) > 0 &&
    Number(dateString[5] + dateString[6]) <= 12 &&
    Number(dateString[8] + dateString[9]) > 0 &&
    Number(dateString[8] + dateString[9]) <= 31 &&
    Number(dateString[0] + dateString[1] + dateString[2] + dateString[3]) >=
      1800 &&
    Number(dateString[0] + dateString[1] + dateString[2] + dateString[3]) <=
      2200
  );
};
