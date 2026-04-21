const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");

let currentSettings = null;
let fontStyleEl = null;

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

function safeFileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/")}`;
}

function applyFont(settings) {
  if (fontStyleEl) {
    fontStyleEl.remove();
    fontStyleEl = null;
  }

  if (!settings.fontPath) {
    document.documentElement.style.setProperty("--clock-font", `"${settings.fontFamily}", sans-serif`);
    return;
  }

  const src = safeFileUrl(settings.fontPath);
  fontStyleEl = document.createElement("style");
  fontStyleEl.textContent = `
    @font-face {
      font-family: "WinClockCustom";
      src: url("${src}");
      font-display: swap;
    }
  `;
  document.head.appendChild(fontStyleEl);
  document.documentElement.style.setProperty("--clock-font", `"WinClockCustom", "${settings.fontFamily}", sans-serif`);
}

function applySettings(settings) {
  currentSettings = settings;
  const opacity = Math.max(0, Math.min(1, Number(settings.clockOpacity)));

  document.documentElement.style.setProperty("--clock-color", settings.clockColor);
  document.documentElement.style.setProperty("--clock-scale", String(settings.clockScale));
  document.documentElement.style.setProperty("--clock-opacity", String(Number.isNaN(opacity) ? 1 : opacity));

  applyFont(settings);

  dateEl.style.display = settings.showDate ? "block" : "none";
}

function tick() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("tr-TR", { hour12: false });
  dateEl.textContent = dateFormatter.format(now);
}

window.winClock.onSettingsUpdated((settings) => {
  applySettings(settings);
});

window.winClock.getSettings().then((settings) => {
  applySettings(settings);
  tick();
});

setInterval(tick, 250);

window.addEventListener("wheel", (event) => {
  if (!event.ctrlKey || !currentSettings) return;
  event.preventDefault();

  const delta = event.deltaY > 0 ? -0.05 : 0.05;
  const nextScale = Math.max(0.5, Math.min(4, Number((currentSettings.clockScale + delta).toFixed(2))));

  if (nextScale === currentSettings.clockScale) return;

  window.winClock.updateSettings({ clockScale: nextScale }).then((updated) => {
    currentSettings = updated;
    applySettings(updated);
  });
}, { passive: false });
