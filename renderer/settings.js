const els = {
  clockColor: document.getElementById("clockColor"),
  clockScale: document.getElementById("clockScale"),
  scaleValue: document.getElementById("scaleValue"),
  showDate: document.getElementById("showDate"),
  clickThrough: document.getElementById("clickThrough"),
  lockPosition: document.getElementById("lockPosition"),
  alwaysOnBottom: document.getElementById("alwaysOnBottom"),
  openAtLogin: document.getElementById("openAtLogin"),
  selectFont: document.getElementById("selectFont"),
  clearFont: document.getElementById("clearFont"),
  fontPath: document.getElementById("fontPath"),
  resetPosition: document.getElementById("resetPosition")
};

let currentSettings = null;

function render(settings) {
  currentSettings = settings;
  els.clockColor.value = settings.clockColor;
  els.clockScale.value = settings.clockScale;
  els.scaleValue.textContent = `${Number(settings.clockScale).toFixed(2)}x`;
  els.showDate.checked = settings.showDate;
  els.clickThrough.checked = settings.clickThrough;
  els.lockPosition.checked = settings.lockPosition;
  els.alwaysOnBottom.checked = settings.alwaysOnBottom;
  els.openAtLogin.checked = settings.openAtLogin;
  els.fontPath.textContent = settings.fontPath || "Varsayılan font kullanılıyor.";
}

async function pushPatch(patch) {
  const updated = await window.winClock.updateSettings(patch);
  render(updated);
}

els.clockColor.addEventListener("input", () => {
  pushPatch({ clockColor: els.clockColor.value });
});

els.clockScale.addEventListener("input", () => {
  pushPatch({ clockScale: Number(els.clockScale.value) });
});

els.showDate.addEventListener("change", () => {
  pushPatch({ showDate: els.showDate.checked });
});

els.clickThrough.addEventListener("change", () => {
  pushPatch({ clickThrough: els.clickThrough.checked });
});

els.lockPosition.addEventListener("change", () => {
  pushPatch({ lockPosition: els.lockPosition.checked });
});

els.alwaysOnBottom.addEventListener("change", () => {
  pushPatch({ alwaysOnBottom: els.alwaysOnBottom.checked });
});

els.openAtLogin.addEventListener("change", () => {
  pushPatch({ openAtLogin: els.openAtLogin.checked });
});

els.selectFont.addEventListener("click", async () => {
  const result = await window.winClock.selectFont();
  if (!result.canceled) {
    const settings = await window.winClock.getSettings();
    render(settings);
  }
});

els.clearFont.addEventListener("click", () => {
  pushPatch({ fontPath: "", fontFamily: "Segoe UI" });
});

els.resetPosition.addEventListener("click", async () => {
  await window.winClock.resetPosition();
});

window.winClock.onSettingsUpdated((settings) => {
  render(settings);
});

window.winClock.getSettings().then(render);
