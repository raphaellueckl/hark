import "../components/fiat/fiat-transaction-list.js";
import "../components/fiat/add-fiat-transaction.js";
import { title } from "../css-globals.js";

export const fiatTransactionsPage = `
<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    ${title}
</style>

<div class="content">
    <h1 class="title">Fiat Transactions</h1>
    <p>Your transfers from and to the bank.</p>
    <hk-add-fiat-transaction></hk-add-fiat-transaction>
    <hk-fiat-transaction-list></hk-fiat-transaction-list>
</div>`;
