import "./button.js";
import { BREAKPOINT_TABLET } from "../css-globals.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
.modal {
    display: none;
    position: fixed;
    z-index: 1;
    padding-top: 100px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }

  .modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;

    margin: auto;
    padding: 10px;
    background: #fff;
    border: 1px solid #888;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
    
    animation-name: animatetop;
    animation-duration: 0.2s
  }
  
  @keyframes animatetop {
    from {
        top: -400px;
        opacity: 0;
    }
    to {
        top: 0;
        opacity: 1;
    }
  }

  .modal-header {
      display: flex;
  }
  
  .modal-body {
  }
  
  .modal-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  @media(min-width: ${BREAKPOINT_TABLET}px) {
    .modal-content {
      width: 30%;
    }
    
    .modal-footer {
      width: 80%;
    }
  }

  .modal-text {
    text-align: center;
  }

  hk-button {
      margin: 15px 20px;
  }
</style>

<div class="modal">

  <div class="modal-content">
    <div class="modal-header">
        <h2>Delete?</h2>
    </div>
    <div class="modal-body">
      <p class="modal-text">
        <slot></slot>
      </p>
    </div>
    <div class="modal-footer">
      <hk-button class="decline">No</hk-button>
      <hk-button class="accept">Delete!</hk-button>
    </div>
  </div>

</div>`;

class Modal extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.modal = this.shadowRoot.querySelector(".modal");
    this.closeButton = this.shadowRoot.querySelector(".decline");
    this.successButton = this.shadowRoot.querySelector(".accept");
  }

  static get observedAttributes() {
    return ["open", "data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      if (newValue === "") {
        this.modal.style.display = "block";
      } else {
        this.modal.style.display = "none";
      }
    } else if (name === "data") {
    }
  }

  connectedCallback() {
    this.modal.addEventListener("click", (ev) => {
      if (ev.target === this.modal || ev.target === this.closeButton) {
        this.removeAttribute("open");
        this.onDecline();
      }
    });

    this.successButton.addEventListener("click", () => {
      this.removeAttribute("open");
      this.onAccept();
    });
  }
}

customElements.define("hk-modal", Modal);
