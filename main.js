const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    // Use content size so the width/height refer to the web page content area
    // (this prevents window chrome from reducing the available content area).
    width: 1380,
    // Use content height requested by user
    height: 768,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
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
      label: "Print",
      click: () => {
        // Only send to still-alive windows to avoid 'Render frame was disposed' errors
        const allWindows = BrowserWindow.getAllWindows().filter(
          (w) =>
            !w.isDestroyed() && w.webContents && !w.webContents.isDestroyed()
        );
        allWindows.forEach((w) => {
          try {
            w.webContents.send("menu-print");
          } catch (e) {
            // ignore send failures from disposed frames
          }
        });
      },
    },
    {
      label: "Snip",
      click: () => {
        const allWindows = BrowserWindow.getAllWindows().filter(
          (w) =>
            !w.isDestroyed() && w.webContents && !w.webContents.isDestroyed()
        );
        allWindows.forEach((w) => {
          try {
            w.webContents.send("menu-snip");
          } catch (e) {}
        });
      },
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

// IPC handler for snipping tool
const { exec } = require("child_process");
ipcMain.on("start-snip", async (event) => {
  // Try launching Windows Snipping Tool (Windows 10/11)
  exec("SnippingTool.exe", (error) => {
    if (error) {
      // Fallback: Try Snip & Sketch (Windows 10+)
      exec("explorer.exe ms-screenclip:");
    }
  });
  // User can paste the result into the app
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
    // Send pdf-saved to the window's webContents (avoid event.sender which may be disposed)
    try {
      if (
        win &&
        !win.isDestroyed() &&
        win.webContents &&
        !win.webContents.isDestroyed()
      ) {
        win.webContents.send("pdf-saved", { success: true, filePath });
      }
    } catch (e) {
      // ignore send failures
    }
    return { success: true, filePath };
  } catch (error) {
    try {
      if (
        win &&
        !win.isDestroyed() &&
        win.webContents &&
        !win.webContents.isDestroyed()
      ) {
        win.webContents.send("pdf-saved", {
          success: false,
          error: error.message,
        });
      }
    } catch (e) {}
    return { success: false, error: error.message };
  }
});
