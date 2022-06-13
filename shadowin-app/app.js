const {app, BrowserWindow, globalShortcut} = require('electron');

if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 450,
        opacity: 0.6
    });
    mainWindow.loadURL('http://stock.plusii.com');
};

app.on('ready', () => {
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    //app.event
    createWindow();

    const ret = globalShortcut.register('CommandOrControl+X', () => {
        console.log('CommandOrControl+X is pressed')
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
