import { databaseConnector } from "./database-connector.js";
import { store } from "../store.js";
import {
  EVENT_ASSETS_UPDATED,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE,
  CATEGORY_STOCK,
  CATEGORY_CURRENCY,
  KEY_LAST_FETCH_IN_MILLIS,
} from "../globals.js";

const FIVE_MINUTES_IN_MILLIS = 1000 * 60 * 5;

class PriceFetcher {
  constructor() {
    this.cryptoFetcher = new CryptoFetcher();
    this.stockFetcher = new StockFetcher();
    this.resourceFetcher = new ResourceFetcher();
    this.currencyFetcher = new CurrencyFetcher();

    const TIMESTAMP = `USD_TO_CHF_MULTIPLICATOR${KEY_LAST_FETCH_IN_MILLIS}`;
    if (
      !store.USD_TO_CHF_MULTIPLICATOR ||
      !store[TIMESTAMP] ||
      new Date().getTime() - store[TIMESTAMP] > FIVE_MINUTES_IN_MILLIS
    ) {
      fetch("https://api.exchangeratesapi.io/latest?base=CHF")
        .then((res) => res.json())
        .then((dollarToChfConversionRate) => {
          store.USD_TO_CHF_MULTIPLICATOR =
            2 - dollarToChfConversionRate.rates.USD;
          store[TIMESTAMP] = new Date().getTime();
        });
    }
  }

  async enrichAssetsWithPrice() {
    const assets = databaseConnector.getAssets() || [];
    const enrichedAssetPromises = [];

    assets.forEach((_asset) => {
      switch (_asset.category) {
        case CATEGORY_CRYPTO: {
          enrichedAssetPromises.push(this.cryptoFetcher.addPrice(_asset));
          break;
        }
        case CATEGORY_STOCK: {
          enrichedAssetPromises.push(this.stockFetcher.addPrice(_asset));
          break;
        }
        case CATEGORY_RESOURCE: {
          enrichedAssetPromises.push(this.resourceFetcher.addPrice(_asset));
          break;
        }
        case CATEGORY_CURRENCY: {
          debugger;
          enrichedAssetPromises.push(this.currencyFetcher.addPrice(_asset));
          break;
        }
        default: {
          enrichedAssetPromises.push(Promise.resolve("n/a"));
        }
      }
    });

    const enrichedAssets = await Promise.all(enrichedAssetPromises);
    debugger;
    store.dispatchEvent(
      new CustomEvent(EVENT_ASSETS_UPDATED, { detail: enrichedAssets })
    );

    return enrichedAssets;
  }

  async testAssetByCategory(asset, category) {
    switch (category) {
      case CATEGORY_CRYPTO:
        return await this.cryptoFetcher.doesSymbolExist(asset);
      case CATEGORY_STOCK:
        return await this.stockFetcher.doesSymbolExist(asset);
      case CATEGORY_RESOURCE:
        return await this.resourceFetcher.doesSymbolExist(asset);
      case CATEGORY_CURRENCY:
        return await this.currencyFetcher.doesSymbolExist(asset);
      default:
        console.error("Category does not exist");
    }
  }
}

class CryptoFetcher {
  constructor() {
    this.BASE_URL =
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=chf&ids=";
  }

  addPrice(asset) {
    const ASSET_KEY = "CRYPTO_" + asset.symbol;
    const TIMESTAMP = ASSET_KEY + KEY_LAST_FETCH_IN_MILLIS;
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[ASSET_KEY]);
    }
    return fetch(this.BASE_URL + asset.symbol)
      .then((res) => res.json())
      .then((data) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = Object.values(data)[0].chf;
        asset.value = asset.amount * asset.price;
        store[ASSET_KEY] = asset;
        return store[ASSET_KEY];
      })
      .catch((e) => {
        console.error(`Could not fetch crypto: ${asset.symbol}`, e);
        return store[ASSET_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    const request = await fetch(this.BASE_URL + symbol);
    const jsonResponse = await request.json();
    try {
      if (Object.values(jsonResponse)[0].chf) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

class StockFetcher {
  constructor() {
    this.BASE_URL =
      "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=msft&apikey=BTOSEGGXBDS03E8F&symbol=";
  }

  addPrice(asset) {
    const VALUE_KEY = "STOCK_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + KEY_LAST_FETCH_IN_MILLIS;
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(this.BASE_URL + asset.symbol)
      .then((res) => res.json())
      .then((data) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = Number(data["Global Quote"]["05. price"]);
        asset.value = asset.amount * asset.price;
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(`Could not fetch stock: ${asset.symbol}`, e);
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    const request = await fetch(this.BASE_URL + symbol);
    const jsonResponse = await request.json();
    try {
      if (Object.values(Object.values(jsonResponse)[1])[0]["4. close"]) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

class ResourceFetcher {
  constructor() {
    this.BASE_URL = "https://api.bitpanda.com/v1/ticker";
  }

  addPrice(asset) {
    const VALUE_KEY = "RESOURCE_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + KEY_LAST_FETCH_IN_MILLIS;

    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(this.BASE_URL)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = data[asset.symbol.toUpperCase()].CHF;
        asset.value = asset.amount * asset.price;
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(`Could not fetch resource: ${asset.symbol}`, e);
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    const request = await fetch(this.BASE_URL);
    const jsonResponse = await request.json();
    try {
      if (jsonResponse[symbol.toUpperCase()].CHF) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

class CurrencyFetcher {
  constructor() {
    this.BASE_URL = "https://api.exchangeratesapi.io/latest?base=CHF";
  }

  addPrice(asset) {
    const VALUE_KEY = "CURRENCY_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + KEY_LAST_FETCH_IN_MILLIS;

    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(this.BASE_URL)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = data.rates[asset.symbol.toUpperCase()];

        asset.value = Number(asset.amount / asset.price);
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(`Could not fetch currency: ${asset.symbol}`, e);
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    const request = await fetch(this.BASE_URL);
    const jsonResponse = await request.json();
    try {
      if (jsonResponse.rates[symbol.toUpperCase()]) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

export const priceFetcher = new PriceFetcher();
