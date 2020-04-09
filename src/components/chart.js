import { store } from "../store.js";
import { databaseConnector } from "../data/database-connector.js";

const template = document.createElement("template");
const fullyLoaded = 503;
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
    </style>
    <div>
      <h2></h2>
      <svg height="250" width="250"></svg>
    </div>`;

const ALL_HEX_VALUES = "0123456789ABCDEF";

function getRandomizedHex() {
  return `#${[...Array(6)]
    .map(() => ALL_HEX_VALUES.charAt(Math.random() * 16))
    .join("")}`;
}

class Chart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["content", "title", "chart-subscriber"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title") {
      this.shadowRoot.querySelector("h2").textContent = newValue;
    } else if (name === "chart-subscriber") {
      // INIT

      store.addEventListener(newValue, ({ detail: assetList }) => {
        debugger;
        this._drawChart(assetList);
      });
      // this._drawChart(databaseConnector.getAssets());
    } else if (name === "content") {
      // try {
      //   const values = JSON.parse(newValue);
      //   const svg = this.shadowRoot.querySelector("svg");
      //   svg.textContent = "";
      //   const sumOfValues = values
      //     .map(v => +v.value)
      //     .reduce((a, b) => a + b, 0);
      //   console.log("sum", sumOfValues);
      //   let accumulatedDegree = 0;
      //   values.sort((a, b) => b.value - a.value);
      //   for (let i = 0; i < values.length; i++) {
      //     const weight = (fullyLoaded / sumOfValues) * Number(values[i].value);
      //     values[i].dashOffset = fullyLoaded - weight;
      //     const entry = document.createElementNS(
      //       "http://www.w3.org/2000/svg",
      //       "circle"
      //     );
      //     entry.setAttribute("class", "value");
      //     entry.setAttribute("cx", "125");
      //     entry.setAttribute("cy", "125");
      //     entry.setAttribute("r", "80");
      //     entry.setAttribute("stroke", getRandomizedHex());
      //     entry.setAttribute("stroke-width", "50");
      //     entry.setAttribute("fill", "none");
      //     entry.setAttribute("stroke-dasharray", fullyLoaded);
      //     entry.setAttribute("stroke-dashoffset", values[i].dashOffset);
      //     entry.setAttribute(
      //       "style",
      //       `transform: rotate(${accumulatedDegree}deg);`
      //     );
      //     entry.setAttribute("title", values[i].label);
      //     const title = document.createElementNS(
      //       "http://www.w3.org/2000/svg",
      //       "title"
      //     );
      //     title.textContent = values[i].label;
      //     entry.appendChild(title);
      //     svg.appendChild(entry);
      //     accumulatedDegree += (360 / fullyLoaded) * weight;
      //   }
      // } catch (err) {
      //   console.error(err);
      // }
    }
  }

  _drawChart(assetList) {
    try {
      const svg = this.shadowRoot.querySelector("svg");
      svg.textContent = "";
      debugger;
      const sumOfValues = assetList
        .map(v => +v.value)
        .reduce((a, b) => a + b, 0);
      console.log("sum", sumOfValues);

      let accumulatedDegree = 0;
      assetList.sort((a, b) => b.value - a.value);
      for (let i = 0; i < assetList.length; i++) {
        const weight = (fullyLoaded / sumOfValues) * Number(assetList[i].value);

        assetList[i].dashOffset = fullyLoaded - weight;

        const entry = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        entry.setAttribute("class", "value");
        entry.setAttribute("cx", "125");
        entry.setAttribute("cy", "125");
        entry.setAttribute("r", "80");
        entry.setAttribute("stroke", getRandomizedHex());
        entry.setAttribute("stroke-width", "50");
        entry.setAttribute("fill", "none");
        entry.setAttribute("stroke-dasharray", fullyLoaded);
        entry.setAttribute("stroke-dashoffset", assetList[i].dashOffset);
        entry.setAttribute(
          "style",
          `transform: rotate(${accumulatedDegree}deg);`
        );
        entry.setAttribute("title", assetList[i].label);

        const title = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "title"
        );
        title.textContent = assetList[i].label;
        entry.appendChild(title);
        svg.appendChild(entry);

        accumulatedDegree += (360 / fullyLoaded) * weight;
      }
    } catch (err) {
      console.error(err);
    }
  }
}

customElements.define("hk-chart", Chart);
