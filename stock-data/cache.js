const {MongoClient} = require('mongodb');

module.exports = class Cache {
    dbClient;

    constructor(url) {
        this.dbClient = new MongoClient(url);
    };

    open = async (name) => {
        await this.dbClient.connect();
        return this.dbClient.db().collection(name);
    };

    close = async () => {
        try {
            await this.dbClient.close();
        } catch (error) {
        }
    };
};