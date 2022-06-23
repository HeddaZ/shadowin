const {app, BrowserWindow, globalShortcut, dialog, shell} = require('electron');
const config = require('./config.json');

// 安装后启动
if (require('electron-squirrel-startup')) {
    app.quit();
}

// 公共方法
const showQuestion = (parent, message, detail) => {
    return dialog.showMessageBoxSync(parent, {
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
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
    mainWindow.loadURL(config.url);

    // 注册事件
    app.on('window-all-closed', () => {
        app.exit();
    });
    app.on('before-quit', (event) => {
        if (showQuestion(mainWindow, '确定要退出程序吗？', '(尊重开源 尊重分享 谢谢使用)') == 1) {
            event.preventDefault();
        }
    });

    // 注册热键
    globalShortcut.register('CommandOrControl+`', () => {
        app.quit();
    });
});