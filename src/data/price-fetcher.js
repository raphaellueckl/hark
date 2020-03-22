import { databaseConnector } from "./database-connector.js";

class PriceFetcher {
  constructor() {}

  async enrichAssetsWithPrice() {
    this.cryptoFetcher = new CryptoFetcher();
    const assets = databaseConnector.getAssets() || [];
    const valuePromises = [];
    assets.forEach(_asset => {
      switch (_asset.category) {
        case "crypto": {
          valuePromises.push(
            this.cryptoFetcher.fetchValueForSymbol(_asset.symbol)
          );
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
        _asset.value = Object.values(values[index])[0].chf;
      } catch (error) {
        _asset.value = "n/a";
      }
      return _asset;
    });

    return enrichedAssets;
  }
}

export const priceFetcher = new PriceFetcher();

class CryptoFetcher {
  constructor() {
    this.BASE_URL =
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=chf&ids=";
  }

  fetchValueForSymbol(symbol) {
    return fetch(this.BASE_URL + symbol).then(res => {
      return res.json();
    });
  }
}
