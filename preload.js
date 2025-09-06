const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openImageDialog: () => ipcRenderer.send("open-image-dialog"),
  onImageSelected: (callback) => ipcRenderer.on("image-selected", callback),
  onMenuBrowseImage: (callback) =>
    ipcRenderer.on("open-image-dialog-from-menu", callback),
  saveAsPDF: (options) => ipcRenderer.invoke("save-as-pdf", options),
  onPDFSaved: (callback) => ipcRenderer.on("pdf-saved", callback),
});
