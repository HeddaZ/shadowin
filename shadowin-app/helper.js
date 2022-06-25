const fs = require('fs');
const {BrowserWindow, dialog, shell} = require('electron');

(() => {
    class Helper {
        _packageFile = './package.json';
        _configFile = './config.json';
        _encoding = 'utf8';

        config;
        window;
        log = console.log;

        constructor() {
            const packageJson = this._readJson(this._packageFile);
            const configJson = this._readJson(this._configFile);
            this.config = {
                appName: packageJson.name,
                appVersion: packageJson.version,
                appDescription: packageJson.description,
                ...packageJson.config.shadowin, // Default config
                ...configJson // User config
            };
            this.window = null;
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

        showWarning(window, message, detail) {
            dialog.showMessageBoxSync(window, {
                title: this.config.appName + ' V' + this.config.appVersion,
                message: message,
                detail: detail,
                type: 'warning',
                buttons: ['确定'],
                defaultId: 0
            });
        };

        _readJson(file, encoding) {
            if (!encoding) {
                encoding = this._encoding;
            }
            try {
                const content = fs.readFileSync(file, {
                    encoding: encoding
                });
                return JSON.parse(content);
            } catch (error) {
                this.log(error.message);
                return {};
            }
        };

        _writeJson(file, data, encoding) {
            if (!encoding) {
                encoding = this._encoding;
            }
            try {
                const content = JSON.stringify(data);
                fs.writeFileSync(file, content, {
                    encoding: encoding,
                    flag: 'w'
                });
            } catch (error) {
                this.log(error.message);
            }
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
                width: this.config.windowWidth,
                height: this.config.windowHeight,
                opacity: this.config.windowOpacity,
                webPreferences: {
                    zoomFactor: this.config.windowZoom,
                    textAreasAreResizable: false
                }
            });
            this.window.webContents.on('new-window', (event, url) => {
                event.preventDefault();
                shell.openExternal(url);
            });
            this.window.loadURL(this.config.url);
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