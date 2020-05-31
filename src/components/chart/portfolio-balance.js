import { numberToLocal } from "../../globals.js";
import { widgetContainerStyles } from "../../css-globals.js";

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

    #balance {
        display: inline-block;
        margin-top: 15px;
        text-align: center;
        font-weight: 600;
        font-size: 20px;
        max-width: 250px;
        word-break: break-word;
    }
</style>
<div class="widget-container">
    <h2>Portfolio Balance</h2>
    <div class="content">
        <span id="balance"></span>
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

  static get observedAttributes() {
    return ["balance"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "balance") {
      const emojiNow = emojiYielder();
      let balanceNumber = Number(newValue);
      // Cut away the after-comma part for 5 digit numbers
      if (balanceNumber >= 10000) {
        balanceNumber = Number.parseInt(balanceNumber);
      }
      const balance = numberToLocal(balanceNumber);
      this.shadowRoot.querySelector("#balance").textContent = `${balance} CHF`;
      [...this.shadowRoot.querySelectorAll(".emoji-container")].forEach(
        (container) => {
          container.textContent = emojiNow;
        }
      );
    }
  }
}

customElements.define("hk-portfolio-balance", PortfolioBalance);
