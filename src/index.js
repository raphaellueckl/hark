import Router from "./router.js";
import { manageAssetsPage } from "./pages/manage.js";
import { dashboardPage } from "./pages/dashboard.js";
import { fiatTransactionsPage } from "./pages/fiat-transactions.js";
import { settingsPage } from "./pages/settings.js";
import "./components/navbar.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
    :host {
      width: 100%;
      height: 100%;

      box-sizing: border-box;
      font-family: Georgia, "Times New Roman", Times, serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #root {
        flex: 1 0 auto;
    }

    footer {
        width: 80%;
        text-align: center;
        border-top: black 1px solid;
        padding: 17px 10px 12px 10px;
        margin-top: 10px;
        margin-bottom: 5px;
    }
</style>
<hk-navbar></hk-navbar>
<div id="root"></div>
<footer>
    © Made by codepleb | Help / Feedback: @codepleb (telegram), @codepleb4 (twitter)
</footer>
`;

class App extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const router = new Router();

    // router.defineError(() => {
    //   document.querySelector("#root").innerHTML = "404 - This page does not exist!";
    // });

    router
      .add("/", () => {
        this.shadowRoot.querySelector("#root").innerHTML = dashboardPage;
      })
      .add("/manage", () => {
        this.shadowRoot.querySelector("#root").innerHTML = manageAssetsPage;
      })
      .add("/transactions", () => {
        this.shadowRoot.querySelector("#root").innerHTML = fiatTransactionsPage;
      })
      .add("/settings", () => {
        this.shadowRoot.querySelector("#root").innerHTML = settingsPage;
      });
  }
}

customElements.define("hk-app", App);
