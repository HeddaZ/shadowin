/* ******************* 全局变量 ******************* */

//常量
var MarkedCellKeysStringCookieName = "MarkedCellKeysString";
//控件
var LockButton;
var StocksString;
var ContentContainer;
var StockDatasFetcherContainer;
var Refresher;
//输入
var StockCodes;
var StockCosts;
var StockQuantitys;

/* ******************* 事件响应 ******************* */

function Page_Load(sender, e) {
    //控件定义
    LockButton = document.getElementById("LockButton");
    StocksString = document.getElementById("StocksString");
    ContentContainer = document.getElementById("ContentContainer");
    StockDatasFetcherContainer = document.getElementById("StockDatasFetcherContainer");

    //股票清单字符串
    var cookieStocksStringValue = ReadCookie(StocksString.id);
    if (cookieStocksStringValue) {
        StocksString.value = cookieStocksStringValue;
        StocksString.disabled = LockButton.checked = true;
    }
    else {
        StocksString.value = "sh000001,sz000002";
        StocksString.disabled = LockButton.checked = false;
    }

    //标题
    ContentContainer.deleteTHead();
    var contentContainerHeader = ContentContainer.createTHead();
    CreateRow(contentContainerHeader, HeadersString.split(","), DisplayIndexsString.split(","));

    //第一次启动刷新器
    Refresher_Elapsed();
}

function StocksString_KeyPress(sender, e) {
    return /[shzSHZ0-9\/\.,]/.test(String.fromCharCode(event.keyCode));
}
function StocksString_Blur(sender, e) {
    //规整化
    sender.value = sender.value.toLowerCase().replace(/\s+/g, "").replace(/,{2,}/g, ",").trim(",");
    if (sender.value == "") {
        var cookieStocksStringValue = ReadCookie(sender.id);
        if (cookieStocksStringValue) {
            sender.value = cookieStocksStringValue;
        }
    }
    if (sender.value && !/^[s][shz0-9\/\.,]*[0-9\/]$/g.test(sender.value)) {
        alert("选股列表异常！\n\n【格式】代码[/成本[/持有量]][,代码[/成本[/持有量]]]\n【例如】sh600026,sh600050/2.33,sz000002/20.5/100");
        sender.focus();
        sender.select();
    }
}

function LockButton_Click(sender, e) {
    if (sender.checked) {
        //保存到Cookie
        WriteCookie(StocksString.id, StocksString.value);
    }
    StocksString.disabled = sender.checked;
}

//刷新器事件
function Refresher_Elapsed(e) {
    //关闭刷新器
    if (Refresher) {
        Refresher = window.clearTimeout(Refresher);
    }

    //未操作
    if (LockButton.checked) {
        //分析选股列表
        var stocks = StocksString.value.split(",");
        StockCodes = new Array();
        StockCosts = new Array();
        StockQuantitys = new Array();
        for (var i = 0; i < stocks.length; i++) {
            var stockInformations = stocks[i].split("/");
            if (stockInformations[0]) {
                StockCodes.push(stockInformations[0]);
                if (stockInformations[1] && !isNaN(stockInformations[1])) {
                    StockCosts.push(stockInformations[1]);
                }
                else {
                    StockCosts.push(0);
                }
                if (stockInformations[2] && !isNaN(stockInformations[2])) {
                    StockQuantitys.push(stockInformations[2]);
                }
                else {
                    StockQuantitys.push(0);
                }
            }
        }

        //启动股票数据取回器
        StockDatasFetcherContainer.src = FormatString(StockDatasFetcherUrlFormat,
            GenerateTimeID(), //避免缓存
            escape(StockCodes.join(","))
            );

        //回调时将启动刷新器StockDatasFetcher_Callback
    }
    else {
        //启动刷新器
        Refresher = window.setTimeout(Refresher_Elapsed, RefreshInterval);
    }
}

//单元格点击
function Cell_DoubleClick(e) {
    //本单元格关键字
    var cellKey = this.parentElement.rowIndex + "/" + this.cellIndex;

    //在已标记列表中查找本单元格关键字
    var cellKeyMarkedIndex;
    var markedCellKeys;
    var markedCellKeysString = ReadCookie(MarkedCellKeysStringCookieName); //格式：行索引/列索引[,行索引/列索引]  例如：1/3,2/5,3/4,12/5
    if (markedCellKeysString) {
        markedCellKeys = markedCellKeysString.split(",");
        for (var i = 0; i < markedCellKeys.length; i++) {
            if (markedCellKeys[i].trim() == cellKey) {
                cellKeyMarkedIndex = i;
                break;
            }
        }
    }
    else {
        markedCellKeys = new Array();
    }
    if (cellKeyMarkedIndex >= 0) {
        //本单元格已被标记，取消标记
        this.className = "";
        markedCellKeys.splice(cellKeyMarkedIndex, 1);
    }
    else {
        //本单元格未被标记，标记
        this.className = "Marked";
        markedCellKeys.push(cellKey);
    }
    //更新已标记列表
    WriteCookie(MarkedCellKeysStringCookieName, markedCellKeys.join(","));
}

/* ******************* 数据处理方法 ******************* */

function StockDatasFetcher_Callback(stockDatasStrings) {
    //内容（利用TFoot可批量删除的特性）
    ContentContainer.deleteTFoot();
    var contentContainerBody = ContentContainer.createTFoot();
    var displayIndexs = DisplayIndexsString.split(",");
    for (var i = 0; i < StockCodes.length; i++) {
        var stockDatas = stockDatasStrings[i].split(",");

        EnrichStockDatas(stockDatas, StockCodes[i], StockCosts[i], StockQuantitys[i]);
        CreateRow(contentContainerBody, stockDatas, displayIndexs);
    }

    //着色
    ColorRows(ContentContainer);
    //标记
    MarkCells(ContentContainer);

    //启动刷新器
    Refresher = window.setTimeout(Refresher_Elapsed, RefreshInterval);
}

/* ******************* 数据处理方法 ******************* */

//为容器创建数据行
function CreateRow(container, datas, displayIndexs) {
    var row = container.insertRow();
    for (var i = 0; i < displayIndexs.length; i++) {
        var cell = row.insertCell();
        cell.innerHTML = datas[displayIndexs[i]];
        cell.ondblclick = Cell_DoubleClick;
    }
}

//扩充股票数据
function EnrichStockDatas(datas, code, costPrice, quantity) {
    //0~32数来自SINA，后续需要进行计算扩充
    var yestodayPrice = parseFloat(datas[2]);
    var currentPrice = parseFloat(datas[3]);
    if (currentPrice == 0) {
        currentPrice = yestodayPrice;
    }
    //代码，去除SINA前缀
    var plainCode = code.replace(/^s[hz]/g, "");

    //8
    if (code.startsWith("sh000")) {
        datas[8] = Math.round(parseFloat(datas[8]) / 10000) + "万";
    }
    else {
        datas[8] = Math.round(parseFloat(datas[8]) / 1000000) + "万";
    }
    //9
    datas[9] = Math.round(parseFloat(datas[9]) / 10000) + "万";

    //预留
    for (var i = 1; i <= 8; i++) {
        datas.push("(预留" + i + ")");
    }

    //41
    var displayName = FormatString(StockDisplayNameFormat,
        plainCode,
        code, //新浪兼容
        datas[0],
        plainCode
        );
    datas.push(displayName);
    //42
    datas.push(plainCode);
    //43
    var currentDifferencePrice = Math.round((currentPrice - yestodayPrice) * 100) * 1.00 / 100;
    datas.push(currentDifferencePrice);
    //44
    var currentDifferenceRate = Math.round(currentDifferencePrice / yestodayPrice * 10000) * 1.00 / 100;
    datas.push(currentDifferenceRate + "%");
    //45
    datas.push(costPrice);
    //46
    var costDifferencePrice = (costPrice == 0) ? 0 : Math.round((currentPrice - costPrice) * 100) * 1.00 / 100;
    datas.push(costDifferencePrice);
    //47
    var costDifferenceRate = (costPrice == 0) ? 0 : Math.round(costDifferencePrice / costPrice * 10000) * 1.00 / 100;
    datas.push(costDifferenceRate + "%");
    //48
    datas.push(quantity);
    //49
    var currentAmount = Math.round(currentPrice * quantity * 100) * 1.00 / 100;
    datas.push(currentAmount);
    //50
    var costAmount = Math.round(costPrice * quantity * 100) * 1.00 / 100;
    datas.push(costAmount);
    //51
    var costDifferenceAmount = Math.round(costDifferencePrice * quantity * 100) * 1.00 / 100;
    datas.push(costDifferenceAmount);
    //52
    var link = FormatString(StockLinkFormat,
        plainCode,
        code //新浪兼容
        );
    datas.push(link);
}

//着色
function ColorRows(container) {
    //根据显示索引列表确定容器中的“着色基准”列
    var colorBaseContainerIndex;
    var displayIndexs = DisplayIndexsString.split(",");
    for (var i = 0; i < displayIndexs.length; i++) {
        if (parseInt(displayIndexs[i]) == ColorBaseIndex) {
            colorBaseContainerIndex = i;
            break;
        }
    }
    if (colorBaseContainerIndex >= 0) {
        //找到了“着色基准”列基于容器的索引，着色
        for (var i = 0; i < container.rows.length; i++) {
            var row = container.rows[i];
            var colorBaseData = parseFloat(row.cells[colorBaseContainerIndex].innerText);
            if (colorBaseData > 0) {
                row.className = "Plus";
            }
            else if (colorBaseData < 0) {
                row.className = "Minus";
            }
        }
    }
}

//标记
function MarkCells(container) {
    var markedCellKeysString = ReadCookie(MarkedCellKeysStringCookieName); //格式：行索引/列索引[,行索引/列索引]  例如：1/3,2/5,3/4,12/5
    if (markedCellKeysString) {
        var markedCellKeys = markedCellKeysString.split(",");
        for (var i = 0; i < markedCellKeys.length; i++) {
            var markedCellKeyInformations = markedCellKeys[i].split("/");
            if (markedCellKeyInformations[0] && markedCellKeyInformations[1] && !isNaN(markedCellKeyInformations[0]) && !isNaN(markedCellKeyInformations[1])) {
                var markedRowIndex = parseInt(markedCellKeyInformations[0]);
                var markedCellIndex = parseInt(markedCellKeyInformations[1]);
                if (markedRowIndex < container.rows.length && markedCellIndex < container.rows[0].cells.length) {
                    container.rows[markedRowIndex].cells[markedCellIndex].className = "Marked";
                }
            }
        }
    }
}