(function (window, document, undefined) {
    var _shadowStock = {},
        _appId = 'ShadowStock_QQ',
        _appName = 'ShadowStock 影子证券',
        _appVersion = '4.0',
        _appUrl = 'https://github.com/heddaz/shadowin',

        /******************** 配置 ********************/
        itemSeparator = ',',
        internalTag = '!',
        columnMapping1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        columnMapping2 = [0, 1, 2, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, 25, 26, 27, 28, -1, 30],
        _appSettings = {
            cookieExpires: 365,
            minRefreshInterval: 8000,
            maxWatchingStockCount: 25,
            suggestionUrl: 'http://stock-data.plusii.com/suggest/?k={0}',
            stockUrl: 'http://stock-data.plusii.com/data/?s={0}&t={1}',
            // suggestionUrl: 'https://proxy.finance.qq.com/smartboxgtimg/s3/?q={0}&v=2&t=all',
            // stockUrl: 'https://web.sqt.gtimg.cn/utf8/?q={0}&r={1}&offset=2,4,5,6,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,35,37,38,39,40',
            stockColumns: '名称,最新价,昨收,今开,买①,买①量,买②,买②量,买③,买③量,买④,买④量,买⑤,买⑤量,卖①,卖①量,卖②,卖②量,卖③,卖③量,卖④,卖④量,卖⑤,卖⑤量,!日期时间,最高,最低,成交量,成交额(万),换手率,市盈率'.split(itemSeparator),
            stockTypes: {
                "shGP-A": {
                    name: "Ａ股",
                    prefix: "sh",
                    columnMapping: columnMapping1
                },
                "szGP-A": {
                    name: "Ａ股",
                    prefix: "sz",
                    columnMapping: columnMapping1
                },
                "shGP-B": {
                    name: "Ｂ股",
                    prefix: "sh",
                    columnMapping: columnMapping1
                },
                "szGP-B": {
                    name: "Ｂ股",
                    prefix: "sz",
                    columnMapping: columnMapping1
                },
                "shGP-A-KCB": {
                    name: "科创",
                    prefix: "sh",
                    columnMapping: columnMapping1
                },

                "shZS": {
                    name: "指数",
                    prefix: "sh",
                    columnMapping: columnMapping1
                },
                "szZS": {
                    name: "指数",
                    prefix: "sz",
                    columnMapping: columnMapping1
                },

                "shETF": {
                    name: "基金",
                    prefix: "sh",
                    columnMapping: columnMapping1
                },
                "szETF": {
                    name: "基金",
                    prefix: "sz",
                    columnMapping: columnMapping1
                },

                "nqGP": {
                    name: "三板",
                    prefix: "nq",
                    columnMapping: columnMapping2
                },

                "hkGP": {
                    name: "港股",
                    prefix: "hk",
                    columnMapping: columnMapping2
                },
                "usGP": {
                    name: "美股",
                    prefix: "us",
                    columnMapping: columnMapping2
                }
            }
        },

        _userSettings,
        defaultUserSettings = {
            refreshInterval: 8000,
            blackMode: false,
            simplifiedMode: false,
            displayColumns: [
                {id: 60, name: '操作'},
                {id: 63, name: '名称代码'},
                {id: 1, name: '最新价'},
                {id: 61, name: '涨跌'},
                {id: 62, name: '涨跌率'},
                {id: 25, name: '最高'},
                {id: 26, name: '最低'},
                {id: 3, name: '今开'},
                {id: 2, name: '昨收'},
                {id: 30, name: '市盈率'},
                {id: 28, name: '成交额'},
                {id: 41, name: '成本'},
                {id: 42, name: '持有量'},
                {id: 67, name: '盈亏率'},
                {id: 66, name: '盈亏'},
                {id: 51, name: '时间'},
                {id: 68, name: '工具'}
            ],
            watchingStocks: [
                {symbol: 'sh000001', type: 'shZS', name: '上证指数'},
                {symbol: 'sz399006', type: 'szZS', name: '创业板指'},
                {symbol: 'sh600000', type: 'shGP-A', name: '浦发银行'},
                {symbol: 'sz000002', type: 'szGP-A', name: '万科A'},
                {symbol: 'hk00700', type: 'hkGP', name: '腾讯控股'},
                {symbol: 'usMSFT', type: 'usGP', name: '微软'}
            ]
        },
        getUserSettings = function () {
            var userSettings = $.cookie(_appId);
            if (!userSettings) {
                _userSettings = defaultUserSettings;
                return;
            }

            if (!(userSettings.refreshInterval >= _appSettings.minRefreshInterval)) {
                userSettings.refreshInterval = defaultUserSettings.refreshInterval;
            }
            if (!(userSettings.displayColumns && userSettings.displayColumns.length > 0)) {
                userSettings.displayColumns = defaultUserSettings.displayColumns;
            }
            if (!userSettings.watchingStocks) {
                userSettings.watchingStocks = defaultUserSettings.watchingStocks;
            }
            _userSettings = userSettings;
            return;
        },
        setUserSettings = function () {
            $.cookie(_appId, _userSettings, {expires: _appSettings.cookieExpires});
        },

        /******************** 初始化 ********************/
        _columnEngines = [],
        initColumnEngines = function () {
            // 关键栏位
            _appSettings.nameColumnId = 0; // 名称
            _appSettings.priceColumnId = 1; // 最新价
            _appSettings.closingPriceColumnId = 2; // 昨收
            _appSettings.dateTimeColumnId = 24; // 日期时间

            // 远程 - 数据源
            var stockColumnsLength = _appSettings.stockColumns.length;
            for (var i = 0; i < stockColumnsLength; i++) {
                _columnEngines[i] = {
                    id: i,
                    name: _appSettings.stockColumns[i],
                    siblings: _columnEngines,
                    getClass: getClassDefault,
                    getText: getTextDefault,
                    getValue: getValueDefault
                };
            }

            // 本地扩展 - 存储栏位
            _appSettings.symbolColumnId = 40;
            _columnEngines[_appSettings.symbolColumnId] = {
                id: _appSettings.symbolColumnId,
                name: '代码',
                siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: getValueDefault
            };

            _appSettings.costColumnId = 41;
            _columnEngines[_appSettings.costColumnId] = {
                id: _appSettings.costColumnId,
                name: '成本',
                siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsNumber,
                getValue: getValueDefault
            };

            _appSettings.quantityColumnId = 42;
            _columnEngines[_appSettings.quantityColumnId] = {
                id: _appSettings.quantityColumnId,
                name: '持有量',
                siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsNumber,
                getValue: getValueDefault
            };

            _appSettings.displayNameColumnId = 43;
            _columnEngines[_appSettings.displayNameColumnId] = {
                id: _appSettings.displayNameColumnId,
                name: '显示名',
                siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: getValueDefault
            };

            // 本地扩展 - 数据包装
            _appSettings.shortSymbolColumnId = 50;
            _columnEngines[_appSettings.shortSymbolColumnId] = {
                id: _appSettings.shortSymbolColumnId, name: '短代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        var text = this.siblings[_appSettings.symbolColumnId].getText(data);
                        this._text = text.substr(2);
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _appSettings.timeColumnId = 51;
            _columnEngines[_appSettings.timeColumnId] = {
                id: _appSettings.timeColumnId, name: '时间', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        /* 数据示例
                        20220225161403
                        2022-02-25 16:00:03
                        2022/02/25 16:09:10
                        */
                        var text = data[_appSettings.dateTimeColumnId];
                        if (text) {
                            if (text.indexOf(':') < 0) {
                                text = text.slice(0, -4) + ':' + text.slice(-4);
                                text = text.slice(0, -2) + ':' + text.slice(-2);
                            }
                            this._text = text.slice(-8);
                        } else {
                            this._text = null;
                        }
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            // 本地扩展 - 功能栏位
            _appSettings.actionsColumnId = 60;
            _columnEngines[_appSettings.actionsColumnId] = {
                id: _appSettings.actionsColumnId, name: '操作', siblings: _columnEngines,
                getClass: getClassAsNone,
                getText: function (data) {
                    var symbol = this.siblings[_appSettings.symbolColumnId].getText(data);
                    var actionPanel = $('<div class="container-action">');
                    var displayName = this.siblings[_appSettings.displayNameColumnId].getText(data);
                    var name = this.siblings[_appSettings.nameColumnId].getText(data);
                    if (!name || name == '0') {
                        name = displayName;
                    }
                    $('<span class="glyphicon glyphicon-move" role="handle" title="排序"></span>')
                        .attr('data-id', symbol)
                        .appendTo(actionPanel);
                    $('<span class="glyphicon glyphicon-edit" role="button" title="编辑"></span>')
                        .attr('data-id', symbol)
                        .attr('title', _formatString('编辑 {0}', name))
                        .attr('data-content', _formatString('<iframe frameborder="0" scrolling="no" class="editor" src="editor.html?{0}"></iframe>', escape(JSON.stringify({
                            token: symbol,
                            callback: 'ShadowStock.editorCallback',
                            name: name,
                            displayName: displayName,
                            cost: this.siblings[_appSettings.costColumnId].getText(data),
                            quantity: this.siblings[_appSettings.quantityColumnId].getText(data)
                        }))))
                        .appendTo(actionPanel);
                    $('<span class="glyphicon glyphicon-remove" role="button" title="删除"></span>')
                        .attr('data-id', symbol)
                        .attr('title', name)
                        .appendTo(actionPanel);

                    return actionPanel[0].outerHTML;
                },
                getValue: getValueDefault
            };

            _appSettings.changeColumnId = 61;
            _columnEngines[_appSettings.changeColumnId] = {
                id: _appSettings.changeColumnId, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        if (this.siblings[_appSettings.priceColumnId].getValue(data) == 0) // 停牌或异常
                        {
                            this._value = 0;
                        } else {
                            this._value = this.siblings[_appSettings.priceColumnId].getValue(data) - this.siblings[_appSettings.closingPriceColumnId].getValue(data);
                        }
                    }
                    return this._value;
                }
            };

            _appSettings.changeRateColumnId = 62;
            _columnEngines[_appSettings.changeRateColumnId] = {
                id: _appSettings.changeRateColumnId, name: '涨跌率', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_appSettings.changeColumnId].getValue(data) / this.siblings[_appSettings.closingPriceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _appSettings.fullNameColumnId = 63;
            _columnEngines[_appSettings.fullNameColumnId] = {
                id: _appSettings.fullNameColumnId, name: '名称代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString('{1} <a title="腾讯股票" href="https://gu.qq.com/{0}" target="_blank">{2}</a>',
                            this.siblings[_appSettings.symbolColumnId].getText(data),
                            this.siblings[_appSettings.shortSymbolColumnId].getText(data),
                            this.siblings[_appSettings.displayNameColumnId].getText(data));
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _appSettings.totalCostColumnId = 64;
            _columnEngines[_appSettings.totalCostColumnId] = {
                id: _appSettings.totalCostColumnId, name: '总成本', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_appSettings.costColumnId].getValue(data) * this.siblings[_appSettings.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _appSettings.totalAmountColumnId = 65;
            _columnEngines[_appSettings.totalAmountColumnId] = {
                id: _appSettings.totalAmountColumnId, name: '总现值', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_appSettings.priceColumnId].getValue(data) * this.siblings[_appSettings.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _appSettings.gainLossColumnId = 66;
            _columnEngines[_appSettings.gainLossColumnId] = {
                id: _appSettings.gainLossColumnId, name: '盈亏', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextAsNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_appSettings.totalAmountColumnId].getValue(data) - this.siblings[_appSettings.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _appSettings.gainLossRateColumnId = 67;
            _columnEngines[_appSettings.gainLossRateColumnId] = {
                id: _appSettings.gainLossRateColumnId, name: '盈亏率', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_appSettings.gainLossColumnId].getValue(data) / this.siblings[_appSettings.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };

            _appSettings.toolColumnId = 68;
            _columnEngines[_appSettings.toolColumnId] = {
                id: _appSettings.toolColumnId, name: '工具', siblings: _columnEngines,
                getClass: getClassAsNone,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString(
                            ' <a title="新闻" href="https://gu.qq.com/{0}/gp/news" target="_blank">新</a>'
                            + ' <a title="成交" href="https://gu.qq.com/{0}/gp/detail" target="_blank">细</a>'
                            + ' <a title="评论" href="https://guba.sina.com.cn/?s=bar&name={0}" target="_blank">评</a>'
                            + ' <a title="分红" href="http://stockpage.10jqka.com.cn/{1}/bonus/#bonuslist" target="_blank">红</a>'
                            + ' <a title="曲线" href="TI.htm?{0}" target="_blank">线</a>',
                            this.siblings[_appSettings.symbolColumnId].getText(data),
                            this.siblings[_appSettings.shortSymbolColumnId].getText(data),
                            _getTicks());
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _appSettings.availableColumns = [];
            var columnEnginesLength = _columnEngines.length;
            for (var i = 0; i < columnEnginesLength; i++) {
                var column = _columnEngines[i];
                if (column && column.name && column.name[0] !== internalTag) {
                    _appSettings.availableColumns.push({
                        id: column.id,
                        name: column.name
                    });
                }
            }
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
        stockRetriever = $('<iframe class="hidden"></iframe>'),
        suggestionRetriever = $('<iframe class="hidden"></iframe>'),
        _init = function () {
            $.cookie.json = true;
            // 远程数据容器
            $(document.body).append(stockRetriever).append(suggestionRetriever);
            // 列数据处理引擎
            initColumnEngines();
            // 用户设置
            getUserSettings();
        },
        _start = function () {
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
        _round = function (value, precision, flexiblePrecision) {
            if (!$.isNumeric(value)) {
                return NaN;
            }
            precision = precision ? parseInt(precision) : 0;
            if (precision <= 0) {
                return Math.round(value);
            }

            // 松散模式的四舍五入会多往后考虑一位，若不是 0 则多保留一位
            if (flexiblePrecision) {
                var tempValue = value * Math.pow(10, precision + 1);
                if (tempValue % 10 != 0) {
                    precision++;
                }
            }

            return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
        },
        _getTicks = function () {
            return new Date().getTime();
        },
        _toShortNumberText = function (value) {
            if (!$.isNumeric(value)) {
                return NaN;
            }
            var unit8 = Math.pow(10, 8), unit4 = Math.pow(10, 4);
            return value >= unit8
                ? _round(value / unit8, 2) + '亿'
                : (value >= unit4 ? _round(value / unit4, 2) + '万' : _round(value, 2, true).toString());
        },
        _toPercentageText = function (value) {
            if (!$.isNumeric(value)) {
                return '';
            }
            return _round(value * 100, 2) + '%';
        },
        _requestData = function (retriever, args) {
            retriever.attr('src', _formatString('data.html?{0}', escape(JSON.stringify((args)))));
        },
        _findIndex = function (array, keyName, key) {
            var arrayLength = array.length;
            for (var i = 0; i < arrayLength; i++) {
                if (array[i][keyName] == key) {
                    return i;
                }
            }
            return -1;
        },

        /******************** 内部方法 ********************/
        getClassDefault = function (data) {
            if (this._class == undefined) {
                var value = this.siblings[_appSettings.changeColumnId].getValue(data);
                this._class = value > 0
                    ? 'positive'
                    : (value < 0 ? 'negative' : '');
            }
            return this._class;
        },
        getTextDefault = function (data) {
            if (this._text == undefined) {
                var columnMapping = _appSettings.stockTypes[data.type]
                    ? _appSettings.stockTypes[data.type].columnMapping
                    : null;
                var index = this.id;
                if (columnMapping && this.id < columnMapping.length) {
                    index = columnMapping[index]; // 根据股票类型，映射原始数据源中的栏位
                    if (!$.isNumeric(index) || index < 0) { // 不存在映射
                        this._text = '';
                        return this._text;
                    }
                }

                var value = this.getValue(data);
                this._text = $.isNumeric(value)
                    ? _toShortNumberText(value)
                    : data[index];
            }
            return this._text;
        },
        getValueDefault = function (data) {
            if (this._value == undefined) {
                var columnMapping = _appSettings.stockTypes[data.type]
                    ? _appSettings.stockTypes[data.type].columnMapping
                    : null;
                var index = this.id;
                if (columnMapping && this.id < columnMapping.length) {
                    index = columnMapping[index]; // 根据股票类型，映射原始数据源中的栏位
                    if (!$.isNumeric(index) || index < 0) { // 不存在映射
                        this._value = '';
                        return this._value;
                    }
                }

                this._value = Number(data[index]); // 返回数值或 NaN
            }
            return this._value;
        },
        getTextAsPercentage = function (data) {
            if (this._text == undefined) {
                this._text = _toPercentageText(this.getValue(data));
            }
            return this._text;
        },
        getTextAsNumber = function (data) {
            if (this._text == undefined) {
                this._text = _round(this.getValue(data), 2, true);
            }
            return this._text;
        },
        getClassForGainLoss = function (data) {
            if (this._class == undefined) {
                var value = this.siblings[_appSettings.gainLossColumnId].getValue(data);
                this._class = value > 0
                    ? 'btn-danger'
                    : (value < 0 ? 'btn-success' : 'disabled');
            }
            return this._class;
        },
        getClassAsNone = function (data) {
            return '';
        },

        stockVarPrefix = 'v_',
        stockDataSeparator = '~',
        stockRequest = function () {
            _disableStockTimer(true);
            getUserSettings();

            // 自选列表
            var token = _getTicks();
            var vars = [];
            var stockList = '';
            var watchingStocksLength = _userSettings.watchingStocks.length;
            for (var i = 0; i < watchingStocksLength; i++) {
                stockList += _userSettings.watchingStocks[i].symbol + itemSeparator;
                vars[i] = stockVarPrefix + _userSettings.watchingStocks[i].symbol;
            }
            _requestData(stockRetriever, {
                token: token,
                url: _formatString(_appSettings.stockUrl, stockList, token),
                callback: 'ShadowStock.stockCallback',
                vars: vars
            });
        },
        _stockCallback = function (args) {
            if (!duringStockRefresh) {
                return;
            }

            try {
                _elements.stockTable.empty();
                var displayColumnsLength = _userSettings.displayColumns.length;
                var stockTableRow;

                // 表头
                var stockTableHead = $('<thead>').addClass('mode-simplified').appendTo(_elements.stockTable);
                stockTableRow = $('<tr>').appendTo(stockTableHead);
                for (var i = 0; i < displayColumnsLength; i++) {
                    var id = _userSettings.displayColumns[i].id;
                    $('<th>').html(_columnEngines[id].name)
                        .appendTo(stockTableRow);
                }

                // 表体
                var stockTableBody = $('<tbody>').addClass('mode-black').appendTo(_elements.stockTable);
                for (var key in args) {
                    if (key == 'token') {
                        continue;
                    }

                    clearColumnEnginesCache();
                    var symbol = key.replace(stockVarPrefix, '');
                    // 远程 - 数据源
                    var data = args[key].split(stockDataSeparator);
                    // 本地扩展 - 数据源
                    data[_appSettings.symbolColumnId] = symbol;
                    var i = _findIndex(_userSettings.watchingStocks, 'symbol', symbol);
                    if (i >= 0) {
                        var watchingStock = _userSettings.watchingStocks[i];
                        data[_appSettings.displayNameColumnId] = watchingStock.name;
                        data[_appSettings.costColumnId] = watchingStock.cost;
                        data[_appSettings.quantityColumnId] = watchingStock.quantity;
                        data.type = watchingStock.type;
                    }

                    stockTableRow = $('<tr>').appendTo(stockTableBody);
                    for (var i = 0; i < displayColumnsLength; i++) {
                        $('<td>').addClass(_columnEngines[_userSettings.displayColumns[i].id].getClass(data))
                            .html(_columnEngines[_userSettings.displayColumns[i].id].getText(data))
                            .appendTo(stockTableRow);
                    }
                }

                // 操作响应
                assignActions();

                // 界面模式
                if (_userSettings.blackMode) {
                    if ($('button.mode-black').hasClass('btn-info')) {
                        $('button.mode-black').removeClass('btn-info').addClass('btn-default');
                    }
                    $('.mode-black td').removeAttr('class');
                } else {
                    if (!$('button.mode-black').hasClass('btn-info')) {
                        $('button.mode-black').removeClass('btn-default').addClass('btn-info');
                    }
                }
                if (_userSettings.simplifiedMode) {
                    $('.mode-simplified').hide();
                } else {
                    $('.mode-simplified').show();
                }
                if (_userSettings.blackMode || _userSettings.simplifiedMode) {
                    $('.notice').hide();
                } else {
                    $('.notice').show();
                }
            } finally {
                _enableStockTimer(true);
            }
        },
        assignActions = function () {
            // 移动
            if ($('.container-action>.glyphicon-move', _elements.stockTable).length > 0) {
                _elements.stockTable.children('tbody').sortable({
                    handle: '.container-action>.glyphicon-move',
                    cursor: 'move',
                    axis: 'y',
                    opacity: 0.9,
                    revert: true,
                    scroll: false,
                    start: function (event, ui) {
                        _disableStockTimer();
                    },
                    stop: function (event, ui) {
                        _enableStockTimer();
                    },
                    update: function (event, ui) {
                        var watchingStocks = [];
                        $('.container-action>.glyphicon-move', ui.item.parent()).each(function (i) {
                            var i = _findIndex(_userSettings.watchingStocks, 'symbol', $(this).data('id'));
                            if (i >= 0) {
                                watchingStocks.push(_userSettings.watchingStocks[i]);
                            }
                        });
                        _userSettings.watchingStocks = watchingStocks;
                        setUserSettings();
                    }
                });
            }

            // 编辑
            $('.container-action>.glyphicon-edit', _elements.stockTable).popover({
                html: true,
                trigger: 'manual',
                placement: 'right'
            }).on('show.bs.popover', function () {
                _disableStockTimer();
            }).on('hidden.bs.popover', function () {
                _enableStockTimer();
            }).click(function () {
                $(this).popover('show');
            });

            // 删除
            $('.container-action>.glyphicon-remove', _elements.stockTable).click(function () {
                var symbol = $(this).data('id');
                var title = $(this).attr('title');
                if (confirm(_formatString('确定删除 {0}？', title))) {
                    var i = _findIndex(_userSettings.watchingStocks, 'symbol', symbol);
                    if (i >= 0) {
                        var watchingStock = _userSettings.watchingStocks.splice(i, 1)[0];
                        setUserSettings();
                        showAlert(_formatString('{0} ({1}) 已删除', watchingStock.name, watchingStock.symbol));
                    } else {
                        showAlert(_formatString('{0} 不存在', title));
                    }
                }
            });
        },

        suggestionVarName = 'v_hint',
        suggestionGroupSeparator = '^',
        suggestionDataSeparator = '~',
        suggestionLabelSeparator = ' ',
        suggestionValueSeparator = '.',
        suggestionInvalidSymbol = '-',
        suggestionCache = {},
        suggestionRequest = function (term) {
            var keyword = escape(term.toLowerCase());
            var token = keyword;
            var vars = [];
            vars[0] = suggestionVarName;
            _requestData(suggestionRetriever, {
                token: token,
                url: _formatString(_appSettings.suggestionUrl, keyword),
                callback: 'ShadowStock.suggestionCallback',
                vars: vars
            });
        },
        _suggestionCallback = function (args) {
            for (var key in args) {
                if (key == 'token') {
                    continue;
                }

                var term = unescape(args.token);
                var source = [];
                var suggestions = unescape(args[key]).split(suggestionGroupSeparator);
                for (var i = 0; i < suggestions.length; i++) {
                    var suggestionData = suggestions[i].split(suggestionDataSeparator);
                    if (suggestionData.length >= 5) {
                        var stockTypeId = suggestionData[0] + suggestionData[4]; // sz~000002~万科A~wka~GP-A ^ us~trtn-a.n~triton international ltd~*~GP
                        var stockType = _appSettings.stockTypes[stockTypeId];
                        if (stockType) {
                            var symbol = stockType.prefix + suggestionData[1].toUpperCase().split(suggestionValueSeparator)[0];
                            if (symbol.indexOf(suggestionInvalidSymbol) < 0) {
                                var label = _formatString('[{0}] {1} {2} {3}', stockType.name, suggestionData[3], suggestionData[1], suggestionData[2]);
                                var value = _formatString('{0}{1}{2}', symbol, suggestionValueSeparator, stockTypeId);
                                source.push({
                                    label: label,
                                    value: value
                                });
                            }
                        }
                    }
                }

                suggestionCache[term] = source;
                _elements.suggestionText.autocomplete('option', 'source', source);
                _elements.suggestionText.autocomplete('search', term); // 重新激活搜索以抵消异步延迟
                break;
            }
        },

        _editorCallback = function (args) {
            try {
                switch (args.result) {
                    case 'save':
                        var i = _findIndex(_userSettings.watchingStocks, 'symbol', args.token);
                        if (i >= 0) {
                            var watchingStock = _userSettings.watchingStocks[i];
                            watchingStock.name = args.displayName
                                ? args.displayName
                                : args.name;
                            watchingStock.cost = $.isNumeric(args.cost)
                                ? Number(args.cost)
                                : undefined;
                            watchingStock.quantity = $.isNumeric(args.quantity)
                                ? Number(args.quantity)
                                : undefined;

                            setUserSettings();
                            showAlert(_formatString('{0} ({1}) 已更新, 显示名: {2} 成本: {3} 持有量: {4}', args.name, watchingStock.symbol, watchingStock.name, watchingStock.cost, watchingStock.quantity));
                        }
                        break;

                    case 'clear':
                        var i = _findIndex(_userSettings.watchingStocks, 'symbol', args.token);
                        if (i >= 0) {
                            var watchingStock = _userSettings.watchingStocks[i];
                            watchingStock.name = args.name;
                            watchingStock.cost = undefined;
                            watchingStock.quantity = undefined;

                            setUserSettings();
                            showAlert(_formatString('{0} ({1}) 已更新, 显示名: {2} 成本: {3} 持有量: {4}', args.name, watchingStock.symbol, watchingStock.name, watchingStock.cost, watchingStock.quantity));
                        }
                        break;

                    case 'cancel':
                    default:
                        break;
                }
            } finally {
                $('.container-action>.glyphicon-edit').popover('hide');
            }
        },
        showAlert = function (message, duration) {
            if (!$.isNumeric(duration) || duration < 0) {
                duration = 2000;
            }
            _elements.alertPanel.html(message).slideDown(function () {
                var _this = $(this);
                window.setTimeout(function () {
                    _this.slideUp();
                }, duration);
            });
        },

        _settingsCallback = function (args) {
            try {
                switch (args.result) {
                    case 'save':
                        _userSettings.refreshInterval = args.refreshInterval;
                        _userSettings.blackMode = args.blackMode;
                        _userSettings.simplifiedMode = args.simplifiedMode;
                        _userSettings.displayColumns = args.displayColumns;
                        setUserSettings();
                        showAlert('设置已更新，立即生效');
                        break;

                    case 'cancel':
                    default:
                        break;
                }
            } finally {
                _elements.settingsButton.popover('hide');
            }
        },
        _impexpCallback = function (args) {
            try {
                switch (args.result) {
                    case 'save':
                        _userSettings = args.userSettings;
                        setUserSettings();
                        showAlert('设置已更新，立即生效');
                        break;

                    case 'cancel':
                    default:
                        break;
                }
            } finally {
                _elements.impexpButton.popover('hide');
            }
        },
        _aboutCallback = function (args) {
            try {
                switch (args.result) {
                    case 'cancel':
                    default:
                        break;
                }
            } finally {
                _elements.aboutButton.popover('hide');
            }
        },

        /******************** 外部方法 ********************/
        _elements,
        _attachElements = function (elements) {
            _elements = elements;
            if (_elements.stockTable) {
                _elements.stockTable.empty();
            }
            if (_elements.suggestionText) {
                _elements.suggestionText.focus(function () {
                    $(this).select();
                }).autocomplete({
                    minLength: 1,
                    autoFocus: true,
                    source: [],
                    search: function (event, ui) {
                        var term = event.target.value;
                        if (term) {
                            if (term in suggestionCache) {
                                _elements.suggestionText.autocomplete('option', 'source', suggestionCache[term]);
                                return;
                            }
                            suggestionRequest(term);
                        }
                    },
                    select: function (event, ui) {
                        if (_userSettings.watchingStocks.length < _appSettings.maxWatchingStockCount) {
                            // usTRTN.usGP sh600050.shGP-A
                            var values = ui.item.value.split(suggestionValueSeparator);
                            var symbol = values[0];
                            var type = values[1];

                            var i = _findIndex(_userSettings.watchingStocks, 'symbol', symbol);
                            if (i >= 0) {
                                var watchingStock = _userSettings.watchingStocks[i];
                                showAlert(_formatString('{0} ({1}) 已存在', watchingStock.name, watchingStock.symbol));
                            } else {
                                // [美股] * trtn.n triton international ltd [Ａ股] zglt 600050 中国联通
                                var name = ui.item.label;
                                for (var i = 0; i < 3; i++) {
                                    name = name.substr(name.indexOf(suggestionLabelSeparator) + 1);
                                }
                                _userSettings.watchingStocks.push({
                                    symbol: symbol,
                                    type: type,
                                    name: name
                                });
                                setUserSettings();
                                showAlert(_formatString('{0} ({1}) 已添加', name, symbol));
                            }
                        } else {
                            showAlert(_formatString('自选股数量请不要超过 {0}', _appSettings.maxWatchingStockCount));
                        }

                        $(event.target).focus().select();
                        return false;
                    }
                });
            }
            if (_elements.alertPanel) {
                _elements.alertPanel.hide();
            }
            if (_elements.settingsButton) {
                _elements.settingsButton.popover({
                    container: 'body',
                    html: true,
                    trigger: 'manual',
                    placement: 'bottom'
                }).click(function () {
                    var displayColumnsKey = 'cookieDisplayColumns';
                    var availableColumnsKey = 'cookieAvailableColumns';
                    $.cookie(displayColumnsKey, _userSettings.displayColumns);
                    $.cookie(availableColumnsKey, _appSettings.availableColumns);
                    $(this).attr('data-content', _formatString('<iframe frameborder="0" scrolling="no" class="settings" src="settings.html?{0}"></iframe>', escape(JSON.stringify({
                        token: _appId,
                        callback: 'ShadowStock.settingsCallback',
                        refreshInterval: _userSettings.refreshInterval,
                        blackMode: _userSettings.blackMode,
                        simplifiedMode: _userSettings.simplifiedMode,
                        displayColumns: displayColumnsKey,
                        availableColumns: availableColumnsKey,
                        actionsColumnId: _appSettings.actionsColumnId
                    })))).popover('show');
                });
            }
            if (_elements.impexpButton) {
                _elements.impexpButton.popover({
                    container: 'body',
                    html: true,
                    trigger: 'manual',
                    placement: 'bottom'
                }).click(function () {
                    var userSettingsKey = 'cookieUserSettings';
                    $.cookie(userSettingsKey, _userSettings);
                    $(this).attr('data-content', _formatString('<iframe frameborder="0" scrolling="no" class="impexp" src="impexp.html?{0}"></iframe>', escape(JSON.stringify({
                        token: _appId,
                        callback: 'ShadowStock.impexpCallback',
                        userSettings: userSettingsKey
                    })))).popover('show');
                    return false;
                });
            }
            if (_elements.aboutButton) {
                _elements.aboutButton.popover({
                    container: 'body',
                    html: true,
                    trigger: 'manual',
                    placement: 'bottom'
                }).click(function () {
                    $(this).attr('data-content', _formatString('<iframe frameborder="0" scrolling="no" class="about" src="about.html?{0}"></iframe>', escape(JSON.stringify({
                        token: _appId,
                        callback: 'ShadowStock.aboutCallback',
                        version: _appVersion
                    })))).popover('show');
                    return false;
                });
            }
        },

        stockTimer,
        duringStockRefresh,
        _enableStockTimer = function (forStockRefresh) {
            stockTimer = window.setTimeout(stockRequest, _userSettings.refreshInterval);
            duringStockRefresh = false;
        },
        _disableStockTimer = function (forStockRefresh) {
            duringStockRefresh = forStockRefresh;
            if (stockTimer) {
                stockTimer = window.clearTimeout(stockTimer);
            }
        };

    /******************** 导出 ********************/
    _shadowStock.appId = _appId;
    _shadowStock.appName = _appName;
    _shadowStock.appVersion = _appVersion;
    _shadowStock.appSettings = _appSettings;
    _shadowStock.userSettings = _userSettings;
    _shadowStock.columnEngines = _columnEngines;

    _shadowStock.formatString = _formatString;
    _shadowStock.round = _round;
    _shadowStock.getTicks = _getTicks;
    _shadowStock.toShortNumberText = _toShortNumberText;
    _shadowStock.toPercentageText = _toPercentageText;
    _shadowStock.requestData = _requestData;
    _shadowStock.findIndex = _findIndex;

    _shadowStock.elements = _elements;
    _shadowStock.attachElements = _attachElements;
    _shadowStock.stockCallback = _stockCallback;
    _shadowStock.suggestionCallback = _suggestionCallback;
    _shadowStock.editorCallback = _editorCallback;
    _shadowStock.settingsCallback = _settingsCallback;
    _shadowStock.impexpCallback = _impexpCallback;
    _shadowStock.aboutCallback = _aboutCallback;

    _shadowStock.enableStockTimer = _enableStockTimer;
    _shadowStock.disableStockTimer = _disableStockTimer;
    _shadowStock.init = _init;
    _shadowStock.start = _start;

    window.ShadowStock = _shadowStock;
})(this, this.document);
