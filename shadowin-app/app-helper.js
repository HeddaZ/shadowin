const fs = require('fs');
const path = require("path");
const log = require('electron-log');
const {app, BrowserWindow, dialog, shell, screen} = require('electron');

(() => {
    class AppHelper {
        static packageFile = 'package.json';
        static configFile = 'config.json';
        static encoding = 'utf8';
        static saveDelay = 5000;
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
            const packageData = AppHelper.readJson(path.join(this.getAppPath(), AppHelper.packageFile));
            const configData = AppHelper.readJson(path.join(this.getUserPath(), AppHelper.configFile));

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
            this.saveDelayer = setTimeout(AppHelper.writeJson, AppHelper.saveDelay,
                path.join(this.getUserPath(), AppHelper.configFile),
                this.config);
        };

        _getPositions(width, height) {
            const positions = [];
            const displays = screen.getAllDisplays();
            for (let i = 0; i < displays.length; i++) {
                const display = displays[i];
                // Left of display
                positions.push({
                    x: display.workArea.x,
                    y: display.workArea.y + display.workArea.height - height
                });
                // Right of display
                positions.push({
                    x: display.workArea.x + display.workArea.width - width,
                    y: display.workArea.y + display.workArea.height - height
                });
            }
            positions.sort((p1, p2) => {
                return p1.x - p2.x
            });
            return positions;
        };

        findLeftPosition(position, size) {
            let x, y;
            if (Array.isArray(position)) {
                x = position[0];
                y = position[1];
            } else {
                x = position.x;
                y = position.y;
            }
            let width, height;
            if (Array.isArray(size)) {
                width = size[0];
                height = size[1];
            } else {
                width = size.width;
                height = size.height;
            }

            const positions = this._getPositions(width, height);
            for (let middle = 0; middle < positions.length; middle++) {
                let left = middle - 1;
                if (left < 0) {
                    left = positions.length - 1;
                }
                let right = middle + 1;
                if (right > positions.length - 1) {
                    right = 0;
                }

                const leftPosition = positions[left];
                const middlePosition = positions[middle];
                const rightPosition = positions[right];
                if (x === middlePosition.x) {
                    return leftPosition;
                } else if (x === rightPosition.x) {
                    return middlePosition;
                } else if (x > middlePosition.x && (x < rightPosition.x || rightPosition.x < middlePosition.x)) {
                    return middlePosition;
                }
            }
            return {x: x, y: y};
        };

        findRightPosition(position, size) {
            let x, y;
            if (Array.isArray(position)) {
                x = position[0];
                y = position[1];
            } else {
                x = position.x;
                y = position.y;
            }
            let width, height;
            if (Array.isArray(size)) {
                width = size[0];
                height = size[1];
            } else {
                width = size.width;
                height = size.height;
            }

            const positions = this._getPositions(width, height);
            for (let left = 0; left < positions.length; left++) {
                let middle = left + 1;
                if (middle > positions.length - 1) {
                    middle = 0;
                }
                let right = middle + 1;
                if (right > positions.length - 1) {
                    right = 0;
                }

                const leftPosition = positions[left];
                const middlePosition = positions[middle];
                const rightPosition = positions[right];
                if (x === middlePosition.x) {
                    return rightPosition;
                } else if (x === leftPosition.x) {
                    return middlePosition;
                } else if (x < middlePosition.x && (x > leftPosition.x || leftPosition.x > middlePosition.x)) {
                    return middlePosition;
                }
            }
            return {x: x, y: y};
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

        getAppPath() {
            return app.getAppPath();
        };

        getUserPath() {
            return app.getPath('userData');
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