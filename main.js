const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");

  // Add custom menu with Browse Image next to Help
  const { Menu } = require("electron");
  const template = [
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [],
    },
    {
      label: "Browse Image",
      click: () => {
        win.webContents.send("open-image-dialog-from-menu");
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC handler for image dialog
ipcMain.on("open-image-dialog", async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    // filters: [
    //   {
    //     name: "Images",
    //     extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
    //   },
    //   { name: "All Files", extensions: ["*"] },
    // ],
  });
  if (!canceled && filePaths.length > 0) {
    event.sender.send("image-selected", filePaths[0]);
  }
});

// Listen for menu-triggered image dialog
ipcMain.on("open-image-dialog-from-menu", async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  if (!canceled && filePaths.length > 0) {
    event.sender.send("image-selected", filePaths[0]);
  }
});

// IPC handler for saving as PDF
ipcMain.handle("save-as-pdf", async (event, options) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return { success: false, error: "No window" };

  // Build default filename: YYYY-MM-DD-DayOfWeek-NYTime.pdf
  const now = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayAbbr = days[now.getDay()];
  const nyOptions = {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const nyTime = now.toLocaleTimeString("en-US", nyOptions).replace(":", "-");
  const dateStr = now.toISOString().slice(0, 10);
  const defaultFilename = `${dateStr}-${dayAbbr}-NY-${nyTime}.pdf`;
  const saveDir = "D:/MySlideScreenshots";
  const fs = require("fs");
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }
  const filePath = `${saveDir}/${defaultFilename}`;

  try {
    const pdfData = await win.webContents.printToPDF({
      landscape: true,
      printBackground: true,
      ...options,
    });
    fs.writeFileSync(filePath, pdfData);
    event.sender.send("pdf-saved", { success: true, filePath });
    // Trigger native print dialog after saving
    win.webContents.print({
      silent: false,
      printBackground: true,
      landscape: true,
    });
    return { success: true, filePath };
  } catch (error) {
    event.sender.send("pdf-saved", { success: false, error: error.message });
    return { success: false, error: error.message };
  }
});
