import { TYPE_DEPOSIT, TYPE_WITHDRAWAL } from "../globals.js";

const STORAGE_KEY_FIAT_TRANSACTIONS = "fiat_transactions";
const STORAGE_KEY_ASSETS = "assets";

class DatabaseConnector {
  constructor() {
    this.storage = localStorage;

    this._initMockData();
  }

  getFiatTransactions() {
    const fiatTransactions =
      this.storage.getItem(STORAGE_KEY_FIAT_TRANSACTIONS) || [];
    return fiatTransactions.length ? JSON.parse(fiatTransactions) : [];
  }

  updateFiatTransaction(transaction) {
    const transactions = this._removeFiatTransactionVirtual(transaction);
    transactions.push(transaction);
    this.storage.setItem(
      STORAGE_KEY_FIAT_TRANSACTIONS,
      JSON.stringify(transactions)
    );
  }

  _removeFiatTransactionVirtual(transaction) {
    const transactions =
      (this.storage.getItem(STORAGE_KEY_FIAT_TRANSACTIONS) &&
        JSON.parse(this.storage.getItem(STORAGE_KEY_FIAT_TRANSACTIONS))) ||
      [];
    const removeAssetFromAssets = transactions.filter(
      (_transaction) => _transaction.symbol !== transaction.symbol
    );
    return removeAssetFromAssets;
  }

  removeFiatTransactionByIndex(index) {
    const updatedTransactions = this.getFiatTransactions().filter(
      (_transaction, _index) => index !== _index
    );
    this.storage.setItem(
      STORAGE_KEY_FIAT_TRANSACTIONS,
      JSON.stringify(updatedTransactions)
    );
  }

  updateAsset(asset) {
    const assets = this._removeAssetVirtual(asset);
    assets.push(asset);

    this.storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }

  removeAssetByIndex(index) {
    const assets = this.getAssets().filter((asset, _index) => index !== _index);
    this.storage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
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
      (_asset) => _asset.symbol !== asset.symbol
    );
    return removeAssetFromAssets;
  }

  _initMockData() {
    if (!this.getAssets().length) {
      const mockData = [
        {
          symbol: "bitcoin",
          asset: "bitcoin",
          category: "crypto",
          amount: 0.2,
        },
        {
          symbol: "ethereum",
          asset: "ethereum",
          category: "crypto",
          amount: 3,
        },
        {
          symbol: "MSFT",
          asset: "microsoft",
          category: "stock",
          amount: 1,
        },
        {
          symbol: "XAU",
          asset: "gold",
          category: "resource",
          amount: 10,
        },
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
          type: TYPE_DEPOSIT,
        },
        {
          date: "01.01.2010",
          exchange: "Swissquote",
          symbol: "USD",
          amount: "470",
          type: TYPE_DEPOSIT,
        },
        {
          date: "02.01.2010",
          exchange: "Swissquote",
          symbol: "USD",
          amount: "100",
          type: TYPE_WITHDRAWAL,
        },
      ];
      this.storage.setItem(
        STORAGE_KEY_FIAT_TRANSACTIONS,
        JSON.stringify(mockData)
      );
    }
  }
}

export const databaseConnector = new DatabaseConnector();
