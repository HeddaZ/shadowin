(function (window, document, undefined) {
    var _shadowStock = {},
        _appName = 'ShadowStock 影子证券 - 沪深创业板',
        _appVersion = '2.0',

        /******************** 配置 ********************/
        _options = {
            /* {"11":"A 股","12":"B 股","13":"权证","14":"期货","15":"债券","21":"开基","22":"ETF","23":"LOF","24":"货基","25":"QDII","26":"封基","31":"港股","32":"窝轮","41":"美股","42":"外期"} */
            suggestUrl: 'http://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&name=suggestdata_{0}&key={1}',
            dataUrl: 'http://hq.sinajs.cn/rn={0}&list={1}',
            detailUrl: 'http://biz.finance.sina.com.cn/suggest/lookup_n.php?q={0}',
            dataColumns: '名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间'
                .split(','),

            nameColumnId: 0,
            openingPriceColumnId: 1,
            priceColumnId: 3,

            sinaSymbolColumnId: 40,
            costColumnId: 41,
            quantityColumnId: 42,

            changeColumnId: 50,
            symbolColumnId: 52,
            totalCostColumnId: 54,
            totalAmountColumnId: 55,
            gainLossColumnId: 56,
        },
        _userOptions = {
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
                { symbol: 'sh000001', name: '【上证指数】' },
                { symbol: 'sz000002', name: '【万科A】', cost: 11.01, quantity: 2000 },
            ],
        },

        /******************** 初始化 ********************/

        _columnEngines = [],
        init = function () {
            // 列数据处理引擎 - 远程数据源
            for (var i = 0; i < _options.dataColumns.length; i++) {
                _columnEngines[i] = { id: i, name: _options.dataColumns[i], siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            }
            // 列数据处理引擎 - 本地扩展数据源
            _columnEngines[40] = { id: 40, name: '新浪代码', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            _columnEngines[41] = { id: 41, name: '成本', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            _columnEngines[42] = { id: 42, name: '持有量', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            // 列数据处理引擎 - 本地扩展栏位
            _columnEngines[50] = {
                id: 50, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.priceColumnId].getValue(data) - this.siblings[_options.openingPriceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[51] = {
                id: 51, name: '涨跌率', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.changeColumnId].getValue(data) / this.siblings[_options.priceColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[52] = {
                id: 52, name: '代码', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: function (data) {
                    if (this._text == undefined) {
                        this._text = this.siblings[_options.sinaSymbolColumnId].getText(data).replace(/[^\d]/g, '');
                    }
                    return this._text;
                },
                getValue: getValueDefault
            };
            _columnEngines[53] = {
                id: 53, name: '名称代码', siblings: _columnEngines,
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
            _columnEngines[54] = {
                id: 54, name: '总成本', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.costColumnId].getValue(data) * this.siblings[_options.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[55] = {
                id: 55, name: '总现值', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.priceColumnId].getValue(data) * this.siblings[_options.quantityColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[56] = {
                id: 56, name: '盈亏', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.totalAmountColumnId].getValue(data) - this.siblings[_options.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[57] = {
                id: 57, name: '盈亏率', siblings: _columnEngines,
                getClass: getClassForGainLoss,
                getText: getTextAsPercentage,
                getValue: function (data) {
                    if (this._value == undefined) {
                        this._value = this.siblings[_options.gainLossColumnId].getValue(data) / this.siblings[_options.totalCostColumnId].getValue(data);
                    }
                    return this._value;
                }
            };
            _columnEngines[58] = { id: 58, name: '工具', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };

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
        _attachSuggest = function (suggestText) {
            //var availableTags = [
            //  "ActionScript",
            //  "AppleScript",
            //  "Asp",
            //  "BASIC",
            //  "C",
            //  "C++",
            //  "Clojure",
            //  "COBOL",
            //  "ColdFusion",
            //  "Erlang",
            //  "Fortran",
            //  "Groovy",
            //  "Haskell",
            //  "Java",
            //  "JavaScript",
            //  "Lisp",
            //  "Perl",
            //  "PHP",
            //  "Python",
            //  "Ruby",
            //  "Scala",
            //  "Scheme"
            //];


            

            
            //suggestText.autocomplete({
            //    source: "http://hq.sinajs.cn/rn=0&list=sz000002",
            //    minLength: 2,
            //    select: function (event, ui) {
            //        alert(ui.item ? ui.item.value : "Nothing");
            //    }
            //});
        },
        _renderTable = function () {
            var data = '万  科Ａ,15.60,14.62,14.71,14.75,14.35,14.60,14.61,164106499,2380501164.68,981058,14.60,510800,14.59,956193,14.58,149700,14.57,112700,14.56,83008,14.61,101510,14.62,47500,14.63,21600,14.64,166783,14.65,2015-07-29,15:05:17,00'
                .split(',');
            data[_options.sinaSymbolColumnId] = 'sz000002';
            data[_options.costColumnId] = '14.7';
            data[_options.quantityColumnId] = '2500';

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
})(this, this.document);