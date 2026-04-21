const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage, screen } = require("electron");
const path = require("path");
const fs = require("fs");

let tray = null;
let clockWindow = null;
let settingsWindow = null;

const defaultSettings = {
  clockColor: "#f5f5f5",
  fontFamily: "Segoe UI",
  fontPath: "",
  clockScale: 1,
  showDate: true,
  clickThrough: false,
  lockPosition: false,
  alwaysOnBottom: true,
  bounds: null,
  openAtLogin: true
};

const settingsFile = () => path.join(app.getPath("userData"), "settings.json");

function loadSettings() {
  try {
    const raw = fs.readFileSync(settingsFile(), "utf8");
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(nextSettings) {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify(nextSettings, null, 2), "utf8");
}

let appSettings = defaultSettings;

function getClockBounds() {
  const display = screen.getPrimaryDisplay().workAreaSize;
  return {
    width: 320,
    height: 120,
    x: Math.floor(display.width - 340),
    y: 30
  };
}

function createClockWindow() {
  const bounds = appSettings.bounds || getClockBounds();

  clockWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    transparent: true,
    frame: false,
    resizable: true,
    movable: !appSettings.lockPosition,
    alwaysOnTop: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  clockWindow.setMenuBarVisibility(false);
  clockWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  clockWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      clockWindow.hide();
    }
  });

  clockWindow.on("move", persistBounds);
  clockWindow.on("resize", persistBounds);
  clockWindow.on("show", applyWindowFlags);
  clockWindow.on("focus", () => {
    if (appSettings.alwaysOnBottom) {
      clockWindow.blur();
    }
  });

  applyWindowFlags();
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 560,
    title: "WinClock Ayarlar",
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.loadFile(path.join(__dirname, "renderer", "settings.html"));

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function createTray() {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="#e2e8f0"/>
      <line x1="8" y1="8" x2="8" y2="4" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="8" y1="8" x2="11" y2="9.5" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `);
  const trayIcon = nativeImage.createFromDataURL(`data:image/svg+xml,${svg}`);
  tray = new Tray(trayIcon);
  tray.setToolTip("WinClock");
  refreshTrayMenu();

  tray.on("double-click", () => {
    if (!clockWindow) return;
    if (clockWindow.isVisible()) {
      clockWindow.hide();
      return;
    }
    appSettings.alwaysOnBottom ? clockWindow.showInactive() : clockWindow.show();
  });
}

function refreshTrayMenu() {
  if (!tray) return;

  const menu = Menu.buildFromTemplate([
    {
      label: clockWindow && clockWindow.isVisible() ? "Saati Gizle" : "Saati Göster",
      click: () => {
        if (!clockWindow) return;
        if (clockWindow.isVisible()) {
          clockWindow.hide();
          return;
        }
        appSettings.alwaysOnBottom ? clockWindow.showInactive() : clockWindow.show();
      }
    },
    {
      label: "Ayarlar",
      click: () => createSettingsWindow()
    },
    { type: "separator" },
    {
      label: "Masaüstünde Tıklanamaz (Click-through)",
      type: "checkbox",
      checked: appSettings.clickThrough,
      click: (item) => {
        appSettings.clickThrough = item.checked;
        saveAndBroadcast();
      }
    },
    {
      label: "Konumu Kilitle",
      type: "checkbox",
      checked: appSettings.lockPosition,
      click: (item) => {
        appSettings.lockPosition = item.checked;
        saveAndBroadcast();
      }
    },
    {
      label: "Diğer Pencerelerin Altında Tut",
      type: "checkbox",
      checked: appSettings.alwaysOnBottom,
      click: (item) => {
        appSettings.alwaysOnBottom = item.checked;
        saveAndBroadcast();
      }
    },
    {
      label: "Windows ile Başlat",
      type: "checkbox",
      checked: appSettings.openAtLogin,
      click: (item) => {
        appSettings.openAtLogin = item.checked;
        saveAndBroadcast();
      }
    },
    { type: "separator" },
    {
      label: "Çıkış",
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(menu);
}

function persistBounds() {
  if (!clockWindow || clockWindow.isDestroyed()) return;
  appSettings.bounds = clockWindow.getBounds();
  saveSettings(appSettings);
}

function applyWindowFlags() {
  if (!clockWindow || clockWindow.isDestroyed()) return;
  // Keep normal z-order; "always on bottom" mode is achieved via inactive show + focus blur.
  clockWindow.setAlwaysOnTop(false);
  clockWindow.setIgnoreMouseEvents(appSettings.clickThrough, { forward: true });
  clockWindow.setMovable(!appSettings.lockPosition);
  app.setLoginItemSettings({
    openAtLogin: appSettings.openAtLogin,
    path: process.execPath,
    args: ["--hidden"]
  });
}

function saveAndBroadcast() {
  saveSettings(appSettings);
  applyWindowFlags();
  refreshTrayMenu();
  if (clockWindow && !clockWindow.isDestroyed()) {
    clockWindow.webContents.send("settings-updated", appSettings);
  }
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send("settings-updated", appSettings);
  }
}

ipcMain.handle("get-settings", () => appSettings);

ipcMain.handle("update-settings", (_event, patch) => {
  appSettings = { ...appSettings, ...patch };
  saveAndBroadcast();
  return appSettings;
});

ipcMain.handle("select-font", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Fonts", extensions: ["ttf", "otf", "woff", "woff2"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const selected = result.filePaths[0];
  appSettings.fontPath = selected;
  appSettings.fontFamily = "WinClockCustom";
  saveAndBroadcast();

  return { canceled: false, path: selected };
});

ipcMain.handle("reset-position", () => {
  if (!clockWindow) return;
  const next = getClockBounds();
  clockWindow.setBounds(next);
  appSettings.bounds = next;
  saveAndBroadcast();
});

app.whenReady().then(() => {
  appSettings = loadSettings();
  // Migrate legacy setting key.
  if (typeof appSettings.alwaysOnBottom !== "boolean") {
    appSettings.alwaysOnBottom = true;
  }
  delete appSettings.alwaysOnTop;

  app.setLoginItemSettings({
    openAtLogin: appSettings.openAtLogin,
    path: process.execPath,
    args: ["--hidden"]
  });

  createClockWindow();
  createTray();

  if (process.argv.includes("--hidden")) {
    clockWindow.hide();
  }

  clockWindow.webContents.once("did-finish-load", () => {
    clockWindow.webContents.send("settings-updated", appSettings);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createClockWindow();
    }
    if (appSettings.alwaysOnBottom) {
      clockWindow.showInactive();
    } else {
      clockWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Tray'de çalışmaya devam etmek için kapatılmıyor.
  }
});
