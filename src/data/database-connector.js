class DatabaseConnector {
  constructor() {
    this.storage = localStorage;
  }

  updateAsset(asset) {
    const assets = this._removeAssetVirtual(asset);
    assets.push(asset);

    this.storage.setItem("assets", JSON.stringify(assets));
  }

  removeAsset(asset) {
    const assets = this._removeAssetVirtual(asset);

    this.storage.setItem("assets", JSON.stringify(assets));
  }

  getAssets() {
    JSON.parse(this.storage.getItem("assets"));
  }

  _removeAssetVirtual(asset) {
    const assets =
      (this.storage.getItem("assets") &&
        JSON.parse(this.storage.getItem("assets"))) ||
      [];
    const removeAssetFromAssets = assets.filter(
      _asset => _asset.symbol !== asset.symbol
    );
    return removeAssetFromAssets;
  }
}

export const databaseConnector = new DatabaseConnector();
