(function (window, undefined) {
    var _shadowStock = {},
        _appName = 'ShadowStock 影子证券 - 沪深创业板',
        _appVersion = '2.0',

        /******************** 配置 ********************/
        _options = {
            suggestUrl: 'http://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&name=suggestdata_{0}&key={1}',
            dataUrl: 'http://hq.sinajs.cn/rn={0}&list={1}',
            detailUrl: 'http://biz.finance.sina.com.cn/suggest/lookup_n.php?q={0}',
            dataColumns: '名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间'
                .split(','),

            changeColumnId: 40,
            priceColumnId: 4,
            openingPriceColumnId: 2,
            sinaSymbolColumnId: 0,
            nameColumnId: 1,
            symbolColumnId: 42,
            costColumnId: 44,
            quantityColumnId: 45,
            totalCostColumnId: 46,
            totalAmountColumnId: 47,
            gainLossColumnId: 48,
        },
        _userOptions = {
            displayColumns: [ /////////////////////////////////////////////////
                { id: 0, name: 'BB' },
                { id: 4, name: 'aa' },
                { id: 10, name: 'aa' },
                { id: 40, name: 'aa' },
                { id: 41, name: 'BB' },
                { id: 42, name: 'aa' },
                { id: 43, name: 'aa' },
                { id: 44, name: 'aa' },
                { id: 45, name: 'aa' },
                { id: 46, name: 'aa' },
                { id: 47, name: 'aa' },
                { id: 48, name: 'aa' },
                { id: 49, name: 'aa' },
                { id: 50, name: 'aa' },
            ],
            watchStocks: [ /////////////////////////////////////////////////
                { symbol: 'sh000001', name: '【上证指数】' },
                { symbol: 'sz000002', name: '【万科A】', cost: 11.01, quantity: 2000 },
            ],
        },

        /******************** 初始化 ********************/

        _columnEngines = [],
        init = function () {
            // 列数据处理引擎 - 追加数据源
            _columnEngines[0] = { id: 0, name: '新浪代码', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            // 列数据处理引擎 - 远程数据源
            for (var i = 0; i < _options.dataColumns.length; i++) {
                _columnEngines[i + 1] = { id: i + 1, name: _options.dataColumns[i], siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            }
            // 列数据处理引擎 - 本地扩展
            _columnEngines[40] = {
                id: 40, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.priceColumnId].getValue(data) - this.siblings[_options.openingPriceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[41] = {
                id: 41, name: '涨跌率', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.changeColumnId].getValue(data) / this.siblings[_options.priceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[42] = {
                id: 42, name: '代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = this.siblings[_options.sinaSymbolColumnId].getText(data).replace(/[^\d]/g, '');
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };
            _columnEngines[43] = {
                id: 43, name: '名称代码', siblings: _columnEngines,
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

            // 列数据处理引擎 - 本地编辑
            _columnEngines[44] = {
                id: 44, name: '成本', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    return this.getValue(data) + ' <span class="glyphicon glyphicon-edit" data-column="' + _options.costColumnId + '"></span>';
                },
                getValue: function (data) { return 14.91; }
            };
            _columnEngines[45] = {
                id: 45, name: '持有量', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    return this.getValue(data) + ' <span class="glyphicon glyphicon-edit" data-column="' + _options.quantityColumnId + '"></span>';
                },
                getValue: function (data) { return 2500; }
            };

            // 列数据处理引擎 - 本地扩展
            _columnEngines[46] = {
                id: 46, name: '总成本', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.costColumnId].getValue(data) * this.siblings[_options.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[47] = {
                id: 47, name: '总现值', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.priceColumnId].getValue(data) * this.siblings[_options.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[48] = {
                id: 48, name: '盈亏', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.totalAmountColumnId].getValue(data) - this.siblings[_options.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[49] = {
                id: 49, name: '盈亏率', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.gainLossColumnId].getValue(data) / this.siblings[_options.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[50] = { id: 50, name: '工具', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };

            return _shadowStock;
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
                    : toNumberText(value);
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
                this._text = toPercentageText(this.getValue(data));
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

        toNumberText = function (value) {
            var unit8 = Math.pow(10, 8), unit4 = Math.pow(10, 4);
            return value >= unit8
                ? _round(value / unit8) + '亿'
                : (value >= unit4 ? _round(value / unit4) + '万' : _round(value, 2).toString());
        },
        toPercentageText = function (value) {
            return _round(value * 100, 2) + '%';
        },

        /******************** 外部方法 ********************/
        _formatString = function () {
            var args = [].slice.call(arguments);
            var pattern = new RegExp('{([0-' + (args.length - 2) + '])}', 'g');
            return args[0].replace(pattern, function (match, index) {
                return args[parseInt(index) + 1];
            });
        },
        _round = function (value, precision) {
            precision = precision ? parseInt(precision) : 0;
            if (precision <= 0) {
                return Math.round(value);
            }
            return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
        },
        _getTicks = function () {
            return new Date().getTime();
        },
        _attachSuggest = function () {

        },
        _renderTable = function () {
            var data = 'sz000002,万  科Ａ,15.60,14.62,14.71,14.75,14.35,14.60,14.61,164106499,2380501164.68,981058,14.60,510800,14.59,956193,14.58,149700,14.57,112700,14.56,83008,14.61,101510,14.62,47500,14.63,21600,14.64,166783,14.65,2015-07-29,15:05:17,00'.split(',');

            var html = '<table border=2 width=100%>';
            html += '<tr data-symbol="">';

            for (var i = 0; i < this.userOptions.displayColumns.length; i++) {
                html += _formatString('<th>{0}</td>',
                    this.columnEngines[this.userOptions.displayColumns[i].id].name);
            }
            html += '</tr>';
            html += '<tr>';
            for (var i = 0; i < this.userOptions.displayColumns.length; i++) {
                html += _formatString('<td class={1}>{0} - {2}</td>',
                    this.columnEngines[this.userOptions.displayColumns[i].id].getText(data),
                    this.columnEngines[this.userOptions.displayColumns[i].id].getClass(data),
                    this.columnEngines[_options.sinaSymbolColumnId].getText(data)
                    );
            }


            html += '</tr>';
            html += '</table>';

            return html;
        }
    ;

    /******************** 导出 ********************/
    _shadowStock.appName = _appName;
    _shadowStock.appVersion = _appVersion;
    _shadowStock.options = _options;
    _shadowStock.userOptions = _userOptions;
    _shadowStock.columnEngines = _columnEngines;

    _shadowStock.formatString = _formatString;
    _shadowStock.round = _round;
    _shadowStock.getTicks = _getTicks;
    _shadowStock.attachSuggest = _attachSuggest;
    _shadowStock.renderTable = _renderTable;

    window.ShadowStock = init();
})(this);