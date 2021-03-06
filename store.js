import { databaseConnector } from "./data/database-connector.js";
import {
  EVENT_ADD_ASSET,
  EVENT_ASSETS_UPDATED,
  EVENT_ADD_FIAT_TRANSACTION,
  EVENT_UPDATED_FIAT_TRANSACTIONS,
  EVENT_REMOVE_ASSET_BY_INDEX,
  EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX,
  EVENT_CHANGE_ASSET_AMOUNT,
  EVENT_CHANGE_FIXED_VALUE,
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

store.addEventListener(EVENT_ADD_ASSET, ({ detail: asset }) => {
  databaseConnector.addAsset(asset);
  const updatedAssets = databaseConnector.getAssets();
  store.dispatchEvent(
    new CustomEvent(EVENT_ASSETS_UPDATED, { detail: updatedAssets })
  );
});

store.addEventListener(
  EVENT_ADD_FIAT_TRANSACTION,
  ({ detail: transaction }) => {
    databaseConnector.addFiatTransaction(transaction);
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

store.addEventListener(
  EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX,
  ({ detail: index }) => {
    databaseConnector.removeFiatTransactionByIndex(index);
    const updatedTransactions = databaseConnector.getFiatTransactions();
    store.dispatchEvent(
      new CustomEvent(EVENT_UPDATED_FIAT_TRANSACTIONS, {
        detail: updatedTransactions,
      })
    );
  }
);

store.addEventListener(
  EVENT_CHANGE_ASSET_AMOUNT,
  ({ detail: assetWithUpdatedAmount }) => {
    const success = databaseConnector.updateAssetProperties(
      assetWithUpdatedAmount
    );
    if (success) {
      store.dispatchEvent(
        new CustomEvent(EVENT_ASSETS_UPDATED, {
          detail: databaseConnector.getAssets(),
        })
      );
    }
  }
);

store.addEventListener(
  EVENT_CHANGE_FIXED_VALUE,
  ({ detail: assetWithUpdatedFixedValue }) => {
    const success = databaseConnector.updateAssetProperties(
      assetWithUpdatedFixedValue
    );
    if (success) {
      store.dispatchEvent(
        new CustomEvent(EVENT_ASSETS_UPDATED, {
          detail: databaseConnector.getAssets(),
        })
      );
    }
  }
);

export { store };
