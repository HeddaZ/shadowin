const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const cache = require('../cache.js'); /* symbol: {data, writeTime, readTime, priority} */

(() => {
    const run = async (config) => {
        try {
            const dataInvalidRegExp = new RegExp(config.dataInvalidPattern);
            const dataSeparatorRegExp = new RegExp(config.dataSeparatorPattern);
            const cacheData = cache.get(0);
            const allSymbols = Object.keys(cacheData);
            if (allSymbols.length > 0) {
                helper.log('DataRefreshService - Started: total=%s, batchSize=%s, concurrency=%s', allSymbols.length, config.dataRefreshBatchSize, config.dataRefreshConcurrency);

                let symbols = '';
                for (let i = 1; i <= allSymbols.length; i++) {
                    const symbol = allSymbols[i - 1];
                    symbols += symbol + config.symbolSeparator;

                    // Resolve current batch
                    if (i % config.dataRefreshBatchSize === 0 || i === allSymbols.length) {
                        helper.log('DataRefreshService - Batch %s: %s', i, symbols);
                        const url = util.format(config.dataUrl, symbols, helper.ticks());
                        const referer = config.dataReferers[helper.random(config.dataReferers.length - 1)];
                        const data = await helper.httpGet(url, referer);
                        if (data && !dataInvalidRegExp.test(data)) {
                            const now = moment();
                            const dataItems = data.split(dataSeparatorRegExp);
                            let key, value;
                            for (let j = 0; j < dataItems.length; j++) {
                                const dataItem = dataItems[j];
                                if (!dataItem) {
                                    continue;
                                }
                                if (!key) {
                                    key = dataItem;
                                } else {
                                    value = dataItem;
                                    helper.log('DataRefreshService - Batch OK: %s = %s', key, value);

                                    cache.set(key, {
                                        data: value,
                                        writeTime: now.toDate(),
                                        readTime: now.toDate(),
                                        priority: 0
                                    });
                                    key = null;
                                }
                            }
                        } else {
                            // Invalid symbols
                            cache.delete(symbols.split(config.symbolSeparator));
                        }
                        symbols = '';
                    }
                }
            }
        } catch (error) {
            helper.log('DataRefreshService - %s', error.toString());
        } finally {
            setTimeout(run, config.dataRefreshInterval, config);
        }
    };

    module.exports = run;
})();