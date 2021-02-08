import "../components/backup-restore.js";

export const settingsPage = `
<style>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>

<div class="content">
    <h1>Settings</h1>
    <hk-backup-restore></hk-backup-restore>
</div>`;
