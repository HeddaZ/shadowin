const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const Router = require('koa-router');
const router = new Router({prefix: '/data'});
const cache = require('../cache.js'); /* symbol: {data, writeTime, readTime, priority} */

router.get('/', async (ctx, next) => {
    helper.log('DataApi - Request: %s %s', ctx.ip, ctx.url);
    helper.log('DataApi - Headers: %s %s', helper.truncate(ctx.headers['referer'], 30), ctx.headers['user-agent']);
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

    let body = '';
    try {
        const cacheData = cache.get(symbols);
        let data, writeTime, readTime, priority;
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            let symbolData = cacheData[symbol];
            if (symbolData) {
                data = symbolData.data;
                writeTime = moment(symbolData.writeTime);
                readTime = moment();
                priority = readTime.diff(writeTime, 'seconds');
            } else {
                data = config.dummyData;
                writeTime = moment();
                readTime = writeTime;
                priority = config.dataRefreshPriority * 3;
            }
            cache.set(symbol, {
                data: data,
                writeTime: writeTime.toDate(),
                readTime: readTime.toDate(),
                priority: priority
            });

            body += util.format('%s%s="%s";\n', config.responseVariablePrefix, symbol, data);
        }
    } catch (error) {
        helper.log('DataApi - ' + error.toString());
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