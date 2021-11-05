<%@ Page Language="C#" %>

<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
    const string DataSourceFormat = "http://tw.stock.yahoo.com/q/q?s={0}";
    const string BeginStamp = "<td align=center width=105>";
    const string EndStamp = "<td align=center width=137 class=\"tt\">";

    static readonly Regex HtmlPattern1 = new Regex(@"\s+|\,+", RegexOptions.Compiled);
    static readonly Regex HtmlPattern2 = new Regex(@"\<[^<>]+\>", RegexOptions.Compiled);
    static readonly Regex HtmlPattern3 = new Regex(@"\,{2,}", RegexOptions.Compiled);
    static readonly Regex StockCodePattern = new Regex(@"^tw[0-9]{4}$", RegexOptions.Compiled);

    /// <summary>
    ///  0    1    2    3      4    5    6    7    8      9      10 11   12 13 14 15 16 17 18 19  20  21   22  23  24  25  26  27  28  29  30   31   32   33   34   35     36   37   38     39     40     41     42     43
    /// "名称,今开,昨收,最新价,最高,最低,买入,卖出,成交量,成交额,C1,买入,C3,C4,C5,C6,C7,C8,C9,C10,C11,卖出,C13,C14,C15,C16,C17,C18,C19,C20,日期,时间,名称,代码,涨跌,涨跌率,成本,盈亏,盈亏率,持有量,总现值,总成本,总盈亏,快链"
    /// </summary>
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentEncoding = Encoding.UTF8;

        #region 获取参数

        string[] stockCodes;
        try
        {
            stockCodes = Request.QueryString["list"].Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
        }
        catch
        {
            return;
        }

        #endregion

        foreach (string stockCode in stockCodes)
        {
            if (!StockCodePattern.IsMatch(stockCode))
            {
                continue;
            }

            switch (stockCode.Substring(0, 2).ToLower())
            {
                case "tw": //台湾
                    #region 台湾股票

                    try
                    {
                        string stockDataHtml = GetData(
                            string.Format(DataSourceFormat, stockCode.Substring(2)),
                            Encoding.GetEncoding("Big5") //繁体中文
                            );
                        //截取有用数据
                        stockDataHtml = stockDataHtml.Substring(stockDataHtml.IndexOf(BeginStamp) + BeginStamp.Length);
                        stockDataHtml = stockDataHtml.Substring(0, stockDataHtml.IndexOf(EndStamp));
                        stockDataHtml = HtmlPattern1.Replace(stockDataHtml, string.Empty);
                        stockDataHtml = HtmlPattern2.Replace(stockDataHtml, ",");
                        stockDataHtml = HtmlPattern3.Replace(stockDataHtml, ",").Trim(',');

                        #region 调整输出

                        //股票代號,             時間, 成交, 買進, 賣出, 漲跌,  張數, 昨收, 開盤, 最高, 最低
                        //0        1            2     3     4     5     6      7     8     9     10    11
                        //1101台泥,加到投資組合,13:30,30.25,30.25,30.30,△0.20,10921,30.05,30.40,30.45,30.20
                        //2305全友,加到投資組合,12:47,4.90, 4.90, 4.91, ▽0.01,56,   4.91, 4.92, 4.96, 4.90
                        string[] stockDatas = stockDataHtml.Split(',');
                        string[] stockData = new string[32];
                        stockData[0] = stockDatas[0];
                        stockData[1] = stockDatas[9];
                        stockData[2] = stockDatas[8];
                        stockData[3] = stockDatas[3];
                        stockData[4] = stockDatas[10];
                        stockData[5] = stockDatas[11];
                        stockData[6] = stockDatas[4];
                        stockData[7] = stockDatas[5];
                        stockData[8] = stockDatas[7];
                        stockData[31] = stockDatas[2];

                        #endregion

                        Response.Write(string.Format("var hq_str_{0}=\"{1}\";", stockCode, string.Join(",", stockData)));
                    }
                    catch { }

                    #endregion
                    break;

                default:
                    break;
            }
        }
    }

    private string GetData(string url, Encoding encoding)
    {
        WebRequest request = WebRequest.Create(url);
        try
        {
            WebResponse response = request.GetResponse();
            using (StreamReader reader = new StreamReader(response.GetResponseStream(), encoding))
            {
                return reader.ReadToEnd();
            }
        }
        catch
        {
            return string.Empty;
        }
        finally
        {
            try
            {
                request.Abort();
            }
            catch { }
        }
    }
    private string GetData(string url)
    {
        return GetData(url, Encoding.Default);
    }
</script>
