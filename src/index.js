import Router from "./router.js";
import { manageAssetsPage } from "./pages/manage.js";
import { dashboardPage } from "./pages/dashboard.js";
import { fiatTransactionsPage } from "./pages/fiat-transactions.js";
import { settingsPage } from "./pages/settings.js";

import "./components/navbar.js";

const router = new Router();

// router.defineError(() => {
//   document.querySelector("#root").innerHTML = "404 - This page does not exist!";
// });

router
  .add("/", () => {
    document.querySelector("#root").innerHTML = dashboardPage;
  })
  .add("/manage", () => {
    document.querySelector("#root").innerHTML = manageAssetsPage;
  })
  .add("/transactions", () => {
    document.querySelector("#root").innerHTML = fiatTransactionsPage;
  })
  .add("/settings", () => {
    document.querySelector("#root").innerHTML = settingsPage;
  });
