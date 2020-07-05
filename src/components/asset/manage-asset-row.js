import { store } from "../../store.js";
import {
  resetUL,
  BREAKPOINT_DESKTOP,
  ITEM_BACKGROUND,
  BREAKPOINT_TABLET,
} from "../../css-globals.js";
import {
  EVENT_CHANGE_ASSET_AMOUNT,
  EVENT_REMOVE_ASSET_BY_INDEX,
  createColumn,
} from "../../globals.js";

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
    width: 50px;
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
      ul.appendChild(createColumn("Amount", asset.amount, false));

      const amountInput = this.shadowRoot.querySelector("#amount_input");
      amountInput.addEventListener("hk-change", ({ detail: newAmount }) => {
        if (isNaN(+newAmount)) {
          amountInput.setAttribute("error-msg", "Invalid Number");
          amountInput.setAttribute("invalid", "");
        } else {
          amountInput.removeAttribute("invalid");
          asset.amount = +newAmount;
          store.dispatchEvent(
            new CustomEvent(EVENT_CHANGE_ASSET_AMOUNT, { detail: asset })
          );
        }
      });

      const li = document.createElement("li");
      li.classList.add("remove-button-container");
      const button = document.createElement("hk-button");
      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
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
