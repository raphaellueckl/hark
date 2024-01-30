import Router from "./router.js";
import { manageAssetsPage } from "./pages/manage.js";
import { dashboardPage } from "./pages/dashboard.js";
import { fiatTransactionsPage } from "./pages/fiat-transactions.js";
import { settingsPage } from "./pages/settings.js";
import { store } from "./store.js";
import "./components/navbar.js";
import "./components/notification.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
    :host {
      max-width: 1400px;
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
<hk-notification id="notifications"></hk-notification>
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

    if (!Array.prototype.groupBy) {
      Array.prototype.groupBy = function (f) {
        var groups = {};
        this.forEach(function (o) {
          var group = JSON.stringify(f(o));
          groups[group] = groups[group] || [];
          groups[group].push(o);
        });

        return Object.keys(groups).map(function (group) {
          return groups[group];
        });
      };
    }
  }

  handleSwipeGestures = (router) => {
    const tolerance = 50;
    let touchstartX = 0;
    let touchendX = 0;

    const slider = document.querySelector("body");

    function handleGesture() {
      if (touchendX < touchstartX - tolerance) router.previous();
      if (touchendX > touchstartX + tolerance) router.next();
    }

    slider.addEventListener("touchstart", (e) => {
      touchstartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener("touchend", (e) => {
      touchendX = e.changedTouches[0].screenX;
      handleGesture();
    });
  };

  connectedCallback() {
    const router = new Router();

    router.defineError(() => {
      document
        .querySelector("hk-app")
        .shadowRoot.querySelector("#root").innerHTML =
        "404 - This page does not exist!";
    });

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

    store.setNotificationElement(
      this.shadowRoot.querySelector("#notifications")
    );

    this.handleSwipeGestures(router);
  }
}

customElements.define("hk-app", App);
