const helper = require('../helper.js');
const util = require('util');
const moment = require('moment');
const Router = require('koa-router');
const router = new Router({prefix: '/suggest'});

router.get('/', async (ctx, next) => {
    helper.log('SuggestApi - Request: %s %s', ctx.ip, ctx.url);
    helper.log('SuggestApi - Headers: %s %s', ctx.headers['referer'], ctx.headers['user-agent']);
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
    } catch (error) {
        helper.log('SuggestApi - ' + error.toString());
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