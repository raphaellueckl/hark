import { store } from "../../store.js";
import {
  resetUL,
  BREAKPOINT_DESKTOP,
  ITEM_BACKGROUND,
  BREAKPOINT_TABLET,
} from "../../css-globals.js";
import { EVENT_REMOVE_ASSET_BY_INDEX, createColumn } from "../../globals.js";

import "../button.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}
    
  li {
    display: flex;
    padding: 5px;
  }

  .remove-button-container{
    justify-content: center;
    align-items: center;
  }

  ul {
    display: flex;
    flex-direction: column;
    margin: 5px;
    padding: 5px;
    background-color: ${ITEM_BACKGROUND};
    border-radius: 15px;
  }

  input {
    width: 100px;
  }

  hk-button {
    height: 50px;
  }

  @media (min-width: ${BREAKPOINT_DESKTOP}px) {
    ul {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  @media (min-width: ${BREAKPOINT_TABLET}px) and (max-width: ${
  BREAKPOINT_DESKTOP - 1
}px) {
    ul {
      flex-direction: row;
      flex-wrap: wrap;
    }

    li {
      justify-content: center;
      flex-basis: 30%
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

      ul.appendChild(createColumn("Symbol", asset.symbol, true));
      ul.appendChild(createColumn("Asset", asset.asset, true));
      ul.appendChild(createColumn("Category", asset.category, true));
      ul.appendChild(createColumn("Amount", asset.amount, true));

      const li = document.createElement("li");
      li.classList.add("remove-button-container");
      const button = document.createElement("hk-button");
      button.textContent = "remove";
      button.addEventListener("click", (e) => {
        store.dispatchEvent(
          new CustomEvent(EVENT_REMOVE_ASSET_BY_INDEX, {
            detail: this.indexOfAsset,
          })
        );
      });
      li.appendChild(button);
      ul.appendChild(li);
    }
  }
}

customElements.define("hk-manage-asset-row", Asset);
