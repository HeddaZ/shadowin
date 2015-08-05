(function (window, document, undefined) {
    var _shadowStock = {},
        _appId = 'ShadowStock_SH_SZ',
        _appName = 'ShadowStock 影子证券 - 沪深创业板',
        _appVersion = '2.0',

        /******************** 配置 ********************/
        _appSettings = {
            cookieExpires: new Date(9999, 1, 1),
            /*
            {"11":"A 股","12":"B 股","13":"权证","14":"期货","15":"债券",
            "21":"开基","22":"ETF","23":"LOF","24":"货基","25":"QDII","26":"封基",
            "31":"港股","32":"窝轮","41":"美股","42":"外期"}
            */
            suggestionUrl: 'http://suggest3.sinajs.cn/suggest/?type=11,12,13,14,15&key={1}&name={0}',
            stockUrl: 'http://hq.sinajs.cn/?rn={0}&list={1}',
            stockColumns: '名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间'
                .split(','),
        },

        _userSettings,
        defaultUserSettings = {
            refreshInterval: 5000,
            displayColumns: [ //////////////////////////???????????????????///////////////////////
                { id: 50, name: 'aa' },
                { id: 0, name: 'BB' },
                { id: 1, name: 'aa' },
                { id: 3, name: 'aa' },

                { id: 40, name: 'aa' },
                { id: 41, name: 'BB' },
                { id: 42, name: 'aa' },


                { id: 51, name: 'aa' },
                { id: 52, name: 'aa' },
                { id: 53, name: 'aa' },
                { id: 54, name: 'aa' },
                { id: 55, name: 'aa' },
                { id: 56, name: 'aa' },
                { id: 57, name: 'aa' },
                { id: 58, name: 'aa' }, { id: 59, name: 'aa' },
            ],
            watchingStocks: [ ///////////////////////////??????????????????//////////////////////
                { sinaSymbol: 'sh000001', name: '【上证指数】' },
                { sinaSymbol: 'sz000002', name: '【万科A】', cost: 11.01, quantity: 2000 },
                { sinaSymbol: 'sh600036', name: '【万科A】', cost: 19.01, quantity: 3000 },
            ],
        },
        getUserSettings = function () {
            var userSettings = $.cookie(_appId);
            if (!userSettings) {
                return defaultUserSettings;
            }
            else {
                if (!(userSettings.refreshInterval >= 1000)) {
                    userSettings.refreshInterval = defaultUserSettings.refreshInterval;
                }
                if (!(userSettings.displayColumns && userSettings.displayColumns > 0)) {
                    userSettings.displayColumns = defaultUserSettings.displayColumns;
                }
                if (!userSettings.watchingStocks) {
                    userSettings.watchingStocks = defaultUserSettings.watchingStocks;
                }
                return userSettings;
            }
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
            _columnEngines[_appSettings.costColumnId] = { id: _appSettings.costColumnId, name: '成本', siblings: _columnEngines, getClass: getClassDefault, getText: getTextForNumber, getValue: getValueDefault };

            _appSettings.quantityColumnId = 42;
            _columnEngines[_appSettings.quantityColumnId] = { id: _appSettings.quantityColumnId, name: '持有量', siblings: _columnEngines, getClass: getClassDefault, getText: getTextForNumber, getValue: getValueDefault };

            // 本地扩展 - 非数据源栏位
            _appSettings.actionsColumnId = 50;
            _columnEngines[_appSettings.actionsColumnId] = {
                id: _appSettings.actionsColumnId, name: '操作', siblings: _columnEngines,
                getClass: getClassAsNone,
                getText: function (data) {
                    var id = this.siblings[_appSettings.sinaSymbolColumnId].getText(data);
                    var actionPanel = $('<div class="container-action">');

                    $('<span class="glyphicon glyphicon-move" role="handle" title="排序"></span>')
                        .attr('data-id', id)
                        .appendTo(actionPanel);
                    $('<span class="glyphicon glyphicon-edit" role="button"></span>')
                        .attr('data-id', id)
                        .attr('title', _formatString('编辑 - {0}', this.siblings[_appSettings.nameColumnId].getText(data)))
                        .attr('data-content', _formatString('<iframe class="editor" src="editor.html?{0}"></iframe>', $.param({
                            token: id,
                            callback: 'ShadowStock.editorCallback',
                            cost: this.siblings[_appSettings.costColumnId].getText(data),
                            quantity: this.siblings[_appSettings.quantityColumnId].getText(data)
                        })))
                        .appendTo(actionPanel);
                    $('<span class="glyphicon glyphicon-remove" role="button" title="删除"></span>')
                        .attr('data-id', id)
                        .appendTo(actionPanel);

                    return actionPanel[0].outerHTML;
                },
                getValue: getValueDefault
            };

            _appSettings.changeColumnId = 51;
            _columnEngines[_appSettings.changeColumnId] = {
                id: _appSettings.changeColumnId, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextForNumber,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_appSettings.priceColumnId].getValue(data) - this.siblings[_appSettings.closingPriceColumnId].getValue(data);
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
                        this._value = this.siblings[_appSettings.changeColumnId].getValue(data) / this.siblings[_appSettings.priceColumnId].getValue(data);
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
                        this._text = this.siblings[_appSettings.sinaSymbolColumnId].getText(data).replace(/[^\d]/g, '');
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };

            _appSettings.fullNameColumnId = 54;
            _columnEngines[_appSettings.fullNameColumnId] = {
                id: _appSettings.fullNameColumnId, name: '名称', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = _formatString('{2} <a title="新浪股票" href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q={0}" target="_blank">{1}</a>',
                            this.siblings[_appSettings.sinaSymbolColumnId].getText(data),
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
                getText: getTextForNumber,
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
                getText: getTextForNumber,
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
                getText: getTextForNumber,
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
                        this._text = _formatString('<a title=\"技术指标\" href=\"TI.htm?{0}\" target=\"_blank\">T</a>',
                            this.siblings[_appSettings.sinaSymbolColumnId].getText(data));
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
        stockRetriever = $('<iframe class="hidden"></iframe>'),
        suggestionRetriever = $('<iframe class="hidden"></iframe>'),
        _init = function () {
            // 远程数据容器
            $(document.body).append(stockRetriever).append(suggestionRetriever);
            // 列数据处理引擎
            initColumnEngines();
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
                ? _round(value / unit8, 2) + '亿'
                : (value >= unit4 ? _round(value / unit4, 2) + '万' : _round(value, 2).toString());
        },
        _toPercentageText = function (value) {
            if (isNaN(value)) {
                return '';
            }
            return _round(value * 100, 2) + '%';
        },
        _requestData = function (retriever, args) {
            retriever.attr('src', 'data.html?' + $.param(args));
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
        getTextForNumber = function (data) {
            if (this._text == undefined) {
                this._text = _round(this.getValue(data), 2);
            }
            return this._text;
        },
        getClassForGainLoss = function (data) {
            if (this._class == undefined) {
                var value = this.siblings[_appSettings.gainLossColumnId].getValue(data);
                this._class = value > 0
                    ? 'btn-danger'
                    : (value < 0 ? 'btn-success' : 'btn-default');
            }
            return this._class;
        },
        getClassAsNone = function (data) {
            return '';
        },

        stockRequest = function () {
            _disableStockTimer(true);
            _userSettings = getUserSettings();

            // 自选列表
            var token = _getTicks();
            var args = [token]; // 注意：第一个参数是 Token，将原封不动的返回
            var stockList = '';
            var watchingStocksLength = _userSettings.watchingStocks.length;
            for (var i = 0; i < watchingStocksLength ; i++) {
                stockList += _userSettings.watchingStocks[i].sinaSymbol + ',';
                args.push('hq_str_' + _userSettings.watchingStocks[i].sinaSymbol);
            }
            _requestData(stockRetriever, {
                url: _formatString(_appSettings.stockUrl, token, stockList),
                callback: 'ShadowStock.stockCallback',
                args: args
            });
        },
        _stockCallback = function (args) {
            if (!duringStockRefresh) {
                return;
            }

            try {
                _stockTable.empty();
                var displayColumnsLength = _userSettings.displayColumns.length;
                var stockTableRow;

                // 表头
                var showActions = false;
                var stockTableHead = $('<thead>').appendTo(_stockTable);
                stockTableRow = $('<tr>').appendTo(stockTableHead);
                for (var i = 0; i < displayColumnsLength ; i++) {
                    var id = _userSettings.displayColumns[i].id;
                    $('<th>').html(_columnEngines[id].name)
                        .appendTo(stockTableRow);

                    if (!showActions && id == _appSettings.actionsColumnId) {
                        showActions = true;
                    }
                }

                // 表体
                var stockTableBody = $('<tbody>').appendTo(_stockTable);
                for (var key in args) {
                    if (key == 'token') {
                        continue;
                    }

                    clearColumnEnginesCache();
                    var sinaSymbol = key.substr(key.lastIndexOf('_') + 1);
                    // 远程 - 数据源
                    var data = args[key].split(',');
                    // 本地扩展 - 数据源
                    data[_appSettings.sinaSymbolColumnId] = sinaSymbol;
                    var watchingStock = findWatchingStock(sinaSymbol);
                    if (watchingStock) {
                        data[_appSettings.costColumnId] = watchingStock.cost;
                        data[_appSettings.quantityColumnId] = watchingStock.quantity;
                    }

                    stockTableRow = $('<tr>').appendTo(stockTableBody);
                    for (var i = 0; i < displayColumnsLength ; i++) {
                        $('<td>').addClass(_columnEngines[_userSettings.displayColumns[i].id].getClass(data))
                            .html(_columnEngines[_userSettings.displayColumns[i].id].getText(data))
                            .appendTo(stockTableRow);
                    }
                }

                if (showActions) {
                    assignActions();
                }
            }
            finally {
                _enableStockTimer(true);
            }
        },
        findWatchingStock = function (sinaSymbol) {
            var watchingStocksLength = _userSettings.watchingStocks.length;
            for (var i = 0; i < watchingStocksLength ; i++) {
                if (_userSettings.watchingStocks[i].sinaSymbol == sinaSymbol) {
                    return _userSettings.watchingStocks[i];
                }
            }
            return null;
        },
        assignActions = function () {
            // 移动
            _stockTable.children('tbody').sortable({
                handle: '.container-action .glyphicon-move',
                cursor: 'move',
                axis: "y",
                opacity: 0.9,
                revert: true,
                scroll: false,
                start: function (event, ui) { _disableStockTimer(); },
                stop: function (event, ui) { _enableStockTimer(); },
                update: function (event, ui) {
                    $('.glyphicon-move', ui.item.parent()).each(function (i) {
                        alert(i);
                        //////???????????cookie
                    });
                }
            });

            // 编辑
            $('.container-action .glyphicon-edit').popover({
                html: true,
                trigger: 'manual'
            }).click(function () {
                $(this).popover('show');
            }).on('show.bs.popover', function () {
                _disableStockTimer();
            }).on('hidden.bs.popover', function () {
                _enableStockTimer();
            });

            // 删除
            $('.container-action .glyphicon-remove').click(function () {
                alert($(this).data('id'));
                // ?????????????????????cooike
            });
        },

        suggestionCache = {},
        suggestionRequest = function (term) {
            var token = escape(term);
            var args = [token]; // 注意：第一个参数是 Token，将原封不动的返回
            var suggestionName = 'suggestion_' + _getTicks();
            args.push(suggestionName);
            _requestData(suggestionRetriever, {
                url: _formatString(_appSettings.suggestionUrl, suggestionName, escape(term)),
                callback: 'ShadowStock.suggestionCallback',
                args: args
            });
        },
        _suggestionCallback = function (args) {
            /*
            xtdh,11,002125,sz002125,湘潭电化,xtdh;
            xtdq,11,300372,sz300372,欣泰电气,xtdq;
            qxtd,11,002408,sz002408,齐翔腾达,qxtd
            */
            for (var key in args) {
                if (key == 'token') {
                    continue;
                }

                var source = [];
                var suggestions = args[key].split(';');
                var suggestionsLength = suggestions.length;
                for (var i = 0; i < suggestionsLength; i++) {
                    var suggestionColumns = suggestions[i].split(',');
                    source.push({
                        label: _formatString('{0} {1} {2}', suggestionColumns[0], suggestionColumns[2], suggestionColumns[4]),
                        value: suggestionColumns[3]
                    });
                }
                var term = unescape(args.token);
                suggestionCache[term] = source;
                _suggestionText.autocomplete('option', 'source', source);
                _suggestionText.autocomplete('search', term); // 重新激活搜索以抵消异步延迟
                break;
            }
        },

        _editorCallback = function (args) {
            switch (args.result) {
                case 'save':
                    var id = args.token;
                    var cost = args.cost;
                    var quantity = args.quantity;
                    alert(_formatString('id:{0}, cost:{1}, qty:{2}', id, cost, quantity));
                    //??????????????cooike

                case 'cancel':
                    $('.container-action .glyphicon-edit').popover('hide');
                    break;

                default:
                    break;
            }
        },
        showAlert = function (message, duration) {
            if (isNaN(duration) || duration < 0) {
                duration = 1000;
            }
            _alertPanel.html(message).slideDown(function () {
                var _this = $(this);
                window.setTimeout(function () {
                    _this.slideUp();
                }, duration);
            });
        },

        /******************** 外部方法 ********************/
        _stockTable,
        _attachTable = function (table) {
            _stockTable = table.empty();
        },
        _suggestionText,
        _attachSuggestion = function (suggestion) {
            _suggestionText = suggestion;
            _suggestionText.autocomplete({
                minLength: 1,
                autoFocus: true,
                source: [],
                search: function (event, ui) {
                    var term = event.target.value;
                    if (term) {
                        if (term in suggestionCache) {
                            _suggestionText.autocomplete('option', 'source', suggestionCache[term]);
                            return;
                        }
                        suggestionRequest(term);
                    }
                },
                select: function (event, ui) {
                    // ???????????cookie
                    showAlert(ui.item.value);
                    //alert(ui.item.value);
                    $(event.target).focus().select();
                    return false;
                }
            });
        },
        _alertPanel,
        _attachAlert = function (alert) {
            _alertPanel = alert.empty().hide();
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
        }
    ;

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

    _shadowStock.stockTable = _stockTable;
    _shadowStock.attachTable = _attachTable;
    _shadowStock.stockCallback = _stockCallback;

    _shadowStock.suggestionText = _suggestionText;
    _shadowStock.attachSuggestion = _attachSuggestion;
    _shadowStock.suggestionCallback = _suggestionCallback;

    _shadowStock.editorCallback = _editorCallback;
    _shadowStock.attachAlert = _attachAlert;

    _shadowStock.enableStockTimer = _enableStockTimer;
    _shadowStock.disableStockTimer = _disableStockTimer;
    _shadowStock.init = _init;

    window.ShadowStock = _shadowStock;
})(this, this.document);