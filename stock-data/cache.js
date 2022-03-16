const {MongoClient} = require('mongodb');

module.exports = class Cache {
    dbClient;
    isConnected;

    constructor(url) {
        this.dbClient = new MongoClient(url);
        this.isConnected = false;
    };

    open = async (name) => {
        if (!this.isConnected) {
            await this.dbClient.connect();
            this.isConnected = true;
        }
        return this.dbClient.db().collection(name);
    };

    close = async () => {
        this.isConnected = false;
    };
};