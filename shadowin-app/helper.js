const fs = require('fs');
const { dialog } = require('electron');

(() => {
    class Helper {
        _packageFile = './package.json';
        _configFile = './config.json';
        _encoding = 'utf8';

        config;
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
            }
            catch (error) {
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
            }
            catch (error) {
                this.log(error.message);
            }
        };

        showQuestion(window, message, detail) {
            return dialog.showMessageBoxSync(window, {
                title: this.config.appName + ' V' + this.config.appVersion,
                message: message,
                detail: detail,
                type: 'question',
                buttons: ['??', '??'],
                defaultId: 0,
                cancelId: 1
            }) == 0;
        };
    }

    module.exports = new Helper();
})();