const {app, BrowserWindow, globalShortcut, shell} = require('electron');
const helper = require('./helper.js');
const opacity

// Launch when installing
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Initialize
app.on('ready', () => {
    helper.createWindow();

    // Events
    app.on('window-all-closed', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            helper.createWindow();
        }
    });

    // Hotkeys
    globalShortcut.register('Control+0', exit);
    globalShortcut.register('Control+`', showHide);
    globalShortcut.register('Control+=', fadeIn);
    globalShortcut.register('Control+-', fadeOut);
});

const exit = () => {
    if (helper.showQuestion(helper.window, '确定要退出程序吗？', '(尊重开源 尊重分享 谢谢使用)')) {
        app.exit();
    }
}
const showHide = () => {
    if (helper.window.isVisible()) {
        helper.window.hide();
    } else {
        helper.window.show();
    }
}
const fadeIn = () => {
    let opacity = helper.window.getOpacity();
    opacity += 0.2;
    helper.window.setOpacity(Math.min(opacity, 1));
}
const fadeOut = () => {
    let opacity = helper.window.getOpacity();
    opacity -= 0.2;
    helper.window.setOpacity(Math.max(opacity, 0.1));
}