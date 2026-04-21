const { spawn } = require("child_process");
const path = require("path");

const electronBinary = require("electron");
const appEntry = path.join(__dirname);

const child = spawn(electronBinary, [appEntry], {
  detached: true,
  stdio: "ignore",
  windowsHide: true
});

child.unref();
