const appHelper = require('./app-helper.js');
const util = require('util');
const dataRefresh = require('./services/data-refresh.js');
const Koa = require('koa');
const favicon = require('koa-favicon');
const config = require('./config.json');

// --------------------------------------------------
// Service - DataRefresh
const serviceInfo = util.format('%s %s - DataRefreshService', config.appDescription, config.appVersion);
dataRefresh(config);
appHelper.log(serviceInfo);

// --------------------------------------------------
// API - Initialize
const api = new Koa({proxy: true});
api.use(favicon(__dirname + '/favicon.ico'));
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
    appHelper.log(apiInfo);
});