const template = document.createElement("template");
template.innerHTML = `
<style>
    :host {
        display: flex;
        height: 200px;
    }

    .loader,
    .loader:before,
    .loader:after {
        background: rgb(214, 18, 22);
        animation: load1 1s infinite ease-in-out;
        width: 11px;
        height: 44px;
    }

    .loader {
        color: rgb(214, 18, 22);
        text-indent: -99999px;
        margin: 0px auto;
        position: relative;
        font-size: 11px;
        transform: translateZ(0);
        animation-delay: -0.16s;
    }

    .loader:before,
    .loader:after {
        position: absolute;
        top: 0;
        content: '';
    }

    .loader:before {
        left: -16.5px;
        animation-delay: -0.32s;
    }

    .loader:after {
        left: 16.5px;
    }

    @keyframes load1 {
        0%,
        80%,
        100% {
            box-shadow: 0 0;
            height: 44px;
        }
        40% {
            box-shadow: 0 -22px;
            height: 55px;
        }
    }

    .container {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<div class="container">
    <div class="loader"></div>
</div>`;

class Spinner extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {}
}

customElements.define("hk-spinner", Spinner);
