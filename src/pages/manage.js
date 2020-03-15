import "../components/add-asset.js";

export const manageAssetsPage = `
<style>
</style>

<h1>Assets</h1>

<div class="content">
    <div class="text">
        <p>Asset management content</p>
    </div>
    <hk-add-asset></hk-add-asset>
    <ul>
        <li>
            <label>Asset: <input></label>
            <label>Symbol: <input></label>
            <label>Category: <input></label>
            <label>Amount: <input></label>
        </li>
    </ul>
</div>
`;
