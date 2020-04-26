import { databaseConnector } from "./database-connector.js";
import { store } from "../store.js";
import {
  EVENT_ASSETS_UPDATED,
  CATEGORY_CRYPTO,
  CATEGORY_RESOURCE,
  CATEGORY_STOCK,
} from "../globals.js";

const FIVE_MINUTES_IN_MILLIS = 1000 * 60 * 5;

class PriceFetcher {
  constructor() {
    const TIMESTAMP = "USD_TO_CHF_MULTIPLICATOR_LAST_FETCH_IN_MILLIS";
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
    const cryptoFetcher = new CryptoFetcher();
    const stockFetcher = new StockFetcher();
    const resourceFetcher = new ResourceFetcher();
    const assets = databaseConnector.getAssets() || [];
    const enrichedAssetPromises = [];

    assets.forEach((_asset) => {
      switch (_asset.category) {
        case CATEGORY_CRYPTO: {
          enrichedAssetPromises.push(cryptoFetcher.addPrice(_asset));
          break;
        }
        case CATEGORY_STOCK: {
          enrichedAssetPromises.push(stockFetcher.addPrice(_asset));
          break;
        }
        case CATEGORY_RESOURCE: {
          enrichedAssetPromises.push(resourceFetcher.addPrice(_asset.symbol));
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
}

export const priceFetcher = new PriceFetcher();

class CryptoFetcher {
  constructor() {
    this.BASE_URL =
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=chf&ids=";
  }

  addPrice(asset) {
    const ASSET_KEY = "CRYPTO_" + asset.symbol;
    const TIMESTAMP = ASSET_KEY + "_LAST_FETCH_IN_MILLIS";
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
}

class StockFetcher {
  constructor() {
    this.BASE_URL =
      "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&outputsize=compact&apikey=BTOSEGGXBDS03E8F&symbol=";
  }

  addPrice(asset) {
    const VALUE_KEY = "STOCK_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + "_LAST_FETCH_IN_MILLIS";
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
        asset.price = Object.values(Object.values(data)[1])[0]["4. close"];
        asset.value = asset.amount * asset.price;
        store[VALUE_KEY] = asset;
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(`Could not fetch stock: ${asset.symbol}`, e);
        return store[VALUE_KEY];
      });
  }
}

// class ResourceFetcher {
//   constructor() {
//     this.BASE_URL_FRAGMENTS = [
//       "https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v8/finance/chart/",
//       "?region=US&lang=en-US&includePrePost=false&interval=1m&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance"
//     ];
//   }

//   bySymbol(symbol) {
//     const VALUE_KEY = "RESOURCE_" + symbol;
//     const TIMESTAMP = VALUE_KEY + "_LAST_FETCH_IN_MILLIS";

//     if (
//       store[TIMESTAMP] &&
//       new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
//     ) {
//       return Promise.resolve(store[VALUE_KEY]);
//     }
//     return fetch(this.BASE_URL_FRAGMENTS.join(symbol), {
//       headers: {
//         "X-Requested-With": "XMLHttpRequest"
//       }
//     })
//       .then(res => {
//         return res.json();
//       })
//       .then(data => {
//         store[TIMESTAMP] = new Date().getTime();
//         store[VALUE_KEY] =
//           data.chart.result["0"].meta.regularMarketPrice *
//           store.USD_TO_CHF_MULTIPLICATOR;
//         return store[VALUE_KEY];
//       })
//       .catch(e => {
//         console.error(e);
//       });
//   }
// }

class ResourceFetcher {
  constructor() {
    this.BASE_URL = "https://api.bitpanda.com/v1/ticker";
  }

  addPrice(asset) {
    const VALUE_KEY = "RESOURCE_" + asset.symbol;
    const TIMESTAMP = VALUE_KEY + "_LAST_FETCH_IN_MILLIS";

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
}
