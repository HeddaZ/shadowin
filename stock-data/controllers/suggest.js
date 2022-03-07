const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const Router = require('koa-router');
const router = new Router({prefix: '/suggest'});

const cacheName = 'suggest'; /* symbol, time, prefix, shortSymbol, name, keyword, type */

router.get('/', async (ctx, next) => {
    helper.log('SUGGEST - Request: %s %s', ctx.ip, ctx.url);
    helper.log('SUGGEST - Headers: %s %s', ctx.headers['referer'], ctx.headers['user-agent']);
    if (!ctx.query.k) {
        ctx.status = 400;
        ctx.body = ctx.status + ": Invalid keyword. (e.g. zglt)";
        return;
    }

    const keyword = ctx.query.k;
    const config = ctx.config;
    let body = '';
    try {
        const url = util.format(config.suggestUrl, keyword);
        const referer = config.suggestReferers[helper.random(config.suggestReferers.length - 1)];
        body = await helper.httpGet(url, referer);

        // TODO: Keep suggest info for further use
        const cache = ctx.cache;
        try {
            const cacheSet = await cache.open(cacheName);
            const suggestSeparator = new RegExp("v_hint=\"|\".*");
            const suggest = body.split(suggestSeparator).filter(i => i).shift();
            const suggestItems = suggest.split('^');
            for (let i = 0; i < suggestItems.length; i++) {
                const suggestItem = suggestItems[i];
                const suggestItemInfo = suggestItem.split('~').filter(i => i);
                if (suggestItemInfo.length !== 5) {
                    continue;
                }

                const prefix = suggestItemInfo[0].toLowerCase();
                let shortSymbol = suggestItemInfo[1];
                shortSymbol = shortSymbol // trtn-a.n
                    .split('-').shift()
                    .split('.').shift()
                    .toUpperCase();
                const symbol = prefix + shortSymbol;
                const cacheData = await cacheSet.findOne({
                    symbol: symbol
                });
                if (!cacheData) {
                    await cacheSet.insertOne({
                        symbol: symbol,
                        time: moment().toDate(),
                        prefix: prefix,
                        shortSymbol: shortSymbol,
                        name: helper.unescapeUnicode(suggestItemInfo[2]),
                        keyword: suggestItemInfo[3],
                        type: suggestItemInfo[4]
                    });
                }
            }
        } catch (error) {
            helper.log('SUGGEST - ' + error.toString());
        } finally {
            await cache.close();
        }
    } catch (error) {
        helper.log('SUGGEST - ' + error.toString());
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