const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const {workerData} = require('worker_threads');
const Cache = require('../cache.js');

(() => {
    helper.log(workerData.info);
    const config = workerData.config;
    const dataSeparatorRegExp = new RegExp(config.dataSeparator);
    const cache = new Cache(config.cacheUrl);
    const cacheName = 'data'; /* symbol, data, writeTime, readTime, priority */

    const run = async () => {
        try {
            const cacheSet = await cache.open(cacheName);
            const cacheData = await cacheSet.find({
                priority: {$gt: config.dataRefreshEnabledPriority}
            }).sort({
                priority: -1
            }).limit(config.dataRefreshBatchSize * config.dataRefreshConcurrency).project({
                _id: 0,
                symbol: 1
            }).toArray();

            if (cacheData.length > 0) {
                helper.log('RefreshService - Started: total=%s, batchSize=%s, concurrency=%s', cacheData.length, config.dataRefreshBatchSize, config.dataRefreshConcurrency);
                let symbols = '';
                for (let i = 1; i <= cacheData.length; i++) {
                    const symbol = cacheData[i - 1].symbol;
                    symbols += symbol + config.symbolSeparator;
                    if (i % config.dataRefreshBatchSize === 0 || i === cacheData.length) {
                        helper.log('RefreshService - Batch%s: %s', i, symbols);
                        const url = util.format(config.dataUrl, symbols, helper.ticks());
                        const referer = config.dataReferers[helper.random(config.dataReferers.length - 1)];
                        const data = await helper.httpGet(url, referer);
                        if (data) {
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
                                    helper.log('RefreshService - Complete: %s = %s', key, value);
                                    const now = moment();
                                    await cacheSet.updateOne({
                                        symbol: key
                                    }, {
                                        $set: {
                                            data: value,
                                            writeTime: now.toDate(),
                                            readTime: now.toDate(),
                                            priority: 0
                                        }
                                    });
                                    // Delete resolved symbol
                                    symbols = symbols.replace(key + config.symbolSeparator, '');
                                    key = null;
                                }
                            }
                        }

                        // if (symbols) {
                        if (false) {
                            try {
                                helper.log('RefreshService - Disable: %s', symbols);
                                const invalidSymbols = symbols.split(config.symbolSeparator);
                                for (let k = 0; k < invalidSymbols.length; k++) {
                                    const invalidSymbol = invalidSymbols[k];
                                    if (!invalidSymbol) {
                                        continue;
                                    }
                                    await cacheSet.updateOne({
                                        symbol: invalidSymbol
                                    }, {
                                        $set: {
                                            priority: config.dataRefreshDisabledPriority
                                        }
                                    });
                                }
                            } catch (error) {
                            } finally {
                                symbols = '';
                            }
                        }
                    }
                }
            }
        } catch (error) {
            helper.log('RefreshService - %s', error.toString());
        } finally {
            await cache.close();
            setTimeout(run, config.dataRefreshInterval);
        }
    }

    setTimeout(run, config.dataRefreshInterval);
})();