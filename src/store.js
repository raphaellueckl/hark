import { databaseConnector } from "./data/database-connector.js";

// EventTarget, so that listeners can be registered on it
// Element, as a workaround for safari
const _store = new EventTarget() || Element.prototype;

const _pipeline = {
  set: function(target, key, value) {
    _store[key] = value;
    return true;
  },

  get: function(target, prop) {
    // To be able to register an eventlistener on the _store object,
    // 'this' has to be linked to the target.
    const property = Reflect.get(target, prop);
    if (typeof property === "function") return property.bind(target);
    return property;
  }
};

const store = new Proxy(_store, _pipeline);

store.addEventListener("updateasset", ({ detail: asset }) => {
  databaseConnector.updateAsset(asset);
  const updatedAssets = databaseConnector.getAssets();
  store.dispatchEvent(
    new CustomEvent("updated_assets", { detail: updatedAssets })
  );
});

store.addEventListener("removeassetbyindex", ({ detail: index }) => {
  databaseConnector.removeAssetByIndex(index);
  const updatedAssets = databaseConnector.getAssets();
  store.dispatchEvent(
    new CustomEvent("updated_assets", { detail: updatedAssets })
  );
});

export { store };
