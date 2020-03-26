import Router from "./router.js";
import { manageAssetsPage } from "./pages/manage.js";
import { dashboardPage } from "./pages/dashboard.js";

import "./components/navbar.js";

// import "./components/navbar.js";

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
  });
//   .add("/random", () => {
//     document.querySelector("#root").innerHTML = randomPage;
//   })
//   .add("/about", () => {
//     document.querySelector("#root").innerHTML = aboutPage;
//   });
