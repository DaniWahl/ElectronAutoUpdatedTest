const { app, BrowserWindow, ipcMain } = require("electron")
const { autoUpdater } = require("electron-updater")
const log = require("electron-log")

// setup logging
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"
log.info("App starting...")

let mainWindow

function sendStatusToWindow(text) {
    log.info(text)
    mainWindow.webContents.send("message", text)
}

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

autoUpdater.on("checking-for-update", () => {
    sendStatusToWindow("Checking for update...")
})

autoUpdater.on("updates-available", (info) => {
    sendStatusToWindow("Update available!")
    mainWindow.webContents.send("updates_available")
})
autoUpdater.on("updates-not-available", (info) => {
    sendStatusToWindow("You are running the latest version")
})
autoUpdater.on("update-downloaded", (info) => {
    sendStatusToWindow("Update downloaded and ready to install. (restart)")
    mainWindow.webContents.send("update_downloaded")
})
autoUpdater.on("error", (err) => {
    sendStatusToWindow("Error in auto-updater " + err)
})
autoUpdater.on("download-progress", (progressObj) => {
    let logMsg = "Downloaded " + progressObj.percent + "%"
    logMsg = logMsg + " (" + progressObj.bytesPerSecond + " Bytes/s)"
    sendStatusToWindow(logMsg)
})
