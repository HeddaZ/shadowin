const path = require('path');
const fs = require('fs');
const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx, next) => {
    ctx.body = ctx.state.info;
});

const controllerDir = __dirname;
const indexFile = path.basename(__filename);
fs.readdirSync(controllerDir).forEach(file => {
    if (file !== indexFile) {
        const controller = require('./' + file);
        router.use(controller.routes());
    }
});

module.exports = router;
