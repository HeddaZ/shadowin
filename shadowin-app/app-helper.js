const fs = require('fs');
const path = require("path");
const log = require('electron-log');
const {BrowserWindow, dialog, shell} = require('electron');

(() => {
    class AppHelper {
        static packageFile = path.join(__dirname, 'package.json');
        static configFile = path.join(__dirname, 'config.json');
        static encoding = 'utf8';
        static saveDelay = 10000;
        static blankUrl = 'about:blank';

        static readJson(file, encoding) {
            if (!encoding) {
                encoding = AppHelper.encoding;
            }
            try {
                const content = fs.readFileSync(file, {
                    encoding: encoding
                });
                return JSON.parse(content);
            } catch (error) {
                log.error(error);
                return {};
            }
        };

        static writeJson(file, data, encoding) {
            if (!encoding) {
                encoding = AppHelper.encoding;
            }
            try {
                const content = JSON.stringify(data);
                fs.writeFileSync(file, content, {
                    encoding: encoding,
                    flag: 'w'
                });
            } catch (error) {
                log.error(error);
            }
        };

        opacityChange = 0.2;
        opacityMin = 0.1;
        opacityMax = 0.9;

        config;
        window;
        saveDelayer;

        constructor() {
            const packageData = AppHelper.readJson(AppHelper.packageFile);
            const configData = AppHelper.readJson(AppHelper.configFile);

            this.config = {
                appName: packageData.name,
                appVersion: packageData.version,
                appDescription: packageData.description,
                ...packageData.config.shadowin, // App config
                ...configData // User config
            };

            this.window = null;
            this.saveDelayer = null;
        };

        createWindow() {
            const config = this.config;
            this.window = new BrowserWindow({
                minimizable: false,
                maximizable: false,
                closable: false,
                alwaysOnTop: config.windowOnTop,
                fullscreenable: false,
                skipTaskbar: true,
                title: config.appName,
                frame: false,
                webPreferences: {
                    devTools: true,
                    zoomFactor: config.windowZoom,
                    textAreasAreResizable: false
                }
            });
            this.window.setOpacity(config.windowOpacity);
            this.window.setSize(config.windowSize.width, config.windowSize.height);
            this.window.setPosition(config.windowPosition.x, config.windowPosition.y);
            this.showContents(true);

            const _this = this;
            this.window.webContents.on('new-window', (event, url) => {
                event.preventDefault();
                shell.openExternal(url);
            });
            this.window.on('resized', () => {
                const size = _this.window.getSize();
                _this.config.windowSize.width = size[0];
                _this.config.windowSize.height = size[1];
                _this.saveConfig();
            });
            this.window.on('moved', () => {
                const position = _this.window.getPosition();
                _this.config.windowPosition.x = position[0];
                _this.config.windowPosition.y = position[1];
                _this.saveConfig();
            });
        };

        showContents(ignoreCache) {
            const option = ignoreCache
                ? {extraHeaders: 'pragma: no-cache\n'}
                : null;
            this.window.loadURL(this.config.url, option);
        };

        hideContents() {
            this.window.loadURL(AppHelper.blankUrl);
        };

        saveConfig() {
            if (this.saveDelayer) {
                clearTimeout(this.saveDelayer);
            }
            this.saveDelayer = setTimeout(AppHelper.writeJson, AppHelper.saveDelay, AppHelper.configFile, this.config);
        };

        inbounds(bounds, position) {
            let x, y;
            if (Array.isArray(position)) {
                x = position[0];
                y = position[1];
            } else {
                x = position.x;
                y = position.y;
            }
            return x >= bounds.x
                && y >= bounds.y
                && x <= bounds.x + bounds.width
                && y <= bounds.y + bounds.height;
        };

        positionInbounds(bounds, size) {
            let width, height;
            if (Array.isArray(size)) {
                width = size[0];
                height = size[1];
            } else {
                width = size.width;
                height = size.height;
            }
            return {
                x: bounds.x + Math.max(bounds.width - width, 0),
                y: bounds.y + Math.max(bounds.height - height, 0)
            }
        };

        showQuestion(window, message, detail) {
            return dialog.showMessageBoxSync(window, {
                title: this.config.appName + ' V' + this.config.appVersion,
                message: message,
                detail: detail,
                type: 'question',
                buttons: ['确定', '取消'],
                defaultId: 0,
                cancelId: 1
            }) === 0;
        };

        logInfo(message) {
            log.info(message);
        };

        logError(message) {
            log.error(message);
        };

        logWarn(message) {
            log.warn(message);
        };
    }

    module.exports = new AppHelper();
})();