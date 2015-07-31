(function (window, undefined) {
    var _shadowStock = {},
        _appName = 'ShadowStock 影子证券 - 沪深创业板',
        _appVersion = '2.0',

        /******************** 配置 ********************/
        _options = {
            suggestUrl: 'http://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&name=suggestdata_{0}&key={1}',
            dataUrl: 'http://hq.sinajs.cn/rn={0}&list={1}',
            dataColumns: '名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,买①量,买①,买②量,买②,买③量,买③,买④量,买④,买⑤量,买⑤,卖①量,卖①,卖②量,卖②,卖③量,卖③,卖④量,卖④,卖⑤量,卖⑤,日期,时间'
                .split(','),
            changeColumnId: 34,
        },
        _userOptions = {
            displayColumns: [ /////////////////////////////////////////////////
                { id: 33, name: 'BB' },
                { id: 0, name: 'BB' },
                { id: 34, name: 'aa' },
                { id: 3, name: 'aa' },
                { id: 9, name: 'aa' },
            ],
            watchStocks: [ /////////////////////////////////////////////////
                { symbol: 'sh000001', name: '【上证指数】' },
                { symbol: 'sz000002', name: '【万科A】', price: 13.01, quantity: 2000 },
            ],
        },

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
                    : shortenNumberText(value);
            }
            return this._text;
        },
        shortenNumberText = function (value) {
            var unit = Math.pow(10, 4);
            return value > unit ? Math.round(value / unit) + '万' : value.toString();
        },
        getValueDefault = function (data) {
            if (this._value == undefined) {
                this._value = Number(data[this.id]); // 返回数值或 NaN
            }
            return this._value;
        },

        /******************** 初始化 ********************/

        _columnEngines = [],
        init = function () {
            // 列数据处理引擎 - 数据源
            var dataColumns = _options.dataColumns;
            for (var i = 0; i < dataColumns.length; i++) {
                _columnEngines[i] = { id: i, name: dataColumns[i], siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };
            }
            // 列数据处理引擎 - 扩展数据源
            _columnEngines[33] = { id: 33, name: '新浪代码', siblings: _columnEngines, getClass: getClassDefault, getText: getTextDefault, getValue: getValueDefault };

            _columnEngines[34] = {
                id: 34, name: '涨跌', siblings: _columnEngines,
                getClass: getClassDefault,
                getText: getTextDefault,
                getValue: function (data) {
                    if (this._value == undefined) {
                        var openingPriceId = 1;
                        var priceId = 3;
                        this._value = _round(this.siblings[priceId].getValue(data) - this.siblings[openingPriceId].getValue(data), 2);
                    }
                    return this._value;
                }
            };
            _columnEngines[35] = { id: 35, name: '涨跌率', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[36] = { id: 36, name: '代码', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[37] = { id: 37, name: '名称代码', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[38] = { id: 38, name: '成本', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[39] = { id: 39, name: '持有量', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[40] = { id: 40, name: '总成本', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[41] = { id: 41, name: '总现值', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };

            _columnEngines[42] = { id: 42, name: '盈亏', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[43] = { id: 43, name: '盈亏率', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };
            _columnEngines[44] = { id: 44, name: '总盈亏', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };

            _columnEngines[45] = { id: 45, name: '工具', siblings: _columnEngines, getClass: getClassDefault, getText: null, getValue: null };

            return _shadowStock;
        },

        /******************** 方法 ********************/
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
            var data = '万  科Ａ,15.60,14.62,14.71,14.75,14.35,14.60,14.61,164106499,2380501164.68,981058,14.60,510800,14.59,956193,14.58,149700,14.57,112700,14.56,83008,14.61,101510,14.62,47500,14.63,21600,14.64,166783,14.65,2015-07-29,15:05:17,00,sz000002'.split(',');

            var html = '<table border=2 width=100%>';
            html += '<tr>';

            for (var i = 0; i < this.userOptions.displayColumns.length; i++) {
                html += _formatString('<th>{0}</td>',
                    this.columnEngines[this.userOptions.displayColumns[i].id].name);
            }
            html += '</tr>';
            html += '<tr>';
            for (var i = 0; i < this.userOptions.displayColumns.length; i++) {
                html += _formatString('<td class={1}>{0}</td>',
                    this.columnEngines[this.userOptions.displayColumns[i].id].getText(data),
                    this.columnEngines[this.userOptions.displayColumns[i].id].getClass(data));
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