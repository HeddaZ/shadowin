const helper = require('./helper.js');
const util = require('util');
const dataRefresh = require('./services/data-refresh.js');
const Koa = require('koa');
const config = require('./config.json');

// --------------------------------------------------
// Service - DataRefresh
const serviceInfo = util.format('%s %s - DataRefreshService', config.appDescription, config.appVersion);
dataRefresh(config);
helper.log(serviceInfo);

// --------------------------------------------------
// API - Initialize
const api = new Koa({proxy: true});
const apiInfo = util.format('%s %s @ http://%s:%s', config.appDescription, config.appVersion, config.host, config.port);
api.use(async (ctx, next) => {
    ctx.state.info = apiInfo;
    ctx.config = config;
    await next();
});
// API - Register controllers
const controllers = require('./controllers');
api.use(controllers.routes()).use(controllers.allowedMethods());
// API - Launch
api.listen(config.port, config.host, () => {
    helper.log(apiInfo);
});