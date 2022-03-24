const template = document.createElement("template");
template.innerHTML = `
<style>
  :host {
    display: block;
    width: 100%;
    min-height: 30px;
  }

  #text {
    background-color: rgba(214, 18, 22, 0.7);
    margin: 0;
    padding: 5px 40px;
    transition: transform .2s ease-out;
    transform: scaleY(1);
    transform-origin: top;
  }
  
  #text:empty {
    transform: scaleY(0);
  }
</style>

<p id="text"></p>
`;

class Notification extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["text"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "text") {
      if (!this.shadowRoot.querySelector("#text").hasChildNodes()) {
        const text = document.createElement("span");
        text.textContent = newValue;
        this.shadowRoot.querySelector("#text").appendChild(text);

        setTimeout(() => {
          this.shadowRoot.querySelector("#text").removeChild(text);
        }, 5000);
      }
    }
  }
}

customElements.define("hk-notification", Notification);
