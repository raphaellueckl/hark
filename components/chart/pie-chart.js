import { widgetContainerStyles, resetUL } from "../../css-globals.js";
import "../spinner.js";

const template = document.createElement("template");

template.innerHTML = `
  <style>
    ${resetUL}
    ${widgetContainerStyles}

    .value {
        transform-origin: center;
    }

    circle {
      transition: stroke-width 0.2s;
    }

    .badge-container {
      width: 230px;
      height: 159px;
      margin-bottom: 10px;
      overflow: auto;
    }

    .legend {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 5px;
      margin: 2px;
      border-radius: 5px;
    }

    .hidden {
      display: none;
    }

    .full-label {
      width: 100%;
    }
  </style>
  <div class="widget-container">
    <h2></h2>
    <hk-spinner></hk-spinner>
    <svg height="176" width="176" class="hidden"></svg>
    <div class="badge-container">
      <ul class="legend hidden"></ul>
    </div>
  </div>`;

const ALL_HEX_VALUES = "0123456789ABCDEF";
const DEFAULT_STROKE_WIDTH = 30;
const STEPS_UNTIL_FULL_CIRCLE = 377;

function _getRandomHexColor() {
  const color = [...Array(6)]
    .map(() => ALL_HEX_VALUES.charAt(Math.random() * 16))
    .join("");

  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  if (luma < 130) {
    return _getRandomHexColor();
  } else {
    return `#${color}`;
  }
}

class PieChart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["title", "data", "selected"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title") {
      this.shadowRoot.querySelector("h2").textContent = newValue;
    } else if (name === "selected") {
      if (newValue) {
        this._highByAssetCompoundKey(newValue);
      } else {
        this._highByAssetCompoundKey();
      }
    } else if (name === "data") {
      this.shadowRoot.querySelector("hk-spinner").classList.add("hidden");
      this.shadowRoot.querySelector("svg").classList.remove("hidden");
      this.shadowRoot.querySelector("ul").classList.remove("hidden");
      /**
       * data: {name, value, weight, key}
       */
      let chartData = undefined;
      try {
        chartData = JSON.parse(newValue);
        this._chartUpdater(chartData.data, chartData.sumOfValues);
      } catch (e) {
        console.error("Failed to update chart data.", e);
      }
    }
  }

  _highlightEntry = (entry) => {
    entry.style.strokeWidth = String(DEFAULT_STROKE_WIDTH + 10);
    this.assetName.textContent = entry.assetName;
    this.percentage.textContent = `${entry.percentage.toFixed(1)} %`;
  };

  _unhighlightEntry = (entry) => {
    entry.style.strokeWidth = String(DEFAULT_STROKE_WIDTH);
    this.assetName.textContent = undefined;
    this.percentage.textContent = undefined;
  };

  /**
   * key: asset.category + asset.symbol
   */
  _highByAssetCompoundKey = (key) => {
    const circleFragments = [...this.shadowRoot.querySelectorAll("circle")];
    for (const asset of circleFragments) {
      if (asset.key !== key) {
        this._unhighlightEntry(asset);
      } else {
        this._highlightEntry(asset);
        break;
      }
    }
  };

  _chartUpdater(chartData, sumOfValues) {
    const svg = this.shadowRoot.querySelector("svg");
    let accumulatedDegree = 0;
    chartData.sort((a, b) =>
      a.weight < b.weight ? 1 : a.weight > b.weight ? -1 : 0
    );
    for (let i = 0; i < chartData.length; i++) {
      if (!chartData[i].weight) continue;
      const randomColor = _getRandomHexColor();
      const entry = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      entry.setAttribute("class", "value");
      entry.setAttribute("cx", "88");
      entry.setAttribute("cy", "88");
      entry.setAttribute("r", "60");
      entry.setAttribute("stroke", randomColor);
      entry.setAttribute("stroke-width", String(DEFAULT_STROKE_WIDTH));
      entry.setAttribute("fill", "none");
      entry.setAttribute("stroke-dasharray", STEPS_UNTIL_FULL_CIRCLE);
      entry.setAttribute(
        "stroke-dashoffset",
        STEPS_UNTIL_FULL_CIRCLE -
          (STEPS_UNTIL_FULL_CIRCLE / sumOfValues) * chartData[i].weight
      );
      entry.setAttribute(
        "style",
        `transform: rotate(${accumulatedDegree}deg);`
      );
      entry.setAttribute("title", chartData[i].name);
      entry.key = chartData[i].key;
      entry.percentage = (100 / sumOfValues) * chartData[i].weight;
      entry.assetName = chartData[i].name;

      entry.addEventListener("mouseenter", () => {
        this._highlightEntry(entry);
      });

      entry.addEventListener("mouseleave", () => {
        this._unhighlightEntry(entry);
      });

      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = chartData[i].name;
      entry.appendChild(title);
      svg.appendChild(entry);

      accumulatedDegree +=
        (360 / STEPS_UNTIL_FULL_CIRCLE) *
        (STEPS_UNTIL_FULL_CIRCLE / sumOfValues) *
        chartData[i].weight;

      const legendList = this.shadowRoot.querySelector(".legend");
      const legendItem = document.createElement("li");
      if (this.title === "Assets") {
        legendItem.classList.add("full-label");
        legendItem.innerHTML = `<span class="legend-item" style="background-color:${randomColor};">
        <span>${entry.percentage.toFixed(0)}% ${
          chartData[i].name
        }</span><span>${
          chartData[i].fixedValue
            ? chartData[i].fixedValue.toFixed(2)
            : chartData[i].value.toFixed(2)
        } CHF</span>`;
      } else {
        legendItem.innerHTML = `<span class="legend-item" style="background-color:${randomColor};">${entry.percentage.toFixed(
          0
        )}% ${chartData[i].name}</span>`;
      }

      legendList.appendChild(legendItem);

      legendItem.addEventListener("mouseover", () => {
        this._highlightEntry(entry);
      });

      legendItem.addEventListener("mouseleave", () => {
        this._unhighlightEntry(entry);
      });
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

customElements.define("hk-chart", PieChart);
