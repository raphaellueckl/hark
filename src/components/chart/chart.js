import { store } from "../../store.js";
import { databaseConnector } from "../../data/database-connector.js";

const template = document.createElement("template");

template.innerHTML = `
    <style>
        .value {
            transform-origin: center;
        }

        div {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 250px;
        }

        circle {
          transition: stroke-width 0.2s;
        }
    </style>
    <div>
      <h2></h2>
      <svg height="250" width="250"></svg>
    </div>`;

const ALL_HEX_VALUES = "0123456789ABCDEF";
const DEFAULT_STROKE_WIDTH = "50";
const STEPS_UNTIL_FULL_CIRCLE = 503;

function getRandomizedHex() {
  return `#${[...Array(6)]
    .map(() => ALL_HEX_VALUES.charAt(Math.random() * 16))
    .join("")}`;
}

let self;

class Chart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    self = this;
  }

  static get observedAttributes() {
    return ["title", "data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title") {
      this.shadowRoot.querySelector("h2").textContent = newValue;
    } else if (name === "data") {
      //   this.subscriberEventListenerKey = newValue;
      //   this.subscriberListener = store.addEventListener(
      //     this.subscriberEventListenerKey,
      //     this._chartUpdater
      //   );
      let chartData = undefined;
      try {
        chartData = JSON.parse(newValue);
        this._chartUpdater(chartData.data);
      } catch (e) {
        console.error("Failed to update chart data.", e);
      }
    }
  }

  //   disconnectedCallback() {
  //     if (this.subscriberEventListenerKey)
  //       store.removeEventListener(
  //         this.subscriberEventListenerKey,
  //         this._chartUpdater
  //       );
  //   }

  _chartUpdater(chartData) {
    const svg = self.shadowRoot.querySelector("svg");
    let accumulatedDegree = 0;
    for (let i = 0; i < chartData.length; i++) {
      const entry = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      entry.setAttribute("class", "value");
      entry.setAttribute("cx", "125");
      entry.setAttribute("cy", "125");
      entry.setAttribute("r", "80");
      entry.setAttribute("stroke", getRandomizedHex());
      entry.setAttribute("stroke-width", DEFAULT_STROKE_WIDTH);
      entry.setAttribute("fill", "none");
      entry.setAttribute("stroke-dasharray", STEPS_UNTIL_FULL_CIRCLE);
      entry.setAttribute(
        "stroke-dashoffset",
        STEPS_UNTIL_FULL_CIRCLE - chartData[i].weight
      );
      entry.setAttribute(
        "style",
        `transform: rotate(${accumulatedDegree}deg);`
      );
      entry.setAttribute("title", chartData[i].name);
      entry.percentage = (100 / STEPS_UNTIL_FULL_CIRCLE) * chartData[i].weight;
      entry.assetName = chartData[i].name;

      entry.addEventListener("mouseenter", () => {
        entry.style.strokeWidth = "65";
        this.assetName.textContent = entry.assetName;
        this.percentage.textContent = `${entry.percentage.toFixed(1)} %`;
      });
      entry.addEventListener("mouseleave", () => {
        entry.style.strokeWidth = DEFAULT_STROKE_WIDTH;
        this.assetName.textContent = undefined;
        this.percentage.textContent = undefined;
      });

      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = chartData[i].name;
      entry.appendChild(title);
      svg.appendChild(entry);

      accumulatedDegree +=
        (360 / STEPS_UNTIL_FULL_CIRCLE) * chartData[i].weight;
    }

    this.assetName = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    this.assetName.style.color = "#000000";
    this.assetName.setAttributeNS(null, "x", "50%");
    this.assetName.setAttributeNS(null, "y", "50%");
    this.assetName.setAttributeNS(null, "text-anchor", "middle");
    svg.appendChild(this.assetName);

    this.percentage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    this.percentage.style.color = "#000000";
    this.percentage.setAttributeNS(null, "x", "50%");
    this.percentage.setAttributeNS(null, "y", "60%");
    this.percentage.setAttributeNS(null, "text-anchor", "middle");
    svg.appendChild(this.percentage);
  }
}

customElements.define("hk-chart", Chart);
