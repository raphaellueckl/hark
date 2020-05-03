import { numberToLocal } from "../../globals";

const template = document.createElement("template");

template.innerHTML = `
<style>
    .content {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 250px;
    }

    .balance-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 250px;
    }

    #balance {
        display: inline-block;
        text-align: center;
        font-weight: 900;
        font-size: 24px;
        max-width: 250px;
        word-break: break-word;
    }
</style>
<div class="balance-container">
    <h2>Portfolio Balance</h2>
    <div class="content">
        <span id="balance"></span>
    </div>
</div>`;

class PortfolioBalance extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["balance"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "balance") {
      let balanceNumber = Number(newValue);
      // Cut away the after-comma part for 5 digit numbers
      if (balanceNumber >= 10000) {
        balanceNumber = Number.parseInt(balanceNumber);
      }
      const balance = numberToLocal(balanceNumber);
      this.shadowRoot.querySelector("#balance").textContent = `${balance} CHF`;
    }
  }
}

customElements.define("hk-portfolio-balance", PortfolioBalance);
