const template = document.createElement("template");
const fullyLoaded = 503;
template.innerHTML = `
    <style>
        :host {
            --percentage-value: 0;
        }
        
        #exact {
            transform-origin: center;
            transform: rotate(-90deg);
        }
    </style>
    <svg height="250" width="250">
        <circle id="background" cx="125" cy="125" r="80" stroke="lightgrey" stroke-width="50" fill="none" />
        <circle id="exact" cx="125" cy="125" r="80" stroke="blue" stroke-width="50" fill="none" stroke-dasharray="${fullyLoaded}" stroke-dashoffset="var(--percentage-value)" />
    </svg>
`;

class Chart extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.setPercentage(25);
  }

  setPercentage(percentage) {
    this.style.setProperty(
      "--percentage-value",
      fullyLoaded - (fullyLoaded / 100) * percentage
    );
  }
}

customElements.define("hk-chart", Chart);
