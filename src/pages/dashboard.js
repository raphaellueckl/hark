import "../components/dashboard.js";
import "../components/chart.js";

export const dashboardPage = `
<style>
</style>

<h1>Dashboard</h1>
<hk-chart percentage='[{"label":"BTC", "value":"40"},{"label":"ETH", "value":"60"},{"label":"IOTA", "value":"10"}]'></hk-chart>
<div class="content">
    <hk-dashboard></hk-dashboard>
</div>
`;
