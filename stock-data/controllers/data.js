const Router = require('koa-router');
const router = new Router({prefix: '/data'});
const {MongoClient} = require('mongodb');

router.get('/', async (ctx, next) => {
    const config = ctx.state.config;
    const client = new MongoClient(config.dbUri);
    await client.connect();
    const table = client.db().collection('data');
    const query = {};
    const cursor = table.find(query);

    await cursor.forEach(console.dir);
    await client.close();

    ctx.body = {
        status: 'success',
        message: 'hello ' + ctx.state.config
    };
});

module.exports = router;