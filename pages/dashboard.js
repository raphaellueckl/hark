import "../components/asset-overview.js";
import "../components/chart/chart-section.js";
import { title } from "../css-globals.js";

export const dashboardPage = `
<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    hk-asset-overview {
        display: block;
        margin-top: 50px;
    }

    ${title}
</style>

<div class="content">
    <h1 class="title">Dashboard</h1>
    <div>
        <hk-asset-spread-chart></hk-asset-spread-chart>
        <hk-asset-overview></hk-asset-overview>
    </div>
</div>`;
