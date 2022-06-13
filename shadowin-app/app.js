const {app, BrowserWindow, globalShortcut} = require('electron')
const path = require('path')

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        opacity: 0.4,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadURL('http://stock.plusii.com')
}

app.whenReady().then(() => {
    createWindow()

    const ret = globalShortcut.register('CommandOrControl+X', () => {
        console.log('CommandOrControl+X is pressed')
    })

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
