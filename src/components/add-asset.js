import { store } from "../store.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  .menu-container {
    display: flex;
    flex-direction: column;
  }
</style>
<div class="menu-container">
    <label>Asset: <input id="asset"></label>
    <label>Symbol: <input id="symbol"></label>
    <label>Category: <input id="category"></label>
    <label>Amount: <input id="amount"></label>
    <button>Add</button>
</div>`;

class AddAsset extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector("button");
    this.assetInput = this.shadowRoot.querySelector("#asset");
    this.symbolInput = this.shadowRoot.querySelector("#symbol");
    this.categoryInput = this.shadowRoot.querySelector("#category");
    this.amountInput = this.shadowRoot.querySelector("#amount");

    button.addEventListener("click", () => {
      const updateAsset = {
        symbol: this.symbolInput.value,
        asset: this.assetInput.value,
        category: this.categoryInput.value,
        amount: this.amountInput.value
      };

      store.dispatchEvent(
        new CustomEvent("updateasset", { detail: updateAsset })
      );
      this._clearInputs();
    });
  }

  _clearInputs() {
    this.assetInput.value = "";
    this.symbolInput.value = "";
    this.categoryInput.value = "";
    this.amountInput.value = "";
  }
}

customElements.define("hk-add-asset", AddAsset);
