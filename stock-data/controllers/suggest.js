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
        const url = util.format(config.suggestUrl, helper.urlEncode(keyword));
        const referer = config.suggestReferers[helper.random(config.suggestReferers.length - 1)];
        body = await helper.httpGet(url, referer);

        // TODO: Keep suggest info for further use
        const cache = ctx.cache;
        try {
            const cacheSet = await cache.open(cacheName);
            const suggestSeparator = new RegExp("v_hint=\"|\".*");
            const suggest = body.split(suggestSeparator).filter(i => i).shift();
            const suggestItems = suggest.split('^');
            const bulkCommands = [];
            for (let i = 0; i < suggestItems.length; i++) {
                const suggestItem = suggestItems[i];
                const suggestItemInfo = suggestItem.split('~');
                if (suggestItemInfo.length !== 5) {
                    continue;
                }

                const prefix = suggestItemInfo[0]
                    .toLowerCase();
                const shortSymbol = suggestItemInfo[1]
                    .split('-').shift()
                    .split('.').shift()
                    .toUpperCase(); // trtn-a.n
                const symbol = prefix + shortSymbol;
                const time = moment().toDate();
                const name = helper.unicodeDecode(suggestItemInfo[2]);
                const keyword = suggestItemInfo[3];
                const type = suggestItemInfo[4];

                bulkCommands.push(
                    {
                        updateOne:
                            {
                                filter: {symbol: symbol},
                                update: {
                                    $set: {
                                        symbol: symbol,
                                        time: time,
                                        prefix: prefix,
                                        shortSymbol: shortSymbol,
                                        name: name,
                                        keyword: keyword,
                                        type: type
                                    }
                                },
                                upsert: true
                            }
                    }
                );
            }

            if (bulkCommands.length>0) {
                await cacheSet.bulkWrite(bulkCommands, {ordered: false});
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