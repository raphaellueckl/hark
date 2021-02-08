import {
  TYPE_DEPOSIT,
  TYPE_WITHDRAW,
  CATEGORY_CRYPTO,
  CATEGORY_STOCK,
  CATEGORY_RESOURCE,
  CATEGORY_CURRENCY,
  KEY_LAST_FETCH_IN_MILLIS,
} from "../globals.js";

const STORAGE_KEY_FIAT_TRANSACTIONS = "fiat_transactions";
const STORAGE_KEY_ASSETS = "assets";

const storage = localStorage;

class DatabaseConnector {
  constructor() {
    this._initMockData();
  }

  getApplicationStateAsString() {
    return JSON.stringify(storage);
  }

  setApplicationStateFromString(stateAsString) {
    const state = JSON.parse(stateAsString);
    storage.clear();
    for (const key of Object.keys(state)) {
      storage.setItem(key, state[key]);
    }
  }

  getFiatTransactions() {
    const fiatTransactions =
      storage.getItem(STORAGE_KEY_FIAT_TRANSACTIONS) || [];
    return fiatTransactions.length ? JSON.parse(fiatTransactions) : [];
  }

  addFiatTransaction(transaction) {
    const transactions = this.getFiatTransactions();
    transactions.push(transaction);
    this._sortFiatTransactionsByDateDescending(transactions);
    storage.setItem(
      STORAGE_KEY_FIAT_TRANSACTIONS,
      JSON.stringify(transactions)
    );
  }

  removeFiatTransactionByIndex(index) {
    const updatedTransactions = this.getFiatTransactions().filter(
      (_transaction, _index) => index !== _index
    );
    this._sortFiatTransactionsByDateDescending(updatedTransactions);
    storage.setItem(
      STORAGE_KEY_FIAT_TRANSACTIONS,
      JSON.stringify(updatedTransactions)
    );
  }

  addAsset(asset) {
    const assets = this.getAssets();
    assets.push(asset);

    storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    this._triggerPriceUpdate();
  }

  removeAssetByIndex(index) {
    const assets = this.getAssets().filter((asset, _index) => index !== _index);

    storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }

  updateAssetProperties(asset) {
    const assetsBeforeUpdate = this.getAssets();
    const indexOfOutdatedAsset = assetsBeforeUpdate.findIndex(
      (a) =>
        a.asset === asset.asset &&
        a.category === asset.category &&
        a.symbol === asset.symbol
    );
    if (indexOfOutdatedAsset !== -1) {
      this.removeAssetByIndex(indexOfOutdatedAsset);
      this.addAsset(asset);
      return true;
    } else {
      console.error(
        "Asset should have been updated, but none was found.",
        JSON.stringify(asset)
      );
      return false;
    }
  }

  getMostUsedCurrency() {
    const transactions = this.getFiatTransactions();
    if (transactions.length > 3) {
      const symbolsAsArray = transactions.map((t) => t.symbol);
      const frequency = new Map();
      symbolsAsArray.forEach((t) => {
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

    storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }

  getAssets() {
    const assets = storage.getItem(STORAGE_KEY_ASSETS) || [];
    return assets.length ? JSON.parse(assets) : [];
  }

  clearDatabase() {
    storage.clear();
    this._initMockData();
  }

  _triggerPriceUpdate() {
    Object.keys(storage).forEach((storageKey) => {
      if (storageKey.includes(KEY_LAST_FETCH_IN_MILLIS)) {
        storage.removeItem(storageKey);
      }
    });
  }

  _removeAssetVirtual(asset) {
    const assets =
      (storage.getItem(STORAGE_KEY_ASSETS) &&
        JSON.parse(storage.getItem(STORAGE_KEY_ASSETS))) ||
      [];
    const removeAssetFromAssets = assets.filter(
      (_asset) => _asset.symbol !== asset.symbol
    );
    return removeAssetFromAssets;
  }

  _sortFiatTransactionsByDateDescending(assets) {
    assets.sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  _initMockData() {
    if (!this.getAssets().length && !this.getFiatTransactions().length) {
      const assetsMockData = [
        {
          symbol: "bitcoin",
          asset: "bitcoin",
          category: CATEGORY_CRYPTO,
          amount: 0.2,
        },
        {
          symbol: "ethereum",
          asset: "ethereum",
          category: CATEGORY_CRYPTO,
          amount: 3,
        },
        {
          symbol: "MSFT",
          asset: "microsoft",
          category: CATEGORY_STOCK,
          amount: 1,
        },
        {
          symbol: "XAU",
          asset: "gold",
          category: CATEGORY_RESOURCE,
          amount: 10,
        },
        {
          symbol: "EUR",
          asset: "Euro",
          category: CATEGORY_CURRENCY,
          amount: 2000,
        },
      ];
      storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assetsMockData));

      const fiatTransactionsMockData = [
        {
          date: "2010-12-24",
          exchange: "kraken",
          symbol: "CHF",
          amount: "340",
          type: TYPE_DEPOSIT,
        },
        {
          date: "2015-05-13",
          exchange: "Swissquote",
          symbol: "USD",
          amount: "470",
          type: TYPE_DEPOSIT,
        },
        {
          date: "2020-03-31",
          exchange: "Swissquote",
          symbol: "USD",
          amount: "100",
          type: TYPE_WITHDRAW,
        },
      ];
      storage.setItem(
        STORAGE_KEY_FIAT_TRANSACTIONS,
        JSON.stringify(fiatTransactionsMockData)
      );
    }
  }
}

export const databaseConnector = new DatabaseConnector();
