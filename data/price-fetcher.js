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

const PROXY = "http://localhost:8080/";

const FIVE_MINUTES_IN_MILLIS = 1000 * 60 * 5;

const RAPID_API_HEADERS = {
  "x-rapidapi-key": "9443d3239cmsh5793b8156e3a879p1ea1ffjsnb3226d275259",
  "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
};

const FETCH_OPTIONS = {
  mode: "no-cors",
};

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
      fetch(`${PROXY}https://finance.yahoo.com/quote/CHF=X`, FETCH_OPTIONS)
        .then((res) => res.json())
        .then(({ price }) => {
          store.USD_TO_CHF_MULTIPLICATOR = price;
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
  addPrice(asset) {
    const ASSET_KEY = "CRYPTO_" + asset.symbol;
    const TIMESTAMP = ASSET_KEY + KEY_LAST_FETCH_IN_MILLIS;
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[ASSET_KEY]);
    }
    return fetch(
      `${PROXY}https://finance.yahoo.com/quote/${asset.symbol}-USD`,
      FETCH_OPTIONS
    )
      .then((res) => res.json())
      .then(({ price }) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = price;
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
    const request = await fetch(
      `${PROXY}https://finance.yahoo.com/quote/${symbol}-USD`,
      FETCH_OPTIONS
    );
    const jsonResponse = await request.json();
    try {
      if (jsonResponse.price) {
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
    return fetch(
      `${PROXY}https://finance.yahoo.com/quote/${asset.symbol}`,
      FETCH_OPTIONS
    )
      .then((res) => res.json())
      .then(({ price }) => {
        store[TIMESTAMP] = new Date().getTime();
        asset.price = price;
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
    const request = await fetch(
      `${PROXY}https://finance.yahoo.com/quote/${symbol}`,
      FETCH_OPTIONS
    );
    const jsonResponse = await request.json();
    try {
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
    return fetch(
      `${PROXY}https://finance.yahoo.com/quote/${asset.symbol}=F`,
      FETCH_OPTIONS
    )
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
      .catch((e) => {
        console.error(`Could not fetch resource: ${asset.symbol}`, e);
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    const request = await fetch(
      `${PROXY}https://finance.yahoo.com/quote/${asset.symbol}=F`,
      FETCH_OPTIONS
    );
    const jsonResponse = await request.json();
    try {
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
    return fetch(
      `${PROXY}https://finance.yahoo.com/quote/${asset.symbol}=X`,
      FETCH_OPTIONS
    )
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
      .catch((e) => {
        console.error(`Could not fetch currency: ${asset.symbol}`, e);
        return store[VALUE_KEY];
      });
  }

  async doesSymbolExist(symbol) {
    const request = await fetch(
      `${PROXY}https://finance.yahoo.com/quote/${symbol}=X`,
      FETCH_OPTIONS
    );
    const jsonResponse = await request.json();
    try {
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
