import "../components/dashboard.js";
import "../components/asset-spread-chart.js";

export const dashboardPage = `
<style>
</style>

<h1>Dashboard</h1>
<hk-asset-spread-chart id="assets-spread" chart-subscriber="updated_assets-price" title="Asset Spread" content='[{"label":"BTC", "value":40},{"label":"ETH", "value":60},{"label":"IOTA", "value":10}]'></hk-asset-spread-chart>
<div class="content">
    <hk-dashboard></hk-dashboard>
</div>
`;
