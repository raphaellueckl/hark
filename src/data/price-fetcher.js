import { databaseConnector } from "./database-connector.js";
import { store } from "../store.js";
import { EVENT_ASSETS_UPDATED } from "../globals.js";

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
    const valuePromises = [];

    assets.forEach((_asset) => {
      switch (_asset.category) {
        case "crypto": {
          valuePromises.push(cryptoFetcher.bySymbol(_asset.symbol));
          break;
        }
        case "stock": {
          valuePromises.push(stockFetcher.bySymbol(_asset.symbol));
          break;
        }
        case "resource": {
          valuePromises.push(resourceFetcher.bySymbol(_asset.symbol));
          break;
        }
        default: {
          valuePromises.push(Promise.resolve("n/a"));
        }
      }
    });

    const values = await Promise.all(valuePromises);

    const enrichedAssets = assets.map((_asset, index) => {
      try {
        _asset.value = values[index];
      } catch (error) {
        _asset.value = "n/a";
      }
      return _asset;
    });

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

  bySymbol(symbol) {
    const VALUE_KEY = "CRYPTO_" + symbol;
    const TIMESTAMP = VALUE_KEY + "_LAST_FETCH_IN_MILLIS";
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(this.BASE_URL + symbol)
      .then((res) => res.json())
      .then((data) => {
        store[TIMESTAMP] = new Date().getTime();
        store[VALUE_KEY] = Object.values(data)[0].chf;
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

class StockFetcher {
  constructor() {
    this.BASE_URL =
      "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&outputsize=compact&apikey=BTOSEGGXBDS03E8F&symbol=";
  }

  bySymbol(symbol) {
    const VALUE_KEY = "STOCK_" + symbol;
    const TIMESTAMP = VALUE_KEY + "_LAST_FETCH_IN_MILLIS";
    if (
      store[TIMESTAMP] &&
      new Date().getTime() - store[TIMESTAMP] < FIVE_MINUTES_IN_MILLIS
    ) {
      return Promise.resolve(store[VALUE_KEY]);
    }
    return fetch(this.BASE_URL + symbol)
      .then((res) => res.json())
      .then((data) => {
        store[TIMESTAMP] = new Date().getTime();
        store[VALUE_KEY] = Object.values(Object.values(data)[1])[0]["4. close"];
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(e);
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

  bySymbol(symbol) {
    const VALUE_KEY = "RESOURCE_" + symbol;
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
        store[VALUE_KEY] = data[symbol.toUpperCase()].CHF;
        return store[VALUE_KEY];
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
