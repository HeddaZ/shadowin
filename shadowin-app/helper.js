const fs = require('fs');
const {BrowserWindow, dialog, shell} = require('electron');

(() => {
    class Helper {
        static packageFile = './package.json';
        static configFile = './config.json';
        static encoding = 'utf8';
        static saveDelayTime = 10000;

        static readJson(file, encoding) {
            if (!encoding) {
                encoding = Helper.encoding;
            }
            try {
                const content = fs.readFileSync(file, {
                    encoding: encoding
                });
                return JSON.parse(content);
            } catch (error) {
                console.log(error.message);
                return {};
            }
        };

        static writeJson(file, data, encoding) {
            if (!encoding) {
                encoding = Helper.encoding;
            }
            try {
                const content = JSON.stringify(data);
                fs.writeFileSync(file, content, {
                    encoding: encoding,
                    flag: 'w'
                });
            } catch (error) {
                console.log(error.message);
            }
        };

        _saveDelayer;
        config;
        window;

        constructor() {
            const packageJson = Helper.readJson(Helper.packageFile);
            const configJson = Helper.readJson(Helper.configFile);
            this.config = {
                appName: packageJson.name,
                appVersion: packageJson.version,
                appDescription: packageJson.description,
                ...packageJson.config.shadowin, // Default config
                ...configJson // User config
            };
            this.window = null;
        };

        createWindow() {
            this.window = new BrowserWindow({
                minimizable: false,
                maximizable: false,
                closable: false,
                alwaysOnTop: this.config.windowOnTop,
                fullscreenable: false,
                skipTaskbar: true,
                title: this.config.appName,
                frame: false,
                webPreferences: {
                    zoomFactor: this.config.windowZoom,
                    textAreasAreResizable: false
                }
            });
            this.window.setOpacity(this.config.windowOpacity);
            this.window.setSize(this.config.windowSize.width, this.config.windowSize.height);
            this.window.setPosition(this.config.windowPosition.x, this.config.windowPosition.y);
            this.window.loadURL(this.config.url);

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

        saveConfig() {
            if (this._saveDelayer) {
                clearTimeout(this._saveDelayer);
            }
            this._saveDelayer = setTimeout(Helper.writeJson, Helper.saveDelayTime, Helper.configFile, this.config);
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
        }
    }

    module.exports = new Helper();
})();