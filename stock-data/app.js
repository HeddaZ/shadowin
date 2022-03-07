const helper = require('./helper.js');
const util = require('util');
const Koa = require('koa');
const {Worker} = require('worker_threads');
const Cache = require('./cache.js');

const config = require('./config.json');
const serviceInfo = util.format('%s %s - DataRefreshService', config.appDescription, config.appVersion);
const apiInfo = util.format('%s %s @ http://%s:%s', config.appDescription, config.appVersion, config.host, config.port);

// Service - DataRefresh
new Worker('./services/refresh-data.js', {
    workerData: {
        info: serviceInfo,
        config: config
    }
});

// API - Initialize
const app = new Koa({proxy: true});
app.use(async (ctx, next) => {
    ctx.state.info = apiInfo;
    ctx.config = config;
    ctx.cache = new Cache(config.cacheUrl);
    await next();
});
// API - Register controllers
const controllers = require('./controllers');
app.use(controllers.routes()).use(controllers.allowedMethods());
// API - Launch
app.listen(config.port, config.host, () => {
    helper.log(apiInfo);
});