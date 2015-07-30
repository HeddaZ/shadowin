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
        },
        _userOptions = {
            displayColumns: [ /////////////////////////////////////////////////
                { id: 2, name: 'BB' },
                { id: 1, name: 'aa' },
            ],
            watchStocks: [ /////////////////////////////////////////////////
                { code: 'sh000001', name: '【上证指数】' },
                { code: 'sz000002', name: '【万科A】', price: 13.01, quantity: 2000 },
            ],
        },

        getValueDefault = function (data) {
            if (!this._value) {
                this._value = data[this.id];
            }
            return this._value;
        },
        getTextDefault = function (data) {
            if (!this._text) {
                this._text = '????????txt:' + this.getValue(data);
            }
            return this._text;
        },
        getClassDefault = function (data) {
            if (!this._class) {
                this._class = '????????css:' + this.getValue(data);
            }
            return this._class;
        },

        /******************** 初始化 ********************/

        _columnEngines = [],
        init = function () {
            // 列数据处理引擎 - 数据源
            var dataColumns = _options.dataColumns;
            for (var i = 0; i < dataColumns.length; i++) {
                _columnEngines.push({ id: i, name: dataColumns[i], getValue: getValueDefault, getText: getTextDefault, getClass: getClassDefault });
            }
            // 列数据处理引擎 - 扩展数据源


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
        _getTicks = function () {
            return new Date().getTime();
        },
        _attachSuggest = function () {

        },
        _renderTable = function () {
            var data = '我的,23.44'.split(',');

            var html = '<table>';
            html += '<tr>';

            for (var i = 0; i < this.userOptions.displayColumns.length; i++) {
                html += _formatString('<td class={1}>{0}</td>', this.columnEngines[i].getText(data), this.columnEngines[i].getClass(data));
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
    _shadowStock.getTicks = _getTicks;
    _shadowStock.attachSuggest = _attachSuggest;
    _shadowStock.renderTable = _renderTable;

    window.ShadowStock = init();
})(this);