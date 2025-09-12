const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  nativeTheme,
} = require("electron");

// app.commandLine.appendSwitch("--disable-cache"); // Disable disk cache
// app.commandLine.appendSwitch("--disable-gpu"); // Disable GPU acceleration (if needed)

const fs = require("fs");
const path = require("path");

let mainWindow; // Global reference to the main window

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
    y: 0, // Position the window at the top of the screen
    x: undefined, // Keep the default horizontal centering
    autoHideMenuBar: false, // Ensure the taskbar remains visible
    frame: true, // Ensure the window frame is visible
    skipTaskbar: false, // Ensure the app is not hidden from the taskbar
    fullscreen: false, // Disable fullscreen mode to ensure the taskbar is visible

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // win.webContents.openDevTools();
  win.loadFile("index.html");

  // Set the global reference
  mainWindow = win;
  console.log("Main window created, id:", win.id);
  // Add custom menu with Browse Image next to Help
  const template = [
    {
      label: "         ", // ~50px of spaces (adjust as needed)
      enabled: false, // Disabled so it's not clickable
    },
    {
      label: "Save",
      click: () => {
        // Send IPC to renderer to trigger save
        const allWindows = BrowserWindow.getAllWindows().filter(
          (w) =>
            !w.isDestroyed() && w.webContents && !w.webContents.isDestroyed()
        );
        allWindows.forEach((w) => {
          try {
            w.webContents.send("trigger-save-data");
          } catch (e) {
            // ignore send failures
          }
        });
      },
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
      label: "Import",
      click: () => {
        win.webContents.send("open-image-dialog-from-menu");
      },
    },
    {
      label: "Calculator",
      click: () => {
        const calcWin = new BrowserWindow({
          width: 400,
          height: 300,
          useContentSize: true,
          resizable: false,
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
          },
        });
        calcWin.loadFile("calculator.html");
      },
    },
    {
      label: "Assumptions",
      click: () => {
        createAssumptionsWindow();
      },
    },
    {
      label: "Archive",
      click: () => {
        createArchiveWindow();
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createChartWindow() {
  const chartWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Chart",
    webPreferences: {
      // For a simple page loading a CDN script, these are safer defaults.
      nodeIntegration: false,
      contextIsolation: true,
      // You might not even need to specify webPreferences if these are the defaults.
    },
  });
  chartWindow.loadFile("chart.html"); // We'll create this file next
}

function createAssumptionsWindow() {
  // Read the assumptions.txt file
  const assumptionsFilePath = path.join(__dirname, "assumptions.txt");
  let assumptionsText = "Error: Could not load assumptions.txt file.";

  try {
    assumptionsText = fs.readFileSync(assumptionsFilePath, "utf-8");
  } catch (error) {
    console.error("Failed to read assumptions.txt:", error);
  }

  // Create a new window to display the text
  const assumptionsWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title: "Assumptions",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Create a simple HTML page with the text
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Assumptions</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
      </style>
    </head>
    <body>
      <h1>Assumptions</h1>
      <pre>${assumptionsText}</pre>
    </body>
    </html>
  `;

  assumptionsWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
  );
}

function createArchiveWindow() {
  const archiveWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    menuBarVisible: false, // Hide the menu bar
  });
  archiveWindow.loadFile("archive.html");
  archiveWindow.setMenu(null); // Explicitly remove the menu
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

ipcMain.on("open-dev-tools", (event) => {
  event.sender.openDevTools();
});

// In main.js, after the existing ipcMain handlers
ipcMain.on("save-data", (event, data) => {
  const dataFilePath = path.join(__dirname, "data.json");

  // Read existing data or initialize empty array
  let existingData = [];
  try {
    const fileContent = fs.readFileSync(dataFilePath, "utf-8");
    existingData = JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist or is invalid, start with empty array
  }

  // Append new data
  existingData.push(data);

  // Write back to file
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Failed to save data:", error);
  }
});

// Add IPC handler to load data
ipcMain.handle("load-data", async () => {
  try {
    const dataPath = path.join(__dirname, "data.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    return data;
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
});

ipcMain.on("send-selected-entry", (event, entry) => {
  console.log("Received entry in main process:", entry);
  console.log(
    "Main window id when sending:",
    mainWindow.id,
    "isDestroyed:",
    mainWindow.isDestroyed()
  );
  if (
    mainWindow &&
    !mainWindow.isDestroyed() &&
    mainWindow.webContents &&
    !mainWindow.webContents.isDestroyed()
  ) {
    console.log("Forwarding entry to main window after delay");
    setTimeout(() => {
      mainWindow.webContents.send("selected-entry", entry);
      console.log("Event sent to main window");
    }, 500); // 500ms delay
  } else {
    console.error("Main window not available to send selected entry.");
  }
});

// Set dark theme
nativeTheme.themeSource = "dark";
