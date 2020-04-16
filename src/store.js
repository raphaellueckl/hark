import { databaseConnector } from "./data/database-connector.js";
import {
  EVENT_ASSET_UPDATE,
  EVENT_ASSETS_UPDATED,
  EVENT_UPDATE_FIAT_TRANSACTION,
  EVENT_UPDATED_FIAT_TRANSACTIONS,
  EVENT_REMOVE_ASSET_BY_INDEX,
} from "./globals.js";

// EventTarget, so that listeners can be registered on it
// Element, as a workaround for safari
const _store = new EventTarget() || Element.prototype;

const _pipeline = {
  set: function (target, key, value) {
    _store[key] = value;
    if (typeof property !== "function")
      localStorage.setItem("store_" + key, JSON.stringify(value));
    return true;
  },

  get: function (target, prop) {
    // To be able to register an eventlistener on the _store object,
    // 'this' has to be linked to the target.
    const property = Reflect.get(target, prop);
    if (typeof property === "function") return property.bind(target);
    return JSON.parse(localStorage.getItem("store_" + prop));
    // return property;
  },
};

const store = new Proxy(_store, _pipeline);

store.addEventListener(EVENT_ASSET_UPDATE, ({ detail: asset }) => {
  databaseConnector.updateAsset(asset);
  const updatedAssets = databaseConnector.getAssets();
  store.dispatchEvent(
    new CustomEvent(EVENT_ASSETS_UPDATED, { detail: updatedAssets })
  );
});

store.addEventListener(
  EVENT_UPDATE_FIAT_TRANSACTION,
  ({ detail: transaction }) => {
    databaseConnector.updateFiatTransaction(transaction);
    const updatedTransactions = databaseConnector.getFiatTransactions();
    store.dispatchEvent(
      new CustomEvent(EVENT_UPDATED_FIAT_TRANSACTIONS, {
        detail: updatedTransactions,
      })
    );
  }
);

store.addEventListener(EVENT_REMOVE_ASSET_BY_INDEX, ({ detail: index }) => {
  databaseConnector.removeAssetByIndex(index);
  const updatedAssets = databaseConnector.getAssets();
  store.dispatchEvent(
    new CustomEvent(EVENT_ASSETS_UPDATED, { detail: updatedAssets })
  );
});

export { store };
