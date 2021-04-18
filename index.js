// import Router from "./router.js";
// import { manageAssetsPage } from "./pages/manage.js";
// import { dashboardPage } from "./pages/dashboard.js";
// import { fiatTransactionsPage } from "./pages/fiat-transactions.js";
// import { settingsPage } from "./pages/settings.js";
// import "./components/navbar.js";

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

  connectedCallback() {
    fetch(
      "https://yahoo-finance-low-latency.p.rapidapi.com/v8/finance/chart/AAPL?comparisons=MSFT%2C%5EVIX&events=div%2Csplit",
      {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "9443d3239cmsh5793b8156e3a879p1ea1ffjsnb3226d275259",
          "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        debugger;
        console.log(data);
      })
      .catch((err) => {
        debugger;
        console.error(err);
      });
    // const router = new Router();

    // router.defineError(() => {
    //   document.querySelector("#root").innerHTML = "404 - This page does not exist!";
    // });

    // router
    //   .add("/", () => {
    //     this.shadowRoot.querySelector("#root").innerHTML = dashboardPage;
    //   })
    //   .add("/manage", () => {
    //     this.shadowRoot.querySelector("#root").innerHTML = manageAssetsPage;
    //   })
    //   .add("/transactions", () => {
    //     this.shadowRoot.querySelector("#root").innerHTML = fiatTransactionsPage;
    //   })
    //   .add("/settings", () => {
    //     this.shadowRoot.querySelector("#root").innerHTML = settingsPage;
    //   });
  }
}

customElements.define("hk-app", App);
