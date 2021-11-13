import { databaseConnector } from "./database-connector.js";
import { store } from "../store.js";
import {
  EVENT_ASSETS_UPDATED,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE,
  CATEGORY_STOCK,
  CATEGORY_CURRENCY,
  KEY_LAST_FETCH_IN_MILLIS,
  EVENT_ERROR,
} from "../globals.js";

const PROXY = "https://ripped.link/";

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
      fetch(`${PROXY}https://finance.yahoo.com/quote/CHF=X/`)
        .then((res) => res.json())
        .then(({ price }) => {
          store.USD_TO_CHF_MULTIPLICATOR = price;
          store[TIMESTAMP] = new Date().getTime();
        })
        .catch((err) => {
          console.error("LIVE USD/CHF unavailable!", err);
          store.dispatchEvent(
            new CustomEvent(EVENT_ERROR, {
              detail: "LIVE USD/CHF unavailable!",
            })
          );
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
          enrichedAssetPromises.push(this.currencyFetcher.addPrice(_asset));
          break;
        }
        default: {
          enrichedAssetPromises.push(Promise.resolve("n/a"));
        }
      }
    });

    const enrichedAssets = await Promise.all(enrichedAssetPromises);

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
      .catch((err) => {
        console.error(`Could not fetch crypto: ${asset.symbol}`, err);
        store.dispatchEvent(
          new CustomEvent(EVENT_ERROR, {
            detail: `Could not fetch crypto: ${asset.symbol}`,
          })
        );
        return store[ASSET_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    try {
      const request = await fetch(this.BASE_URL + symbol);
      const jsonResponse = await request.json();
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
  addPrice(asset) {
    const VALUE_KEY = "STOCK_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + KEY_LAST_FETCH_IN_MILLIS;
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(`${PROXY}https://finance.yahoo.com/quote/${asset.symbol}/`)
      .then((res) => res.json())
      .then(({ price }) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = price;
        asset.value = asset.amount * asset.price;
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((err) => {
        console.error(`Could not fetch stock: ${asset.symbol}`, err);
        store.dispatchEvent(
          new CustomEvent(EVENT_ERROR, {
            detail: `Could not fetch stock: ${asset.symbol}`,
          })
        );
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    try {
      const request = await fetch(
        `${PROXY}https://finance.yahoo.com/quote/${symbol}/`
      );
      const jsonResponse = await request.json();
      if (jsonResponse.price) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

class ResourceFetcher {
  addPrice(asset) {
    const VALUE_KEY = "RESOURCE_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + KEY_LAST_FETCH_IN_MILLIS;
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(`${PROXY}https://finance.yahoo.com/quote/${asset.symbol}=F/`)
      .then((res) => {
        return res.json();
      })
      .then(({ price }) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = price;
        asset.value = asset.amount * asset.price;
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((err) => {
        console.error(`Could not fetch resource: ${asset.symbol}`, err);
        store.dispatchEvent(
          new CustomEvent(EVENT_ERROR, {
            detail: `Could not fetch resource: ${asset.symbol}`,
          })
        );
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    try {
      const request = await fetch(
        `${PROXY}https://finance.yahoo.com/quote/${symbol}=F/`
      );
      const jsonResponse = await request.json();
      if (jsonResponse.price) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

class CurrencyFetcher {
  addPrice(asset) {
    const VALUE_KEY = "CURRENCY_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + KEY_LAST_FETCH_IN_MILLIS;
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(`${PROXY}https://finance.yahoo.com/quote/${asset.symbol}=X/`)
      .then((res) => {
        return res.json();
      })
      .then(({ price }) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = price;
        asset.value = asset.amount * asset.price;
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((err) => {
        console.error(`Could not fetch currency: ${asset.symbol}`, err);
        store.dispatchEvent(
          new CustomEvent(EVENT_ERROR, {
            detail: `Could not fetch currency: ${asset.symbol}`,
          })
        );
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    try {
      const request = await fetch(
        `${PROXY}https://finance.yahoo.com/quote/${symbol}=X/`
      );
      const jsonResponse = await request.json();
      if (jsonResponse.price) {
        return true;
      }
    } catch (err) {
      // Does not have a value => Nullpointer.
    }
    return false;
  }
}

export const priceFetcher = new PriceFetcher();
