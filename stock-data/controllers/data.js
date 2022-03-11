const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const Router = require('koa-router');
const router = new Router({prefix: '/data'});

const cacheName = 'data'; /* symbol, data, writeTime, readTime, priority */

router.get('/', async (ctx, next) => {
    helper.log('DATA - Request: %s %s', ctx.ip, ctx.url);
    helper.log('DATA - Headers: %s %s', helper.truncate(ctx.headers['referer'], 30), ctx.headers['user-agent']);
    if (!ctx.query.s) {
        ctx.status = 400;
        ctx.body = ctx.status + ": Invalid symbol. (e.g. s=sh000001,sh600000)";
        return;
    }
    const config = ctx.config;
    const symbolRegExp = new RegExp(config.symbolPattern);
    const symbols = ctx.query.s.split(config.symbolSeparator).filter(i => symbolRegExp.test(i));
    if (symbols.length > config.responseMaxCount) {
        ctx.status = 414;
        ctx.body = ctx.status + ": Too many symbols.";
        return;
    }

    const cache = ctx.cache;
    let body = '';
    try {
        const cacheSet = await cache.open(cacheName);
        const cacheData = {};
        await cacheSet.find({symbol: {$in: symbols}}).forEach(i => {
            cacheData[i.symbol] = i;
        });

        let data, writeTime, readTime, priority;
        const bulkCommands = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const symbolData = cacheData[symbol];
            if (symbolData) {
                data = symbolData.data;
                writeTime = moment(symbolData.writeTime);
                readTime = moment();
                priority = readTime.diff(writeTime, 'seconds');
                bulkCommands.push({
                    updateOne:
                        {
                            filter: {symbol: symbol},
                            update: {
                                $set: {
                                    readTime: readTime.toDate(),
                                    priority: priority
                                }
                            }
                        }
                });
            } else {
                data = config.emptyData;
                writeTime = moment();
                readTime = writeTime;
                priority = config.dataRefreshPriority * 2;
                bulkCommands.push({
                    insertOne:
                        {
                            document:
                                {
                                    symbol: symbol,
                                    data: data,
                                    writeTime: writeTime.toDate(),
                                    readTime: readTime.toDate(),
                                    priority: priority
                                }
                        }
                });
            }

            body += util.format('%s%s="%s";\n', config.responseVariablePrefix, symbol, data);
        }

        await cacheSet.bulkWrite(bulkCommands, {ordered: false});
    } catch (error) {
        helper.log('DATA - ' + error.toString());
    } finally {
        await cache.close();
    }

    // Response
    ctx.set({
        'Content-Type': 'text/html; charset=utf8',
        'Cache-Control': 'max-age=0',
        'Server': util.format("%s-%s", config.appName, config.appVersion)
    });
    ctx.body = body;
});

module.exports = router;