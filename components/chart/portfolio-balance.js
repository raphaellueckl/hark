import {
  EVENT_ASSETS_UPDATED,
  EVENT_BITCOIN_PRICE_UPDATED,
  numberToLocal,
} from "../../globals.js";
import { widgetContainerStyles } from "../../css-globals.js";
import { store } from "../../store.js";

const template = document.createElement("template");

template.innerHTML = `
<style>
    ${widgetContainerStyles}

    .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 150px;
    }

    .emoji-container {
        font-size: 32px;
        padding: 20px 0;
    }

    .balance {
      display: inline-block;
      margin-top: 15px;
      text-align: center;
      font-weight: 600;
      font-size: 20px;
      max-width: 250px;
      word-break: break-word;
    }

    #bitcoin-balance {
      font-weight: 300;
      font-size: 18px;
    }

    .hidden {
      display: none;
    }
</style>
<div class="widget-container">
    <h2>Portfolio Balance</h2>
    <hk-spinner></hk-spinner>
    <div class="content hidden">
        <span class="balance" id="balance"></span>
        <span class="balance" id="bitcoin-balance"></span>
        <span class="emoji-container"></span>
    </div>
</div>`;

const emoji = [
  "🚀",
  "👯‍♀️",
  "🎯",
  "🎉",
  "🎊",
  "❤️",
  "🎈",
  "🥁",
  "🏋️‍♀️",
  "🍻",
  "🥂",
  "🥃",
  "🍪",
  "🙏",
];

const emojiYielder = () => emoji[Math.floor(Math.random() * emoji.length)];

class PortfolioBalance extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    store.addEventListener(EVENT_ASSETS_UPDATED, this._updatePortfolioBalance);
    store.addEventListener(
      EVENT_BITCOIN_PRICE_UPDATED,
      this._updatePortfolioBitcoinBalance
    );
  }

  _updatePortfolioBalance = ({ detail: assetList }) => {
    this.combinedAssetsTotalValue = assetList
      .map((a) => (a.fixedValue ? +a.fixedValue : +a.value))
      .reduce((a, b) => a + b, 0);

    const balanceEl = this.shadowRoot.querySelector("#balance");
    this.shadowRoot.querySelector("hk-spinner").classList.add("hidden");
    this.shadowRoot.querySelector(".content").classList.remove("hidden");
    const emojiNow = emojiYielder();

    let balance = this.combinedAssetsTotalValue;
    // Cut away the after-comma part for 5 digit numbers
    if (balance >= 10000) {
      balance = Number.parseInt(balance);
    }
    balance = numberToLocal(balance);
    balanceEl.textContent = `${balance} CHF`;
    [...this.shadowRoot.querySelectorAll(".emoji-container")].forEach(
      (container) => {
        container.textContent = emojiNow;
      }
    );

    if (this.bitcoinPrice) {
      this._setBitcoinBalance();
    }
  };

  _updatePortfolioBitcoinBalance = ({ detail: bitcoinPrice }) => {
    this.bitcoinPrice = bitcoinPrice;

    if (this.combinedAssetsTotalValue) {
      this._setBitcoinBalance();
    }
  };

  _setBitcoinBalance() {
    const portfolioValueInBitcoin = numberToLocal(
      this.combinedAssetsTotalValue / this.bitcoinPrice
    );
    this.shadowRoot.querySelector(
      "#bitcoin-balance"
    ).textContent = `₿ ${portfolioValueInBitcoin}`;
  }
}

customElements.define("hk-portfolio-balance", PortfolioBalance);
