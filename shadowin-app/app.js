const {app, BrowserWindow, globalShortcut, screen} = require('electron');
const helper = require('./helper.js');
const opacityChange = 0.2;
const opacityMin = 0.1;
const opacityMax = 0.9;

// Launch when installing
if (require('electron-squirrel-startup')) {
    app.quit();
}

app.on('ready', () => {
    // Initialize
    helper.createWindow();

    // Events
    app.on('window-all-closed', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            helper.createWindow();
        }
    });

    // Hotkeys
    globalShortcut.register('Control+`', showHide);
    globalShortcut.register('Control+\\', exit);
    globalShortcut.register('Control+Up', fadeIn);
    globalShortcut.register('Control+Down', fadeOut);
    globalShortcut.register('Control+Left', dockLeft);
    globalShortcut.register('Control+Right', dockRight);
});

const showHide = () => {
    if (helper.window.isVisible()) {
        helper.window.hide();
    } else {
        helper.window.show();
    }
}
const exit = () => {
    if (helper.showQuestion(helper.window, '确定要退出程序吗？', '(尊重开源 尊重分享 谢谢使用)')) {
        app.exit();
    }
}
const fadeIn = () => {
    let opacity = helper.window.getOpacity();
    opacity += opacityChange;
    helper.window.setOpacity(Math.min(opacity, opacityMax));
}
const fadeOut = () => {
    let opacity = helper.window.getOpacity();
    opacity -= opacityChange;
    helper.window.setOpacity(Math.max(opacity, opacityMin));
}
const dockLeft = () => {
    let position = helper.window.getPosition();
    let currentDisplay, targetDisplay;
    const displays = screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        if (helper.inbounds(displays[i].bounds, position)) {
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
    position = helper.positionInbounds(targetDisplay.workArea, helper.window.getSize());
    helper.window.setPosition(position.x, position.y);
}
const dockRight = () => {
    let position = helper.window.getPosition();
    let currentDisplay, targetDisplay;
    const displays = screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        if (helper.inbounds(displays[i].bounds, position)) {
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
    position = helper.positionInbounds(targetDisplay.workArea, helper.window.getSize());
    helper.window.setPosition(position.x, position.y);
}