const Koa = require('koa');
const app = new Koa();

// Put config in context
const config = require('./config.json');
const runtimeInfo = 'Server is running on http://localhost:' + config.port;
app.use(async (ctx, next) => {
    ctx.state.config = config;
    ctx.state.runtimeInfo = runtimeInfo;
    await next();
});

// Register controllers
const controllers = require('./controllers')
app.use(controllers.routes()).use(controllers.allowedMethods());

app.listen(config.port, () => {
    console.log(runtimeInfo);
});