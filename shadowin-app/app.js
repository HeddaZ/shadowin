const {app, BrowserWindow, globalShortcut, dialog, shell} = require('electron');
const config = require('./config.json');

// 安装后启动
if (require('electron-squirrel-startup')) {
    app.quit();
}

// 公共方法
const showQuestion = (message, detail) => {
    return dialog.showMessageBoxSync({
        title: config.appName + ' V' + config.appVersion,
        message: message,
        detail: detail,
        type: 'question',
        buttons: ['确定', '取消'],
        defaultId: 0,
        cancelId: 1
    });
}

app.on('ready', () => {
    // 注册事件

    // 初始化
    const mainWindow = new BrowserWindow({
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
    mainWindow.webContents.on('new-window', function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });
    mainWindow.loadURL(config.url);

    // 注册热键
    globalShortcut.register('CommandOrControl+`', () => {
        console.log('Ctrl + ~ is pressed')
    });
});