const appHelper = require('./app-helper.js');
const NodeCache = require('node-cache');

(() => {
    class Cache {
        /* symbol: {data, writeTime, readTime, priority} */
        _cache;

        constructor() {
            this._cache = new NodeCache({checkperiod: 0});
        };

        get(arg, limit) {
            if (appHelper.isInteger(arg)) {
                return this._getByPriority(arg, limit);
            } else if (appHelper.isArray(arg)) {
                return this._cache.mget(arg);
            } else if (appHelper.isString(arg)) {
                const result = {};
                result[arg] = this._cache.get(arg);
                return result;
            } else {
                return null;
            }
        };

        set(key, value) {
            this._cache.set(key, value);
        };

        _getByPriority(priority, limit) {
            const maxCount = appHelper.isInteger(limit) ? limit : 0;
            const keys = this._cache.keys();

            const result = {};
            let count = 0;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = this._cache.get(key);
                if (value && value.priority && value.priority > priority) {
                    result[key] = value;
                    count++;

                    if (maxCount && count >= maxCount) {
                        break;
                    }
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