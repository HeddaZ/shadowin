(function (window, document, undefined) {
    var _shadowStock = {},
        _appId = 'ShadowStock_SH_SZ',
        _appName = 'ShadowStock 影子证券 - 沪深创业板',
        _appVersion = '2.0',

        /******************** 配置 ********************/
        _options = {
            cookieExpires: new Date(9999, 1, 1),
            /*
            {"11":"A 股","12":"B 股","13":"权证","14":"期货","15":"债券",
            "21":"开基","22":"ETF","23":"LOF","24":"货基","25":"QDII","26":"封基",
            "31":"港股","32":"窝轮","41":"美股","42":"外期"}
            */
            suggestUrl: 'http://suggest3.sinajs.cn/suggest/?type=11,12,13,14,15&key={1}&name=suggestdata_{0}', //http://suggest3.sinajs.cn/suggest/?type=11,12,13,14,15&key=xtd&name=suggestdata_1438174826752
            stockUrl: 'http://hq.sinajs.cn/?rn={0}&list={1}', //http://hq.sinajs.cn/?rn=1438174827282&list=sh600036,sh600050,sh601857,sz000002
            stockColumns: '名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间'
                .split(','),
        },

        _userOptions,
        defaultUserOptions = {
            refreshInterval: 10000,
            displayColumns: [ /////////////////////////////////////////////////
                { id: 0, name: 'BB' },
                { id: 3, name: 'aa' },
                { id: 9, name: 'aa' },

                { id: 40, name: 'aa' },
                { id: 41, name: 'BB' },
                { id: 42, name: 'aa' },

                { id: 50, name: 'aa' },
                { id: 51, name: 'aa' },
                { id: 52, name: 'aa' },
                { id: 53, name: 'aa' },
                { id: 54, name: 'aa' },
                { id: 55, name: 'aa' },
                { id: 56, name: 'aa' },
                { id: 57, name: 'aa' },
                { id: 58, name: 'aa' },
            ],
            watchingStocks: [ /////////////////////////////////////////////////
                { sinaSymbol: 'sh000001', name: '【上证指数】' },
                { sinaSymbol: 'sz000002', name: '【万科A】', cost: 11.01, quantity: 2000 },
                { sinaSymbol: 'sh600036', name: '【万科A】', cost: 19.01, quantity: 3000 },
            ],
        },
        getUserOptions = function () {
            var userOptions = $.cookie(_appId);
            if (!userOptions) {
                return defaultUserOptions;
            }
            else {
                if (!(userOptions.refreshInterval >= 1000)) {
                    userOptions.refreshInterval = defaultUserOptions.refreshInterval;
                }
                if (!(userOptions.displayColumns && userOptions.displayColumns > 0)) {
                    userOptions.displayColumns = defaultUserOptions.displayColumns;
                }
                if (!userOptions.watchingStocks) {
                    userOptions.watchingStocks = defaultUserOptions.watchingStocks;
                }
                return userOptions;
            }
        },

        /******************** 初始化 ********************/
        _columnEngines = [],
        initColumnEngines = function () {
            // 远程 - 数据源栏位
            _options.nameColumnId = 0;
            _options.openingPriceColumnId = 1;
            _options.priceColumnId = 3;
            var stockColumnsLength = _options.stockColumns.length;
            for (var i = 0; i < stockColumnsLength; i++) {
                _columnEngines[i] = { id: i, name: _options.stockColumns[i], siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            }

            // 本地扩展 - 数据源栏位
            _options.sinaSymbolColumnId = 40;
            _columnEngines[_options.sinaSymbolColumnId] = { id: _options.sinaSymbolColumnId, name: '新浪代码', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };

            _options.costColumnId = 41;
            _columnEngines[_options.costColumnId] = { id: _options.costColumnId, name: '成本', siblings: _columnEngines, getClass: getClassDefault, getText: getTextForNumber, getValue: getValueDefault };

            _options.quantityColumnId = 42;
            _columnEngines[_options.quantityColumnId] = { id: _options.quantityColumnId, name: '持有量', siblings: _columnEngines, getClass: getClassDefault, getText: getTextForNumber, getValue: getValueDefault };

            // 本地扩展 - 非数据源栏位
            _options.changeColumnId = 50;
            _columnEngines[_options.changeColumnId] = {
                id: _options.changeColumnId, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextForNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.priceColumnId].getValue(data) - this.siblings[_options.openingPriceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _options.changeRateColumnId = 51;
            _columnEngines[_options.changeRateColumnId] = {
                id: _options.changeRateColumnId, name: '涨跌率', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.changeColumnId].getValue(data) / this.siblings[_options.priceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _options.symbolColumnId = 52;
            _columnEngines[_options.symbolColumnId] = {
                id: _options.symbolColumnId, name: '代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = this.siblings[_options.sinaSymbolColumnId].getText(data).replace(/[^\d]/g, '');
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _options.fullNameColumnId = 53;
            _columnEngines[_options.fullNameColumnId] = {
                id: _options.fullNameColumnId, name: '名称', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString('{2} <a title="新浪股票" href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q={0}" target="_blank">{1}</a>',
                            this.siblings[_options.sinaSymbolColumnId].getText(data),
                            this.siblings[_options.nameColumnId].getText(data),
                            this.siblings[_options.symbolColumnId].getText(data));
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _options.totalCostColumnId = 54;
            _columnEngines[_options.totalCostColumnId] = {
                id: _options.totalCostColumnId, name: '总成本', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextForNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.costColumnId].getValue(data) * this.siblings[_options.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _options.totalAmountColumnId = 55;
            _columnEngines[_options.totalAmountColumnId] = {
                id: _options.totalAmountColumnId, name: '总现值', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextForNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.priceColumnId].getValue(data) * this.siblings[_options.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _options.gainLossColumnId = 56;
            _columnEngines[_options.gainLossColumnId] = {
                id: _options.gainLossColumnId, name: '盈亏', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextForNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.totalAmountColumnId].getValue(data) - this.siblings[_options.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _options.gainLossRateColumnId = 57;
            _columnEngines[_options.gainLossRateColumnId] = {
                id: _options.gainLossRateColumnId, name: '盈亏率', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.gainLossColumnId].getValue(data) / this.siblings[_options.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _options.toolColumnId = 58;
            _columnEngines[_options.toolColumnId] = {
                id: _options.toolColumnId, name: '工具', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString('<a title=\"技术指标\" href=\"TI.htm?{0}\" target=\"_blank\">T</a>',
                            this.siblings[_options.sinaSymbolColumnId].getText(data));
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };
        },
        clearColumnEnginesCache = function () {
            var columnEnginesLength = _columnEngines.length;
            for (var i = 0; i < columnEnginesLength; i++) {
                if (_columnEngines[i]) {
                    _columnEngines[i]._class = undefined;
                    _columnEngines[i]._text = undefined;
                    _columnEngines[i]._value = undefined;
                }
            }
        },
        dataRetriever = $('<iframe class="hidden"></iframe>'),
        _init = function () {
            // 列数据处理引擎
            initColumnEngines();
            // 远程数据容器
            $(document.body).append(dataRetriever);
            // 启动
            stockRequest();
        },

        /******************** 公共方法 ********************/
        _formatString = function () {
            var args = [].slice.call(arguments);
            var pattern = new RegExp('{([0-' + (args.length - 2) + '])}', 'g');
            return args[0].replace(pattern, function (match, index) {
                return args[parseInt(index) + 1];
            });
        },
        _round = function (value, precision) {
            if (isNaN(value)) {
                return NaN;
            }
            precision = precision ? parseInt(precision) : 0;
            if (precision <= 0) {
                return Math.round(value);
            }
            return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
        },
        _getTicks = function () {
            return new Date().getTime();
        },
        _toShortNumberText = function (value) {
            if (isNaN(value)) {
                return NaN;
            }
            var unit8 = Math.pow(10, 8), unit4 = Math.pow(10, 4);
            return value >= unit8
                ? _round(value / unit8) + '亿'
                : (value >= unit4 ? _round(value / unit4) + '万' : _round(value, 2).toString());
        },
        _toPercentageText = function (value) {
            if (isNaN(value)) {
                return '';
            }
            return _round(value * 100, 2) + '%';
        },
        _requestData = function (args) {
            dataRetriever.attr('src', 'data.html?' + $.param(args));
        },

        /******************** 内部方法 ********************/
        getClassDefault = function (data) {
            if (this._class == undefined) {
                var value = this.siblings[_options.changeColumnId].getValue(data);
                this._class = value > 0
                    ? 'positive'
                    : (value < 0 ? 'negative' : '');
            }
            return this._class;
        },
        getTextDefault = function (data) {
            if (this._text == undefined) {
                var value = this.getValue(data);
                this._text = isNaN(value)
                    ? data[this.id]
                    : _toShortNumberText(value);
            }
            return this._text;
        },
        getValueDefault = function (data) {
            if (this._value == undefined) {
                this._value = Number(data[this.id]); // 返回数值或 NaN
            }
            return this._value;
        },
        getTextAsPercentage = function (data) {
            if (this._text == undefined) {
                this._text = _toPercentageText(this.getValue(data));
            }
            return this._text;
        },
        getClassForGainLoss = function (data) {
            if (this._class == undefined) {
                var value = this.siblings[_options.gainLossColumnId].getValue(data);
                this._class = value > 0
                    ? 'btn-danger'
                    : (value < 0 ? 'btn-success' : 'btn-default');
            }
            return this._class;
        },
        getTextForNumber = function (data) {
            if (this._text == undefined) {
                this._text = _round(this.getValue(data), 2);
            }
            return this._text;
        },

        stockTimer,
        stockRequest = function () {
            if (stockTimer) {
                stockTimer = window.clearTimeout(stockTimer);
            }

            _userOptions = getUserOptions();

            // 自选列表
            var stockList = '';
            var callbackArgs = [];
            var watchingStocksLength = _userOptions.watchingStocks.length;
            for (var i = 0; i < watchingStocksLength ; i++) {
                stockList += _userOptions.watchingStocks[i].sinaSymbol + ',';
                callbackArgs.push('hq_str_' + _userOptions.watchingStocks[i].sinaSymbol);
            }
            _requestData({
                url: _formatString(_options.stockUrl, _getTicks(), stockList),
                callback: 'ShadowStock.stockCallback',
                args: callbackArgs
            });
        },
        _stockCallback = function (args) {
            try {
                _stockTable.empty();
                var displayColumnsLength = _userOptions.displayColumns.length;
                var stockTableRow;

                // 表头
                var stockTableHead = $('<thead>').appendTo(_stockTable);
                stockTableRow = $('<tr>').appendTo(stockTableHead);
                for (var i = 0; i < displayColumnsLength ; i++) {
                    $('<th>').html(_columnEngines[_userOptions.displayColumns[i].id].name)
                        .appendTo(stockTableRow);
                }

                // 表体
                var stockTableBody = $('<tbody>').appendTo(_stockTable);
                for (var key in args) {
                    clearColumnEnginesCache();

                    var sinaSymbol = key.substr(key.lastIndexOf('_') + 1);
                    // 远程 - 数据源
                    var data = args[key].split(',');
                    // 本地扩展 - 数据源
                    data[_options.sinaSymbolColumnId] = sinaSymbol;
                    var watchingStock = findWatchingStock(sinaSymbol);
                    if (watchingStock) {
                        data[_options.costColumnId] = watchingStock.cost;
                        data[_options.quantityColumnId] = watchingStock.quantity;
                    }

                    stockTableRow = $('<tr>').appendTo(stockTableBody);
                    for (var i = 0; i < displayColumnsLength ; i++) {
                        $('<td>').data('sinaSymbol', _columnEngines[_options.sinaSymbolColumnId].getText(data))
                            .addClass(_columnEngines[_userOptions.displayColumns[i].id].getClass(data))
                            .html(_columnEngines[_userOptions.displayColumns[i].id].getText(data))
                            .appendTo(stockTableRow);
                    }
                }
            }
            finally {
                stockTimer = window.setTimeout(stockRequest, _userOptions.refreshInterval);
            }
        },
        findWatchingStock = function (sinaSymbol) {
            var watchingStocksLength = _userOptions.watchingStocks.length;
            for (var i = 0; i < watchingStocksLength ; i++) {
                if (_userOptions.watchingStocks[i].sinaSymbol == sinaSymbol) {
                    return _userOptions.watchingStocks[i];
                }
            }
            return null;
        },

        suggestRequest = function (keyword) {
            _requestData(_options.suggestUrl, {
                type: '11,12,13,14,15',
                key: '600036',
                name: 'suggestdata_' + _getTicks(),
                callback: 'ShadowStock.suggestCallback'
            });
        },
        _suggestCallback = function (data) {

        },

        /******************** 外部方法 ********************/
        _stockTable,
        _attachTable = function (table) {
            _stockTable = table.empty();
        },
        _attachSuggest = function (suggest) {
            //suggestText.autocomplete({
            //    source: "http://hq.sinajs.cn/rn=0&list=sz000002",
            //    minLength: 2,
            //    select: function (event, ui) {
            //        alert(ui.item ? ui.item.value : "Nothing");
            //    }
            //});
        }
    ;

    /******************** 导出 ********************/
    _shadowStock.appId = _appId;
    _shadowStock.appName = _appName;
    _shadowStock.appVersion = _appVersion;
    _shadowStock.options = _options;
    _shadowStock.userOptions = _userOptions;
    _shadowStock.columnEngines = _columnEngines;
    _shadowStock.stockTable = _stockTable;

    _shadowStock.formatString = _formatString;
    _shadowStock.round = _round;
    _shadowStock.getTicks = _getTicks;
    _shadowStock.toShortNumberText = _toShortNumberText;
    _shadowStock.toPercentageText = _toPercentageText;
    _shadowStock.requestData = _requestData;

    _shadowStock.attachSuggest = _attachSuggest;
    _shadowStock.attachTable = _attachTable;
    _shadowStock.stockCallback = _stockCallback;
    _shadowStock.suggestCallback = _suggestCallback;
    _shadowStock.init = _init;

    window.ShadowStock = _shadowStock;
})(this, this.document);