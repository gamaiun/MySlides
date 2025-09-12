const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openImageDialog: () => ipcRenderer.send("open-image-dialog"),
  onImageSelected: (callback) => ipcRenderer.on("image-selected", callback),
  onMenuBrowseImage: (callback) =>
    ipcRenderer.on("open-image-dialog-from-menu", callback),
  saveAsPDF: (options) => ipcRenderer.invoke("save-as-pdf", options),
  onPDFSaved: (callback) => ipcRenderer.on("pdf-saved", callback),
  startSnip: () => ipcRenderer.send("start-snip"),
  onMenuPrint: (callback) => ipcRenderer.on("menu-print", callback),
  onMenuSnip: (callback) => ipcRenderer.on("menu-snip", callback),
  openDevTools: () => ipcRenderer.send("open-dev-tools"),
  saveData: (data) => ipcRenderer.send("save-data", data),
  onSnipImage: (callback) => ipcRenderer.on("snip-image", callback),
  onTriggerSaveData: (callback) =>
    ipcRenderer.on("trigger-save-data", callback),
  loadData: () => ipcRenderer.invoke("load-data"),
  sendSelectedEntry: (entry) => ipcRenderer.send("send-selected-entry", entry),
  onSelectedEntry: (callback) =>
    ipcRenderer.on("selected-entry", (event, data) => callback(data)),
});
