import { store } from "../../store.js";
import { resetUL, BREAKPOINT_DESKTOP } from "../../css-globals.js";
import { EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX } from "../../globals.js";

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
  }

  @media (min-width: ${BREAKPOINT_DESKTOP}) {
    ul {
      flex-direction: row;
      flex-wrap: wrap;
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
      const asset = JSON.parse(newValue);
      const ul = this.shadowRoot.querySelector("ul");
      ul.innerText = "";

      const date = document.createElement("li");
      date.innerHTML = `<label for="date_input">Date:</label><input id="date_input" value="${asset.date}" disabled>`;
      ul.appendChild(date);

      const symbol = document.createElement("li");
      symbol.innerHTML = `<label for="symbol_input">Symbol:</label><input id="symbol_input" value="${asset.symbol}" disabled>`;
      ul.appendChild(symbol);

      const amount = document.createElement("li");
      amount.innerHTML = `<label for="amount_input">Amount:</label><input id="amount_input" value="${asset.amount}" disabled>`;
      ul.appendChild(amount);

      const exchange = document.createElement("li");
      exchange.innerHTML = `<label for="exchange_input">Exchange:</label><input id="exchange_input" value="${asset.exchange}" disabled>`;
      ul.appendChild(exchange);

      const type = document.createElement("li");
      type.innerHTML = `<label for="type_input">Type:</label><input id="type_input" value="${asset.type}" disabled>`;
      ul.appendChild(type);

      const buttonContainer = document.createElement("li");
      buttonContainer.classList.add("remove-button-container");
      const button = document.createElement("button");
      button.textContent = "remove";
      button.addEventListener("click", e => {
        store.dispatchEvent(
          new CustomEvent(EVENT_REMOVE_FIAT_TRANSACTION_BY_INDEX, {
            detail: this.indexOfAsset
          })
        );
      });
      buttonContainer.appendChild(button);
      ul.appendChild(buttonContainer);
    }
  }
}

customElements.define("hk-fiat-transaction", FiatTransaction);
