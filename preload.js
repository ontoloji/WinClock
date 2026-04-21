const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("winClock", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  updateSettings: (patch) => ipcRenderer.invoke("update-settings", patch),
  selectFont: () => ipcRenderer.invoke("select-font"),
  resetPosition: () => ipcRenderer.invoke("reset-position"),
  onSettingsUpdated: (handler) => {
    const listener = (_event, data) => handler(data);
    ipcRenderer.on("settings-updated", listener);
    return () => ipcRenderer.removeListener("settings-updated", listener);
  }
});
