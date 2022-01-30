const { app, BrowserWindow, ipcMain } = require("electron")
const { autoUpdater } = require("electron-updater")

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })
    mainWindow.loadFile("index.html")

    mainWindow.on("closed", function () {
        mainWindow = null
    })

    // check for updates
    mainWindow.once("ready-to-show", () => {
        autoUpdater.checkForUpdatesAndNotify()
    })

    mainWindow.webContents.openDevTools()
}

app.on("ready", () => {
    createWindow()
})

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow()
    }
})

// handler for app_version event, sending the version to window
ipcMain.on("app_version", (event) => {
    event.sender.send("app_version", { version: app.getVersion() })
})

// handler for restart-app event, let autoUpdater to his job
ipcMain.on("restart-app", () => {
    autoUpdater.quitAndInstall()
})

autoUpdater.on("updates-available", () => {
    mainWindow.webContents.send("updates_available")
})

autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update_downloaded")
})
