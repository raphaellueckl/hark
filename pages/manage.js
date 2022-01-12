import "../components/asset/add-asset.js";
import "../components/asset/manage-assets.js";
import { title } from "../css-globals.js";

export const manageAssetsPage = `
<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    ${title}
</style>

<div class="content">
    <h1 class="title">Assets</h1>
    <p>Update assets after a trade.</p>
    <hk-add-asset></hk-add-asset>
    <hk-manage-assets></hk-manage-assets>
</div>`;
