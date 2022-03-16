const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const {workerData} = require('worker_threads');
const Cache = require('../cache.js');

(() => {
    helper.log(workerData.info);
    const config = workerData.config;
    const batchSize = config.dataRefreshBatchSize * config.dataRefreshConcurrency;
    const dataSeparatorRegExp = new RegExp(config.dataSeparator);
    const cache = new Cache(config.cacheUrl);
    const cacheName = 'data'; /* symbol, data, writeTime, readTime, priority */

    const run = async () => {
        try {
            const cacheSet = await cache.open(cacheName);
            const cacheData = await cacheSet.find({priority: {$gt: config.dataRefreshPriority}})
                .sort({priority: -1})
                .limit(batchSize)
                .map(i => i.symbol)
                .toArray();
            if (cacheData.length > 0) {
                helper.log('RefreshService - Started: total=%s, batchSize=%s, concurrency=%s', cacheData.length, config.dataRefreshBatchSize, config.dataRefreshConcurrency);

                let symbols = '';
                const bulkCommands = [];
                for (let i = 1; i <= cacheData.length; i++) {
                    const symbol = cacheData[i - 1];
                    symbols += symbol + config.symbolSeparator;

                    // Resolve current batch
                    if (i % config.dataRefreshBatchSize === 0 || i === cacheData.length) {
                        helper.log('RefreshService - Batch %s: %s', i, symbols);
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
                                    helper.log('RefreshService - Batch OK: %s = %s', key, value);

                                    const now = moment();
                                    bulkCommands.push({
                                        updateOne:
                                            {
                                                filter: {symbol: key},
                                                update: {
                                                    $set: {
                                                        data: value,
                                                        writeTime: now.toDate(),
                                                        readTime: now.toDate(),
                                                        priority: 0
                                                    }
                                                }
                                            }
                                    });
                                    key = null;
                                }
                            }
                        }
                        symbols = '';
                    }
                }

                if (bulkCommands.length>0) {
                    await cacheSet.bulkWrite(bulkCommands, {ordered: false});
                }
            }
        } catch (error) {
            helper.log('RefreshService - %s', error.toString());
            await cache.close();
        } finally {
            setTimeout(run, config.dataRefreshInterval);
        }
    };

    setTimeout(run, config.dataRefreshInterval);
})();