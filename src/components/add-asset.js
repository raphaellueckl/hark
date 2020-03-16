import { databaseConnector } from "../data/database-connector.js";

class AddAsset extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
    </style>
    <div class="menu-container">
        <label>Asset: <input id="asset"></label>
        <label>Symbol: <input id="symbol"></label>
        <label>Category: <input id="category"></label>
        <label>Amount: <input id="amount"></label>
        <button>Add</button>
    </div>`;

    const button = this.shadowRoot.querySelector("button");
    const assetInput = this.shadowRoot.querySelector("#asset");
    const symbolInput = this.shadowRoot.querySelector("#symbol");
    const categoryInput = this.shadowRoot.querySelector("#category");
    const amountInput = this.shadowRoot.querySelector("#amount");

    button.addEventListener("click", () => {
      databaseConnector.updateAsset({
        symbol: symbolInput.value,
        asset: assetInput.value,
        category: categoryInput.value,
        amount: amountInput.value
      });
    });
  }
}

customElements.define("hk-add-asset", AddAsset);
