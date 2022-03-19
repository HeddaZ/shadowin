const axios = require('axios');

(() => {
    class Helper {
        log = console.log;

        ticks() {
            return new Date().getTime();
        };

        random(max, min) {
            if (!min) {
                min = 0;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        isArray(arg) {
            return Array.isArray(arg);
        };

        isInteger(arg) {
            return Number.isInteger(arg);
        };

        isString(arg) {
            return typeof arg === 'string';
        };

        urlEncode(s) {
            return encodeURIComponent(s);
        };

        truncate(s, length) {
            return (s || '').substr(0, length);
        };

        async httpGet(url, referer) {
            try {
                this.log('Helper.HttpGet: ' + referer + ' --> ' + url);
                const response = await axios.get(url, {
                    headers: {
                        'Accept': '*/*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ja;q=0.6',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                        'Pragma': 'no-cache',
                        'Referer': referer,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
                        'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                        'sec-ch-ua-mobile': '?0',
                        'Sec-Fetch-Dest': 'script',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'cross-site'
                    }
                });
                this.log('Helper.HttpGet: ' + response.statusText);
                return response.data;
            } catch (error) {
                this.log('Helper.HttpGet: ' + error.toString());
                return null;
            }
        };
    }

    module.exports = new Helper();
})();