import Router from "./router.js";
import { manageAssetsPage } from "./pages/manage.js";

// import "./components/navbar.js";

const router = new Router();

// router.defineError(() => {
//   document.querySelector("#root").innerHTML = "404 - This page does not exist!";
// });

router.add("/", () => {
  console.log(manageAssetsPage);
  document.querySelector("#root").innerHTML = manageAssetsPage;
});
//   .add("/login", () => {
//     document.querySelector("#root").innerHTML = loginPage;
//   })
//   .add("/random", () => {
//     document.querySelector("#root").innerHTML = randomPage;
//   })
//   .add("/about", () => {
//     document.querySelector("#root").innerHTML = aboutPage;
//   });
