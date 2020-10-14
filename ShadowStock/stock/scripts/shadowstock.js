(function (window, document, undefined) {
    var _shadowStock = {},
        _appId = 'ShadowStock_SH_SZ',
        _appName = 'ShadowStock 影子证券',
        _appVersion = '3.0',
        _appUrl = 'https://github.com/heddaz/shadowin',

        /******************** 配置 ********************/
        _appSettings = {
            cookieExpires: 365,
            minRefreshInterval: 3000,
            maxWatchingStockCount: 22,
            suggestionUrl: 'http://stock-data.plusii.com/suggest/?type=11,12,72,73,81,31,41&key={1}&name={0}',
            stockUrl: 'http://stock-data.plusii.com/data/?rn={0}&list={1}',
            stockColumns: '名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间'
                .split(','),
            /*
            "11": "A 股",
            "12": "B 股",
            "13": "权证",
            "14": "期货",
            "15": "债券",
            "21": "开基",
            "22": "ETF",
            "23": "LOF",
            "24": "货基",
            "25": "QDII",
            "26": "封基",
            "31": "港股",
            "32": "窝轮",
            "33": "港指数",
            "41": "美股",
            "42": "外期",
            '81': '债券',
            '82': '债券',
            '103': '英股',
            '120': '债券',
            "111": "A股",
            "71": "外汇",
            "72": "基金",     //场内基金（带市场）
            "85": "期货",     //内盘期货
            "86": "期货",     //外盘期货
            "87": "期货",     //内盘期货连续，股指期货连续，50ETF期权
            "88": "期货",     //内盘股指期货
            "73": "新三板",
            "74": "板块",
            "75": "板块",     //新浪行业
            "76": "板块",     //申万行业
            "77": "板块",     //申万二级
            "78": "板块",     //热门概念（财汇概念）
            "79": "板块",     //地域板块
            "80": "板块",     //证监会行业
            "101": "基金",    //所有基金
            "100": "指数",    //全球指数
            "102": "指数",    //全部板块指数(概念、地域、行业)
            "103": "英股",
            "104": "国债", //暂时是美国国债"
            "105": "ETF", //美股ETF,国际线索组-中文站）"
            "106": "ETF", //美股ETF,国际线索组-英文站）"
            "107": "msci"
            */
            stockTypes: {
                "11": {
                    name: "Ａ股",
                    prefix: "",
                    columnMapping: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
                },
                "12": {
                    name: "Ｂ股",
                    prefix: "",
                    columnMapping: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
                },
                "72": {
                    name: "基金",
                    prefix: "",
                    columnMapping: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
                },
                "73": {
                    name: "三板",
                    prefix: "",
                    columnMapping: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
                },
                "81": {
                    name: "债券",
                    prefix: "",
                    columnMapping: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
                },
                "31": {
                    name: "港股",
                    prefix: "rt_hk",
                    columnMapping: [1, 2, 3, 6, 4, 5, -1, -1, 12, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, 18, 13]
                },
                "41": {
                    name: "美股",
                    prefix: "gb_",
                    columnMapping: [0, 5, 26, 1, 6, 7, -1, -1, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 14]
                }
            }
        },

        _userSettings,
        defaultUserSettings = {
            refreshInterval: 8000,
            blackMode: false,
            displayColumns: [
                { id: 50, name: '操作' },
                { id: 54, name: '名称代码' },
                { id: 3, name: '最新价' },
                { id: 51, name: '涨跌' },
                { id: 52, name: '涨跌率' },
                { id: 4, name: '最高' },
                { id: 5, name: '最低' },
                { id: 1, name: '今开' },
                { id: 2, name: '昨收' },
                { id: 9, name: '成交额' },
                { id: 41, name: '成本' },
                { id: 42, name: '持有量' },
                { id: 58, name: '盈亏率' },
                { id: 57, name: '盈亏' },
                { id: 31, name: '时间' },
                { id: 59, name: '工具' }
            ],
            watchingStocks: [
                { sinaSymbol: 'sh000001', type: '11', name: '上证指数' },
                { sinaSymbol: 'sz399006', type: '11', name: '创业板指' },
                { sinaSymbol: 'sz000002', type: '11', name: '万科A' },
                { sinaSymbol: 'rt_hk00700', type: '31', name: '腾讯控股' },
                { sinaSymbol: 'gb_msft', type: '41', name: '微软' }
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
            $.cookie(_appId, _userSettings, { expires: _appSettings.cookieExpires });
        },

        /******************** 初始化 ********************/
        _columnEngines = [],
        initColumnEngines = function () {
            // 远程 - 数据源栏位
            _appSettings.nameColumnId = 0;
            _appSettings.closingPriceColumnId = 2;
            _appSettings.priceColumnId = 3;
            var stockColumnsLength = _appSettings.stockColumns.length;
            for (var i = 0; i < stockColumnsLength; i++) {
                _columnEngines[i] = { id: i, name: _appSettings.stockColumns[i], siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            }

            // 本地扩展 - 数据源栏位
            _appSettings.sinaSymbolColumnId = 40;
            _columnEngines[_appSettings.sinaSymbolColumnId] = { id: _appSettings.sinaSymbolColumnId, name: '新浪代码', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };

            _appSettings.costColumnId = 41;
            _columnEngines[_appSettings.costColumnId] = { id: _appSettings.costColumnId, name: '成本', siblings: _columnEngines, getClass: getClassDefault, getText: getTextAsNumber, getValue: getValueDefault };

            _appSettings.quantityColumnId = 42;
            _columnEngines[_appSettings.quantityColumnId] = { id: _appSettings.quantityColumnId, name: '持有量', siblings: _columnEngines, getClass: getClassDefault, getText: getTextAsNumber, getValue: getValueDefault };

            _appSettings.displayNameColumnId = 43;
            _columnEngines[_appSettings.displayNameColumnId] = { id: _appSettings.displayNameColumnId, name: '显示名', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };

            // 本地扩展 - 非数据源栏位
            _appSettings.actionsColumnId = 50;
            _columnEngines[_appSettings.actionsColumnId] = {
                id: _appSettings.actionsColumnId, name: '操作', siblings: _columnEngines,
                getClass: getClassAsNone,
                getText: function (data) {
                    var sinaSymbol = this.siblings[_appSettings.sinaSymbolColumnId].getText(data);
                    var actionPanel = $('<div class="container-action">');

                    $('<span class="glyphicon glyphicon-move" role="handle" title="排序"></span>')
                        .attr('data-id', sinaSymbol)
                        .appendTo(actionPanel);
                    $('<span class="glyphicon glyphicon-edit" role="button"></span>')
                        .attr('data-id', sinaSymbol)
                        .attr('title', _formatString('编辑 - {0}', this.siblings[_appSettings.nameColumnId].getText(data)))
                        .attr('data-content', _formatString('<iframe frameborder="0" scrolling="no" class="editor" src="editor.html?{0}"></iframe>', escape(JSON.stringify({
                            token: sinaSymbol,
                            callback: 'ShadowStock.editorCallback',
                            cost: this.siblings[_appSettings.costColumnId].getText(data),
                            quantity: this.siblings[_appSettings.quantityColumnId].getText(data)
                        }))))
                        .appendTo(actionPanel);
                    $('<span class="glyphicon glyphicon-remove" role="button" title="删除"></span>')
                        .attr('data-id', sinaSymbol)
                        .appendTo(actionPanel);

                    return actionPanel[0].outerHTML;
                },
                getValue: getValueDefault
            };

            _appSettings.changeColumnId = 51;
            _columnEngines[_appSettings.changeColumnId] = {
                id: _appSettings.changeColumnId, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        if (this.siblings[_appSettings.priceColumnId].getValue(data) == 0) // 停牌或异常
                        {
                            this._value = 0;
                        }
                        else {
                            this._value = this.siblings[_appSettings.priceColumnId].getValue(data) - this.siblings[_appSettings.closingPriceColumnId].getValue(data);
                        }
                    }
                    return this._value;
                }
            };

            _appSettings.changeRateColumnId = 52;
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

            _appSettings.symbolColumnId = 53;
            _columnEngines[_appSettings.symbolColumnId] = {
                id: _appSettings.symbolColumnId, name: '代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        var text = this.siblings[_appSettings.sinaSymbolColumnId].getText(data);
                        if (/\d/g.test(text)) {
                            this._text = text.replace(/[^\d]/g, '');
                        }
                        else {
                            this._text = text.substr(text.lastIndexOf('_') + 1).toUpperCase();
                        }
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _appSettings.fullNameColumnId = 54;
            _columnEngines[_appSettings.fullNameColumnId] = {
                id: _appSettings.fullNameColumnId, name: '名称代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString('{2} <a title="新浪股票" href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q={0}" target="_blank">{1}</a>',
                            this.siblings[_appSettings.symbolColumnId].getText(data),
                            this.siblings[_appSettings.nameColumnId].getText(data),
                            this.siblings[_appSettings.symbolColumnId].getText(data));
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _appSettings.totalCostColumnId = 55;
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

            _appSettings.totalAmountColumnId = 56;
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

            _appSettings.gainLossColumnId = 57;
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

            _appSettings.gainLossRateColumnId = 58;
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

            _appSettings.toolColumnId = 59;
            _columnEngines[_appSettings.toolColumnId] = {
                id: _appSettings.toolColumnId, name: '工具', siblings: _columnEngines,
                getClass: getClassAsNone,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString(
                            ' <a title="成交" href="http://gu.qq.com/{0}/gp/detail" target="_blank">细</a>'
                            + ' <a title="股吧" href="http://guba.sina.com.cn/?s=bar&name={0}" target="_blank">论</a>'
                            + ' <a title="分红" href="http://stockpage.10jqka.com.cn/{1}/bonus/#bonuslist" target="_blank">红</a>'
                            + ' <a title="曲线" href="TI.htm?{0}" target="_blank">线</a>',
                            this.siblings[_appSettings.sinaSymbolColumnId].getText(data),
                            this.siblings[_appSettings.symbolColumnId].getText(data),
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
                if (column) {
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
        _round = function (value, precision) {
            if (!$.isNumeric(value)) {
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
            if (!$.isNumeric(value)) {
                return NaN;
            }
            var unit8 = Math.pow(10, 8), unit4 = Math.pow(10, 4);
            return value >= unit8
                ? _round(value / unit8, 2) + '亿'
                : (value >= unit4 ? _round(value / unit4, 2) + '万' : _round(value, 2).toString());
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
                if (!_userSettings.blackMode) {
                    var value = this.siblings[_appSettings.changeColumnId].getValue(data);
                    this._class = value > 0
                        ? 'positive'
                        : (value < 0 ? 'negative' : '');
                }
                else {
                    this._class = '';
                }
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
                    index = columnMapping[index]; // 根据股票类型，映射原始数据源中的栏位（扩展栏位索引从 40 开始，不进行映射）
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
                    index = columnMapping[index]; // 根据股票类型，映射原始数据源中的栏位（扩展栏位索引从 40 开始，不进行映射）
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
                this._text = _round(this.getValue(data), 2);
            }
            return this._text;
        },
        getClassForGainLoss = function (data) {
            if (this._class == undefined) {
                if (!_userSettings.blackMode) {
                    var value = this.siblings[_appSettings.gainLossColumnId].getValue(data);
                    this._class = value > 0
                        ? 'btn-danger'
                        : (value < 0 ? 'btn-success' : 'disabled');
                }
                else {
                    this._class = 'disabled';
                }
            }
            return this._class;
        },
        getClassAsNone = function (data) {
            return '';
        },

        stockVarPrefix = 'hq_str_',
        stockRequest = function () {
            _disableStockTimer(true);
            getUserSettings();

            // 自选列表
            var token = _getTicks();
            var vars = [];
            var stockList = '';
            var watchingStocksLength = _userSettings.watchingStocks.length;
            for (var i = 0; i < watchingStocksLength; i++) {
                stockList += _userSettings.watchingStocks[i].sinaSymbol + ',';
                vars[i] = stockVarPrefix + _userSettings.watchingStocks[i].sinaSymbol;
            }
            _requestData(stockRetriever, {
                token: token,
                url: _formatString(_appSettings.stockUrl, token, stockList),
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
                var hasActionsColumn = false;
                var stockTableHead = $('<thead>').appendTo(_elements.stockTable);
                stockTableRow = $('<tr>').appendTo(stockTableHead);
                for (var i = 0; i < displayColumnsLength; i++) {
                    var id = _userSettings.displayColumns[i].id;
                    $('<th>').html(_columnEngines[id].name)
                        .appendTo(stockTableRow);

                    if (!hasActionsColumn && id == _appSettings.actionsColumnId) {
                        hasActionsColumn = true;
                    }
                }

                // 表体
                var stockTableBody = $('<tbody>').appendTo(_elements.stockTable);
                for (var key in args) {
                    if (key == 'token') {
                        continue;
                    }

                    clearColumnEnginesCache();
                    var sinaSymbol = key.replace(stockVarPrefix, '');
                    // 远程 - 数据源
                    var data = args[key].split(',');
                    // 本地扩展 - 数据源
                    data[_appSettings.sinaSymbolColumnId] = sinaSymbol;
                    var i = _findIndex(_userSettings.watchingStocks, 'sinaSymbol', sinaSymbol);
                    if (i >= 0) {
                        var watchingStock = _userSettings.watchingStocks[i];
                        data[_appSettings.costColumnId] = watchingStock.cost;
                        data[_appSettings.quantityColumnId] = watchingStock.quantity;
                        data[_appSettings.displayNameColumnId] = watchingStock.name;
                        data.type = watchingStock.type;
                    }

                    stockTableRow = $('<tr>').appendTo(stockTableBody);
                    for (var i = 0; i < displayColumnsLength; i++) {
                        $('<td>').addClass(_columnEngines[_userSettings.displayColumns[i].id].getClass(data))
                            .html(_columnEngines[_userSettings.displayColumns[i].id].getText(data))
                            .appendTo(stockTableRow);
                    }
                }

                if (hasActionsColumn) {
                    assignActions();
                }
            }
            finally {
                _enableStockTimer(true);
            }
        },
        assignActions = function () {
            // 移动
            _elements.stockTable.children('tbody').sortable({
                handle: '.container-action>.glyphicon-move',
                cursor: 'move',
                axis: 'y',
                opacity: 0.9,
                revert: true,
                scroll: false,
                start: function (event, ui) { _disableStockTimer(); },
                stop: function (event, ui) { _enableStockTimer(); },
                update: function (event, ui) {
                    var watchingStocks = [];
                    $('.container-action>.glyphicon-move', ui.item.parent()).each(function (i) {
                        var i = _findIndex(_userSettings.watchingStocks, 'sinaSymbol', $(this).data('id'));
                        if (i >= 0) {
                            watchingStocks.push(_userSettings.watchingStocks[i]);
                        }
                    });
                    _userSettings.watchingStocks = watchingStocks;
                    setUserSettings();
                }
            });

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
                var sinaSymbol = $(this).data('id');
                if (confirm(_formatString('确定删除 {0} 吗？', sinaSymbol))) {
                    var i = _findIndex(_userSettings.watchingStocks, 'sinaSymbol', sinaSymbol);
                    if (i >= 0) {
                        var watchingStock = _userSettings.watchingStocks.splice(i, 1)[0];
                        setUserSettings();
                        showAlert(_formatString('{0} ({1}) 已删除', watchingStock.name, watchingStock.sinaSymbol));
                    }
                    else {
                        showAlert(_formatString('{0} 不存在', sinaSymbol));
                    }
                }
            });
        },

        suggestionVarPrefix = 'suggestion_',
        suggestionCache = {},
        suggestionRequest = function (term) {
            var keywords = escape(term.toLowerCase());
            var token = keywords;
            var vars = [];
            var suggestionName = suggestionVarPrefix + _getTicks();
            vars[0] = suggestionName;
            _requestData(suggestionRetriever, {
                token: token,
                url: _formatString(_appSettings.suggestionUrl, suggestionName, keywords),
                callback: 'ShadowStock.suggestionCallback',
                vars: vars
            });
        },
        _suggestionCallback = function (args) {
            for (var key in args) {
                if (key == 'token') {
                    continue;
                }

                var source = [];
                var suggestions = args[key].split(';');
                for (var i = 0; i < suggestions.length; i++) {
                    var suggestionData = suggestions[i].split(',');
                    if (suggestionData.length > 5 && _appSettings.stockTypes[suggestionData[1]]) {
                        source.push({
                            label: getSuggestionLabel(suggestionData),
                            value: getSuggestionValue(suggestionData)
                        });
                    }
                }

                var term = unescape(args.token);
                suggestionCache[term] = source;
                _elements.suggestionText.autocomplete('option', 'source', source);
                _elements.suggestionText.autocomplete('search', term); // 重新激活搜索以抵消异步延迟
                break;
            }
        },
        /*
        [suggest2.sinajs.cn]
        zglt,11,600050,sh600050,中国联通,zglt,中国联通,0
        orcl,41,orcl,oracle corp.,甲骨文,jgw,甲骨文,0
        txkg,31,00700,00700,腾讯控股,txkg,腾讯控股,10
        pfzz,81,110059,sh110059,浦发转债,pfzz,浦发转债,0
        510500,72,510500,sh510500,500etf,500etf,500ETF,0
        cb5,73,400002,sb400002,长白5,cb5,长白5,0
        */
        getSuggestionLabel = function (data) {
            var typeId = data[1];
            return _formatString('[{0}] {1} {2} {3}', _appSettings.stockTypes[typeId].name, data[5], data[2], data[4]);
        },
        getSuggestionValue = function (data) {
            var typeId = data[1];
            var prefix = _appSettings.stockTypes[typeId].prefix;
            if (prefix) {
                return _formatString('{0}|{1}', prefix + data[2], typeId);
            }
            else {
                return _formatString('{0}|{1}', data[3], typeId);
            }
        },

        _editorCallback = function (args) {
            try {
                switch (args.result) {
                    case 'save':
                        var i = _findIndex(_userSettings.watchingStocks, 'sinaSymbol', args.token);
                        if (i >= 0) {
                            var watchingStock = _userSettings.watchingStocks[i];
                            watchingStock.cost = $.isNumeric(args.cost)
                                ? Number(args.cost)
                                : undefined;
                            watchingStock.quantity = $.isNumeric(args.quantity)
                                ? Number(args.quantity)
                                : undefined;

                            setUserSettings();
                            showAlert(_formatString('{0} ({1}) 已更新, 成本: {2} 持有量: {3}', watchingStock.name, watchingStock.sinaSymbol, watchingStock.cost, watchingStock.quantity));
                        }
                        break;

                    case 'clear':
                        var i = _findIndex(_userSettings.watchingStocks, 'sinaSymbol', args.token);
                        if (i >= 0) {
                            var watchingStock = _userSettings.watchingStocks[i];
                            watchingStock.cost = undefined;
                            watchingStock.quantity = undefined;

                            setUserSettings();
                            showAlert(_formatString('{0} ({1}) 已更新, 成本: {2} 持有量: {3}', watchingStock.name, watchingStock.sinaSymbol, watchingStock.cost, watchingStock.quantity));
                        }
                        break;

                    case 'cancel':
                    default:
                        break;
                }
            }
            finally {
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
                        _userSettings.displayColumns = args.displayColumns;
                        setUserSettings();
                        showAlert('设置已更新，立即生效');
                        break;

                    case 'cancel':
                    default:
                        break;
                }
            }
            finally {
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
            }
            finally {
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
            }
            finally {
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
                            var values = ui.item.value.split('|'); // 对应 getSuggestionValue
                            var sinaSymbol = values[0].replace(/\./g, '$'); // 新浪标记里 "." 需替换为 "$"
                            var type = values[1];

                            var i = _findIndex(_userSettings.watchingStocks, 'sinaSymbol', sinaSymbol);
                            if (i >= 0) {
                                var watchingStock = _userSettings.watchingStocks[i];
                                showAlert(_formatString('{0} ({1}) 已存在', watchingStock.name, watchingStock.sinaSymbol));
                            }
                            else {
                                var name = ui.item.label.substr(ui.item.label.lastIndexOf(' ') + 1); // 对应 getSuggestionLabel
                                _userSettings.watchingStocks.push({
                                    sinaSymbol: sinaSymbol,
                                    type: type,
                                    name: name
                                });
                                setUserSettings();
                                showAlert(_formatString('{0} ({1}) 已添加', name, sinaSymbol));
                            }
                        }
                        else {
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
