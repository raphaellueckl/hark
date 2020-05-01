import {
  TYPE_DEPOSIT,
  TYPE_WITHDRAW,
  CATEGORY_CRYPTO,
  CATEGORY_STOCK,
  CATEGORY_RESOURCE,
  CATEGORY_CURRENCY
} from "../globals.js";

const STORAGE_KEY_FIAT_TRANSACTIONS = "fiat_transactions";
const STORAGE_KEY_ASSETS = "assets";

class DatabaseConnector {
  constructor() {
    this.storage = localStorage;

    this._initMockData();
  }

  getApplicationStateAsString() {
    return JSON.stringify(localStorage);
  }

  setApplicationStateFromString(stateAsString) {
    const state = JSON.parse(stateAsString);
    localStorage.clear();
    for (const key of Object.keys(state)) {
      localStorage.setItem(key, state[key]);
    }
  }

  getFiatTransactions() {
    const fiatTransactions =
      this.storage.getItem(STORAGE_KEY_FIAT_TRANSACTIONS) || [];
    return fiatTransactions.length ? JSON.parse(fiatTransactions) : [];
  }

  addFiatTransaction(transaction) {
    const transactions = this.getFiatTransactions();
    transactions.push(transaction);
    this._sortFiatTransactionsByDateDescending(transactions);
    this.storage.setItem(
      STORAGE_KEY_FIAT_TRANSACTIONS,
      JSON.stringify(transactions)
    );
  }

  removeFiatTransactionByIndex(index) {
    const updatedTransactions = this.getFiatTransactions().filter(
      (_transaction, _index) => index !== _index
    );
    this._sortFiatTransactionsByDateDescending(updatedTransactions);
    this.storage.setItem(
      STORAGE_KEY_FIAT_TRANSACTIONS,
      JSON.stringify(updatedTransactions)
    );
  }

  addAsset(asset) {
    const assets = this.getAssets();
    assets.push(asset);

    this.storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }

  removeAssetByIndex(index) {
    const assets = this.getAssets().filter((asset, _index) => index !== _index);

    this.storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }

  getMostUsedCurrency() {
    const transactions = this.getFiatTransactions();
    if (transactions.length > 3) {
      const symbolsAsArray = transactions.map(t => t.symbol);
      const frequency = new Map();
      symbolsAsArray.forEach(t => {
        frequency.set(t, (frequency.get(t) || 0) + 1);
      });
      return [...frequency.entries()].reduce((a, e) =>
        e[1] > a[1] ? e : a
      )[0];
    }
    return "";
  }

  removeAsset(asset) {
    const assets = this._removeAssetVirtual(asset);

    this.storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }

  getAssets() {
    const assets = this.storage.getItem(STORAGE_KEY_ASSETS) || [];
    return assets.length ? JSON.parse(assets) : [];
  }

  _removeAssetVirtual(asset) {
    const assets =
      (this.storage.getItem(STORAGE_KEY_ASSETS) &&
        JSON.parse(this.storage.getItem(STORAGE_KEY_ASSETS))) ||
      [];
    const removeAssetFromAssets = assets.filter(
      _asset => _asset.symbol !== asset.symbol
    );
    return removeAssetFromAssets;
  }

  _sortFiatTransactionsByDateDescending(assets) {
    assets.sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  _initMockData() {
    if (!this.getAssets().length) {
      const mockData = [
        {
          symbol: "bitcoin",
          asset: "bitcoin",
          category: CATEGORY_CRYPTO,
          amount: 0.2
        },
        {
          symbol: "ethereum",
          asset: "ethereum",
          category: CATEGORY_CRYPTO,
          amount: 3
        },
        {
          symbol: "MSFT",
          asset: "microsoft",
          category: CATEGORY_STOCK,
          amount: 1
        },
        {
          symbol: "XAU",
          asset: "gold",
          category: CATEGORY_RESOURCE,
          amount: 10
        },
        {
          symbol: "EUR",
          asset: "Euro",
          category: CATEGORY_CURRENCY,
          amount: 2000
        }
      ];
      this.storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(mockData));
    }

    if (!this.getFiatTransactions().length) {
      const mockData = [
        {
          date: "01.01.2010",
          exchange: "kraken",
          symbol: "CHF",
          amount: "340",
          type: TYPE_DEPOSIT
        },
        {
          date: "01.01.2010",
          exchange: "Swissquote",
          symbol: "USD",
          amount: "470",
          type: TYPE_DEPOSIT
        },
        {
          date: "02.01.2010",
          exchange: "Swissquote",
          symbol: "USD",
          amount: "100",
          type: TYPE_WITHDRAW
        }
      ];
      this.storage.setItem(
        STORAGE_KEY_FIAT_TRANSACTIONS,
        JSON.stringify(mockData)
      );
    }
  }
}

export const databaseConnector = new DatabaseConnector();
