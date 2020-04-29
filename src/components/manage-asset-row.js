import { store } from "../store.js";
import { resetUL, BREAKPOINT_TABLET } from "../css-globals.js";
import { EVENT_REMOVE_ASSET_BY_INDEX } from "../globals.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}

  li {
      display: flex;
      justify-content: space-between;
  }

  .remove-button-container{
    justify-content: flex-end;
  }

  ul {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  input {
    width: 100px;
  }

  @media (min-width: ${BREAKPOINT_TABLET}) {
    ul {
      flex-direction: row;
    }

    li {
      padding-right: 5px;
    }
    
    li:last-child {
      padding-right: 0;
    }
  }
</style>
<ul>
  <!-- generated -->
</ul>`;

class Asset extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["asset", "index"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "index") {
      this.indexOfAsset = +newValue;
    } else if (name === "asset") {
      const asset = JSON.parse(newValue);
      const ul = this.shadowRoot.querySelector("ul");
      ul.innerText = "";

      const symbol = document.createElement("li");
      symbol.innerHTML = `<label for="symbol_input">Symbol:</label><input id="symbol_input" value="${asset.symbol}" disabled>`;
      ul.appendChild(symbol);

      const assetInput = document.createElement("li");
      assetInput.innerHTML = `<label for="asset_input">Asset:</label><input id="asset_input" value="${asset.asset}" disabled>`;
      ul.appendChild(assetInput);

      const category = document.createElement("li");
      category.innerHTML = `<label for="category_input">Category:</label><input id="category_input" value="${asset.category}" disabled>`;
      ul.appendChild(category);

      const amount = document.createElement("li");
      amount.innerHTML = `<label for="amount_input">Amount:</label><input id="amount_input" value="${asset.amount}" disabled>`;
      ul.appendChild(amount);

      // Object.keys(asset).forEach(property => {
      //   const li = document.createElement("li");
      //   li.innerHTML = `<label for="${this.indexOfAsset}">${property}:</label><input id="${this.indexOfAsset}" value="${asset[property]}" disabled>`;
      //   ul.appendChild(li);
      // });

      const li = document.createElement("li");
      li.classList.add("remove-button-container");
      const button = document.createElement("button");
      button.textContent = "remove";
      button.addEventListener("click", e => {
        store.dispatchEvent(
          new CustomEvent(EVENT_REMOVE_ASSET_BY_INDEX, {
            detail: this.indexOfAsset
          })
        );
      });
      li.appendChild(button);
      ul.appendChild(li);
    }
  }
}

customElements.define("hk-manage-asset-row", Asset);
