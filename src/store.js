window.addEventListener("updateasset", ({ detail: asset }) => {
  console.log(asset);
});

const _store = {};

const _pipeline = {
  set: function(target, key, value) {
    _store[key] = value;
    return true;
  },

  get: function(target, prop, receiver) {
    return target[prop];
  }
};

const store = new Proxy(_store, _pipeline);

export { store };
