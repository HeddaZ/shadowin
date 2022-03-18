const helper = require('./helper.js');
const NodeCache = require('node-cache');

(() => {
    class Cache {
        /* symbol: {data, writeTime, readTime, priority} */
        _cache;

        constructor() {
            this._cache = new NodeCache({checkperiod: 0});
        };

        get(arg) {
            if (helper.isArray(arg)) {
                return this._getByKeys(arg);
            } else if (helper.isInteger(arg)) {
                return this._getByPriority(arg);
            } else if (helper.isString(arg)) {
                return this._cache.get(arg);
            } else {
                return null;
            }
        };

        set(key, value) {
            this._cache.set(key, value);
        };

        _getByKeys(keys) {
            return this._cache.mget(keys);
        };

        _getByPriority(priority) {
            const keys = this._cache.keys();
            const result = {};
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = this._cache.get(key);
                if (value.priority && value.priority > priority) {
                    result[key] = value;
                }
            }
            return result;
        };

        delete(keys) {
            this._cache.del(keys);
        };
    }

    module.exports = new Cache();
})();