import { databaseConnector } from "../data/database-connector.js";

import "./button.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    hk-button {
      display:inline;
    }

    div {
      margin: 10px;
      display: flex;
      align-items: center;
    }

    #file-upload-button {
      display:none;
    }
  </style>
  <div>
    <label>Backup & Export:</label>
    <hk-button id="export">Export</hk-button>
  </div>
  <div>
    <label>Import & Restore:</label>
    <input id="import-file-hidden-button" type="file" style="display:none;"></input>
    <hk-button id="import">Import</hk-button>
  </div>
  <div>
    <label>Clear Database:</label>
    <hk-button>Boom!</hk-button>
  </div>
`;

class ExportApplicationState extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const exportButton = this.shadowRoot.querySelector("#export");
    const importButton = this.shadowRoot.querySelector("#import");
    const hiddenImportFileButton = this.shadowRoot.querySelector(
      "#import-file-hidden-button"
    );

    exportButton.addEventListener("click", () => {
      const appState = databaseConnector.getApplicationStateAsString();
      const blob = new Blob([appState], { type: "text/json" });
      const fileName = `hark_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      const tempElement = document.createElement("a");
      const url = URL.createObjectURL(blob);
      tempElement.href = url;
      tempElement.download = fileName;
      document.body.appendChild(tempElement);
      tempElement.click();

      setTimeout(function () {
        document.body.removeChild(tempElement);
        window.URL.revokeObjectURL(url);
      });
    });

    importButton.addEventListener("click", (event) => {
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
        console.log("Error when loading file!");
      };
    });
  }
}

customElements.define("hk-backup-restore", ExportApplicationState);
