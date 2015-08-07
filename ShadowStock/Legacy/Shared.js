/* ******************* 扩展原型 ******************* */

//扩展原型
String.prototype.trimStart = function (trimming) {
    if (!trimming) {
        trimming = "\\s";
    }
    var pattern = new RegExp("^(" + trimming + ")+", "g");
    return this.replace(pattern, "");
}
String.prototype.trimEnd = function (trimming) {
    if (!trimming) {
        trimming = "\\s";
    }
    var pattern = new RegExp("(" + trimming + ")+$", "g");
    return this.replace(pattern, "");
}
String.prototype.trim = function (trimming) {
    return this.trimStart(trimming).trimEnd(trimming);
}

String.prototype.padLeft = function (width, padding) {
    var result = this;
    if (!padding) {
        padding = " ";
    }
    while (result.length < width) {
        result = padding + result;
    }
    return result;
}
String.prototype.padRight = function (width, padding) {
    var result = this;
    if (!padding) {
        padding = " ";
    }
    while (result.length < width) {
        result = result + padding;
    }
    return result;
}

String.prototype.startsWith = function (string) {
    if (!string) {
        string = "\\s";
    }
    var pattern = new RegExp("^(" + string + ")", "g");
    return pattern.test(this);
}
String.prototype.endsWith = function (string) {
    if (!string) {
        string = "\\s";
    }
    var pattern = new RegExp("(" + string + ")$", "g");
    return pattern.test(this);
}

/* ******************* 名字值集合（name1=value1,name2=value2,name3=value3） ******************* */

function GetNameValueCollectionValue(nameValueCollection, name, valueEscaped) {
    for (var i = 0; i < nameValueCollection.length; i++) {
        var collectionName = nameValueCollection[i].substring(0, nameValueCollection[i].indexOf("=")).trim();
        var collectionValue = nameValueCollection[i].substr(nameValueCollection[i].indexOf("=") + 1);
        if (collectionName == name.trim()) {
            if (valueEscaped) {
                return unescape(collectionValue.trim());
            }
            else {
                return collectionValue;
            }
        }
    }
    return null;
}

/* ******************* 操作Cookie ******************* */

function WriteCookie(name, value) {
    var today = new Date();
    var nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    document.cookie = name + "=" + escape(value) + ";expires=" + nextYear.toGMTString();
}
function ReadCookie(name) {
    var cookies = document.cookie.split(";");
    return GetNameValueCollectionValue(cookies, name, true);
}

/* ******************* 时间 ******************* */

function GetDate(separator) {
    if (!separator) {
        separator = "-";
    }
    var now = new Date();
    return now.getFullYear().toString()
        + separator + (now.getMonth() + 1).toString().padLeft(2, "0")
        + separator + now.getDate().toString().padLeft(2, "0");
}
function GetTime(separator) {
    if (!separator) {
        separator = ":";
    }
    var now = new Date();
    return now.getHours().toString().padLeft(2, "0")
        + separator + now.getMinutes().toString().padLeft(2, "0")
        + separator + now.getSeconds().toString().padLeft(2, "0");
}
function GenerateTimeID() {
    var now = new Date();
    return now.getFullYear().toString()
        + (now.getMonth() + 1).toString().padLeft(2, "0")
        + now.getDate().toString().padLeft(2, "0")
        + now.getHours().toString().padLeft(2, "0")
        + now.getMinutes().toString().padLeft(2, "0")
        + now.getSeconds().toString().padLeft(2, "0")
        + now.getMilliseconds().toString().padLeft(3, "0");
}

/* ******************* 注册脚本引用 ******************* */

function RegisterScriptInclude(url) {
    document.write(unescape("%3Cscript type=\"text/javascript\" src=\"" + url + "\"%3E%3C/script%3E"));
}

/* ******************* 格式化字符串 ******************* */

function FormatString(string) {
    var result = string;
    for (var i = 1; i < arguments.length; i++) {
        var pattern = new RegExp("\\{" + (i - 1) + "\\}", "g");
        result = result.replace(pattern, arguments[i].toString());
    }
    return result;
}

/* ******************* 页面参数 ******************* */

function ReadQueryString(name, escaped) {
    var queryStringsString = window.location.toString().split("?")[1];
    if (queryStringsString) {
        var queryStrings = queryStringsString.split("&");
        return GetNameValueCollectionValue(queryStrings, name, escaped);
    }
    else {
        return null;
    }
}

/* ******************* 配置参数 ******************* */

//标题列表              0    1    2     3    4    5   6    7      8      9   10   11   12  13   14   15   16  17    18  19   20   21   22  23    24  25   26   27   28  29   30   31          32                                                                 41  42   43    44   45   46     47    48     49    50     51   52
var HeadersString = "名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间,(新浪结束符),(预留1),(预留2),(预留3),(预留4),(预留5),(预留6),(预留7),(预留8),名称,代码,涨跌,涨跌率,成本,盈亏,盈亏率,持有量,总现值,总成本,总盈亏,快链";

//缺省股票数据字符串
var DefaultStockDatasString = "?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0," + GetDate() + "," + GetTime();

//显示索引列表
var DisplayIndexsString = "41,3,43,44,4,5,1,2,9,45,47,48,51,31,52";

//着色基准索引
var ColorBaseIndex = 43;

//刷新时间（毫秒）
var RefreshInterval = 5000;

//股票数据定义地址格式
var StockDatasDeclareUrlFormat = "http://hq.sinajs.cn/rn={0}&list={1}";
/* 备用地址：
http://hq.sinajs.cn/rn=1111&list=sh000001,sz399001,sz399106
http://61.172.207.163/rn=1111&list=sh000001,sz399001,sz399106
http://60.28.164.212/rn=1118&list=sh000001,sz399001,sz399106
http://60.28.164.213/rn=1112&list=sh000001,sz399001,sz399106
http://60.28.164.214/rn=1113&list=sh000001,sz399001,sz399106
http://60.28.2.64/rn=1114&list=sh000001,sz399001,sz399106
http://60.28.2.65/rn=1115&list=sh000001,sz399001,sz399106
http://60.28.2.66/rn=1116&list=sh000001,sz399001,sz399106
http://60.28.2.67/rn=1117&list=sh000001,sz399001,sz399106
*/

//股票数据取回器地址格式
var StockDatasFetcherUrlFormat = "StockDatasFetcher.htm?rn={0}&list={1}";

//列格式
var StockDisplayNameFormat = "{3} <a title=\"新浪\" href=\"http://biz.finance.sina.com.cn/suggest/lookup_n.php?country=stock&q={1}\" target=\"_blank\">{2}</a>";
var StockLinkFormat = "";
StockLinkFormat += "\n<a title=\"Google\" href=\"http://www.google.com.hk/finance?gl=cn&q={0}\" target=\"_blank\">G</a>";
StockLinkFormat += "\n<a title=\"历史价格\" href=\"http://www.google.com.hk/finance/historical?hl=zh-CN&q={0}\" target=\"_blank\">P</a>";
StockLinkFormat += "\n<a title=\"技术指标\" href=\"TI.htm?{1}\" target=\"_blank\">T</a>";