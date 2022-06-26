const {app, BrowserWindow, globalShortcut, screen} = require('electron');
const appHelper = require('./app-helper.js');

// Launch when installing
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Single instance
const lock = app.requestSingleInstanceLock();
if (!lock) {
    appHelper.logWarn('Another instance is running.');
    app.quit();
}

app.on('ready', () => {
    // Initialize
    appHelper.createWindow();

    // Events
    app.on('window-all-closed', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            appHelper.createWindow();
        }
    });

    // Hotkeys
    globalShortcut.register('Control+`', showHide);
    globalShortcut.register('Control+\\', exit);
    globalShortcut.register('Control+]', fadeIn);
    globalShortcut.register('Control+[', fadeOut);
    globalShortcut.register('Control+,', dockLeft);
    globalShortcut.register('Control+.', dockRight);
    globalShortcut.register('Control+F12', openDevTools);
});

const showHide = () => {
    if (appHelper.window.isVisible()) {
        appHelper.window.hide();
        appHelper.hideContents();
    } else {
        appHelper.showContents();
        appHelper.window.show();
    }
}
const exit = () => {
    if (appHelper.showQuestion(appHelper.window, '确定要退出程序吗？', '(尊重开源 尊重分享 谢谢使用)')) {
        app.exit();
    }
}
const fadeIn = () => {
    let opacity = appHelper.window.getOpacity();
    opacity += appHelper.opacityChange;
    opacity = Math.min(opacity, appHelper.opacityMax);
    appHelper.window.setOpacity(opacity);

    appHelper.config.windowOpacity = opacity;
    appHelper.saveConfig();
}
const fadeOut = () => {
    let opacity = appHelper.window.getOpacity();
    opacity -= appHelper.opacityChange;
    opacity = Math.max(opacity, appHelper.opacityMin);
    appHelper.window.setOpacity(opacity);

    appHelper.config.windowOpacity = opacity;
    appHelper.saveConfig();
}
const dockLeft = () => {
    let position = appHelper.window.getPosition();
    let currentDisplay, targetDisplay;
    const displays = screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        if (appHelper.inbounds(displays[i].bounds, position)) {
            currentDisplay = displays[i];
            targetDisplay = displays[i > 0 ? i - 1 : displays.length - 1];
            break;
        }
    }
    if (!currentDisplay || !targetDisplay) {
        currentDisplay = targetDisplay = screen.getPrimaryDisplay();
    }

    if (currentDisplay.scaleFactor !== targetDisplay.scaleFactor) {
        targetDisplay = currentDisplay; // Won't change display when scaleFactor is different.
    }
    position = appHelper.positionInbounds(targetDisplay.workArea, appHelper.window.getSize());
    appHelper.window.setPosition(position.x, position.y);

    appHelper.config.windowPosition = position;
    appHelper.saveConfig();
}
const dockRight = () => {
    let position = appHelper.window.getPosition();
    let currentDisplay, targetDisplay;
    const displays = screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        if (appHelper.inbounds(displays[i].bounds, position)) {
            currentDisplay = displays[i];
            targetDisplay = displays[i < displays.length - 1 ? i + 1 : 0];
            break;
        }
    }
    if (!currentDisplay || !targetDisplay) {
        currentDisplay = targetDisplay = screen.getPrimaryDisplay();
    }

    if (currentDisplay.scaleFactor !== targetDisplay.scaleFactor) {
        targetDisplay = currentDisplay; // Won't change display when scaleFactor is different.
    }
    position = appHelper.positionInbounds(targetDisplay.workArea, appHelper.window.getSize());
    appHelper.window.setPosition(position.x, position.y);

    appHelper.config.windowPosition = position;
    appHelper.saveConfig();
}
const openDevTools = () => {
    appHelper.window.webContents.openDevTools();
}