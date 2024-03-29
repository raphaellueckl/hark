import { store } from "../../store.js";
import {
  resetUL,
  BREAKPOINT_DESKTOP,
  ITEM_BACKGROUND,
  BREAKPOINT_TABLET,
} from "../../css-globals.js";
import {
  EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX,
  createColumn,
} from "../../globals.js";
import "../modal.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
  ${resetUL}
  
  li {
    display: flex;
    padding: 5px;
  }

  .fiat-transactions__row__column-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

class FiatTransaction extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["transaction", "index"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "index") {
      this.indexOfAsset = +newValue;
    } else if (name === "transaction") {
      const transaction = JSON.parse(newValue);
      const ul = this.shadowRoot.querySelector("ul");
      ul.innerText = "";

      ul.appendChild(createColumn("Date", transaction.date, true));
      ul.appendChild(createColumn("Symbol", transaction.symbol, true));
      ul.appendChild(
        createColumn("Amount", transaction.amount, true, "number")
      );
      ul.appendChild(createColumn("Exchange", transaction.exchange, true));
      ul.appendChild(createColumn("Type", transaction.type, true));
      const buttonContainer = document.createElement("li");
      buttonContainer.classList.add("remove-button-container");
      const removeButton = document.createElement("hk-button");
      removeButton.setAttribute("flair", "danger");
      removeButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      removeButton.addEventListener("click", (e) => {
        const modal = document.createElement("hk-modal");
        modal.textContent = "Do you really want to delete this item?";
        modal.setAttribute("open", "");
        modal.onAccept = () => {
          store.dispatchEvent(
            new CustomEvent(EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX, {
              detail: this.indexOfAsset,
            })
          );
          document.querySelector("body").removeChild(modal);
        };
        modal.onDecline = () => {
          document.querySelector("body").removeChild(modal);
        };
        document.querySelector("body").appendChild(modal);
      });
      buttonContainer.appendChild(removeButton);
      ul.appendChild(buttonContainer);
    }
  }
}

customElements.define("hk-fiat-transaction", FiatTransaction);
