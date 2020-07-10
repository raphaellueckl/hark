import { databaseConnector } from "../data/database-connector.js";
import { resetUL, ITEM_BACKGROUND } from "../css-globals.js";

import "./button.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    ${resetUL}

    hk-button {
      display:inline;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
  
      margin: 5px 0;
    }

    #file-upload-button {
      display:none;
    }

    .menu-container {
      display: flex;
      flex-direction: column;
  
      background-color: ${ITEM_BACKGROUND};
      border-radius: 15px;
      padding: 20px;
      margin: 20px;
    }

    .input-label {
      margin-right: 5px;
    }
  </style>
  <ul class="menu-container">
    <li>
      <label class="input-label">Backup & Export:</label>
      <hk-button id="export">Export</hk-button>
      <a id="hidden-export-button" download="hark_backup_${
        new Date().toISOString().split("T")[0]
      }.json" href style="display:none;"></a>
    </li>
    <li>
      <label class="input-label">Import & Restore:</label>
      <input id="import-file-hidden-button" type="file" style="display:none;"></input>
      <hk-button id="import">Import</hk-button>
    </li>
    <li>
      <label class="input-label">Reset Database:</label>
      <hk-button id="clear-database">Boom!</hk-button>
    </li>
  </ul>
`;

class ExportApplicationState extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const exporFakeButton = this.shadowRoot.querySelector(
      "#hidden-export-button"
    );
    const exportButton = this.shadowRoot.querySelector("#export");
    const importButton = this.shadowRoot.querySelector("#import");
    const hiddenImportFileButton = this.shadowRoot.querySelector(
      "#import-file-hidden-button"
    );
    const clearDatabaseButton = this.shadowRoot.querySelector(
      "#clear-database"
    );

    exportButton.addEventListener("click", () => {
      const appState = databaseConnector.getApplicationStateAsString();
      exporFakeButton.setAttribute("href", "data:text/json;," + appState);
      exporFakeButton.click();
    });

    importButton.addEventListener("click", () => {
      hiddenImportFileButton.click();
    });

    hiddenImportFileButton.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");

      reader.onload = function (evt) {
        const backupAsString = evt.target.result;
        databaseConnector.setApplicationStateFromString(backupAsString);
      };
      reader.onerror = function (evt) {
        console.log("Error when loading file!", evt);
      };
    });

    clearDatabaseButton.addEventListener("click", (ev) => {
      databaseConnector.clearDatabase();
    });
  }
}

customElements.define("hk-backup-restore", ExportApplicationState);
