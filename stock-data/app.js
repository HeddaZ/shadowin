const Koa = require('koa');
const app = new Koa();
const util = require('util');
const helper = require('./helper.js');
const {Worker} = require('worker_threads');
const config = require('./config.json');

// RefreshService
new Worker('./refresh-data.js', {
    workerData: {
        config: config
    }
});

// DataAPI - Initialize
const runtimeInfo = util.format('%s %s @ http://%s:%s', config.appDescription, config.appVersion, config.host, config.port);
app.use(async (ctx, next) => {
    ctx.config = config;
    ctx.state.runtimeInfo = runtimeInfo;
    await next();
});
// DataAPI - Register controllers
const controllers = require('./controllers');
app.use(controllers.routes()).use(controllers.allowedMethods());
// DataAPI - Launch
app.listen(config.port, config.host, () => {
    helper.log(runtimeInfo);
});