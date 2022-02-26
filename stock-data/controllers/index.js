const Router = require('koa-router');
const router = new Router();
const fs = require('fs');
const path = require('path');

router.get('/', async (ctx, next) => {
    ctx.body = ctx.state.runtimeInfo;
});

const controllerDir = __dirname;
const indexFile = path.basename(__filename);
fs.readdirSync(controllerDir).forEach(file => {
    if (file !== indexFile) {
        let controller = require('./' + file);
        router.use(controller.routes());
    }
});

module.exports = router;
