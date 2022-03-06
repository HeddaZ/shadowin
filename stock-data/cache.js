const {MongoClient} = require('mongodb');

module.exports = class Cache {
    isConnected;
    dbClient;

    constructor(url) {
        this.isConnected = false;
        this.dbClient = new MongoClient(url);
    };

    open = async (name) => {
        if (!this.isConnected) {
            await this.dbClient.connect();
        }
        return this.dbClient.db().collection(name);
    };

    close = async () => {
        if (this.isConnected) {
            try {
                await this.dbClient.close();
            } catch (error) {
            } finally {
                this.isConnected = false;
            }
        }
    };
};