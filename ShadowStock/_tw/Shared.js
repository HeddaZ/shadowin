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
    document.cookie = name + "TW=" + escape(value) + ";expires=" + nextYear.toGMTString();
}
function ReadCookie(name) {
    var cookies = document.cookie.split(";");
    return GetNameValueCollectionValue(cookies, name + "TW", true);
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

/* ******************* 配置参数（TW） ******************* */

//标题列表              0    1    2     3    4    5   6    7    8      9   10   11   12  13   14   15   16   17   18   19   20  21   22  23    24  25    26  27   28  29   30   31      32     33      34      35     36      37      38     39      40   41   42  43     44   45   46    47   48     49    50     51   52
var HeadersString = "股票,開盤,昨收,最新價,最高,最低,買進,賣出,張數,成交額,買①量,買①,買②量,買②,買③量,買③,買④量,買④,買⑤量,買⑤,賣①量,賣①,賣②量,賣②,賣③量,賣③,賣④量,賣④,賣⑤量,賣⑤,日期,時間,(預留1),(預留2),(預留3),(預留4),(預留5),(預留6),(預留7),(預留8),(預留9),股票,代號,漲跌,漲跌率,成本,盈虧,盈虧率,持倉,總現值,總成本,總盈虧,連接";

//缺省股票数据字符串
var DefaultStockDatasString = "?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0," + GetDate() + "," + GetTime();

//显示索引列表
var DisplayIndexsString = "41,3,43,44,4,5,1,2,8,45,47,48,51,31";

//着色基准索引
var ColorBaseIndex = 43;

//刷新时间（毫秒）
var RefreshInterval = 8000;

//股票数据定义地址格式
var StockDatasDeclareUrlFormat = "http://tw.stock.shadowin.net/stockdata.aspx?rn={0}&list={1}";

//股票数据取回器地址格式
var StockDatasFetcherUrlFormat = "StockDatasFetcher.htm?rn={0}&list={1}";

//列格式
var StockDisplayNameFormat = "<a title=\"雅虎奇摩\" href=\"http://tw.stock.yahoo.com/q/q?s={0}\" target=\"_blank\">{2}</a>";
var StockLinkFormat = "";