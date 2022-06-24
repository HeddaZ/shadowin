const { app, BrowserWindow, globalShortcut, shell } = require('electron');
const helper = require('./helper.js');

// Launch when installing
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;
app.on('ready', () => {
    // Initialize
    mainWindow = createWindow(helper.config);

    // Events
    app.on('window-all-closed', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow(helper.config);
        }
    });

    // Hotkeys
    globalShortcut.register('CommandOrControl+0', exit);
    globalShortcut.register('CommandOrControl+`', showHide);
});

const createWindow = config => {
    const window = new BrowserWindow({
        minimizable: false,
        maximizable: false,
        closable: false,
        alwaysOnTop: config.windowOnTop,
        fullscreenable: false,
        skipTaskbar: true,
        title: config.appName,
        frame: false,
        width: config.windowWidth,
        height: config.windowHeight,
        opacity: config.windowOpacity,
        webPreferences: {
            zoomFactor: config.windowZoom,
            textAreasAreResizable: false
        }
    });
    window.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
    window.loadURL(config.url);
};
const exit = () => {
    if (helper.showQuestion(mainWindow, '确定要退出程序吗？', '(尊重开源 尊重分享 谢谢使用)')) {
        app.exit();
    }
}
const showHide = () => {
    mainWindow.hide();
}