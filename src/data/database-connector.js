class DatabaseConnector {
  constructor() {
    this.storage = localStorage;

    if (!this.getAssets().length) {
      const mockData = [
        {
          symbol: "bitcoin",
          asset: "bitcoin",
          category: "crypto",
          amount: 0.2
        },
        {
          symbol: "ethereum",
          asset: "ethereum",
          category: "crypto",
          amount: 3
        },
        {
          symbol: "MSFT",
          asset: "microsoft",
          category: "stock",
          amount: 1
        },
        {
          symbol: "gold",
          asset: "gold",
          category: "resource",
          amount: 10
        }
      ];
      this.storage.setItem("assets", JSON.stringify(mockData));
    }
  }

  updateAsset(asset) {
    const assets = this._removeAssetVirtual(asset);
    assets.push(asset);

    this.storage.setItem("assets", JSON.stringify(assets));
  }

  removeAssetByIndex(index) {
    const assets = this.getAssets().filter((asset, _index) => index !== _index);
    this.storage.setItem("assets", JSON.stringify(assets));
  }

  removeAsset(asset) {
    const assets = this._removeAssetVirtual(asset);

    this.storage.setItem("assets", JSON.stringify(assets));
  }

  getAssets() {
    const assets = this.storage.getItem("assets") || [];
    return assets.length ? JSON.parse(assets) : [];
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
