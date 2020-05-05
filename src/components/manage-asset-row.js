import { store } from "../store.js";
import { resetUL, BREAKPOINT_TABLET } from "../css-globals.js";
import { EVENT_REMOVE_ASSET_BY_INDEX, createColumn } from "../globals.js";

import "./button.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}

  li {
      display: flex;
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

      ul.appendChild(createColumn("Symbol", asset.symbol));
      ul.appendChild(createColumn("Asset", asset.asset));
      ul.appendChild(createColumn("Category", asset.category));
      ul.appendChild(createColumn("Amount", asset.amount));

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
