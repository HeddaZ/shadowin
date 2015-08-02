$.extend({
    getUrlQueryString: function (url) {
        // spliting the url and query string using question mark
        var splitUrl = url.split("?");

        // again spliting the data which will have & symbol
        var strUrl = (splitUrl.length > 1) ? splitUrl[1].split("&") : 0;

        var i = 0;
        var iLen = strUrl.length;

        var str = '';
        var obj = {};

        // iterator to assign key pair values into obj variable
        for (i = 0; i < iLen; i++) {
            str = strUrl[i].split("=");
            // add Array support
            var key = unescape(str[0]);
            var value = unescape(str[1]);
            if (key.lastIndexOf('[]') > 0) {
                key = key.substring(0, key.length - 2);
                if (obj[key]) {
                    obj[key].push(value);
                }
                else {
                    obj[key] = [value];
                }
            }
            else {
                obj[key] = value;
            }
        }

        // returning the value
        return Array.prototype.sort.call(obj);
    }
});