const appHelper = require('../app-helper.js');
const util = require('util');
const moment = require('moment');
const Router = require('koa-router');
const router = new Router({prefix: '/suggest'});

router.get('/', async (ctx, next) => {
    appHelper.log('SuggestApi - Request: %s %s', ctx.ip, ctx.url);
    appHelper.log('SuggestApi - Headers: %s %s', ctx.headers['referer'], ctx.headers['user-agent']);
    if (!ctx.query.k) {
        ctx.status = 400;
        ctx.body = ctx.status + ": Invalid keyword. (e.g. zglt)";
        return;
    }

    const keyword = ctx.query.k;
    const config = ctx.config;
    let body = '';
    try {
        const url = util.format(config.suggestUrl, appHelper.urlEncode(keyword));
        const referer = config.suggestReferers[appHelper.random(config.suggestReferers.length - 1)];
        body = await appHelper.httpGet(url, referer);
    } catch (error) {
        appHelper.log('SuggestApi - ' + error.toString());
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