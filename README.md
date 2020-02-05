Shadowin 影窗浏览器，支持老板键的透明浏览器外框
---------------------------------------------
冲着 `老板键` 和 `透明窗体` 特性，此类工具在白领圈里非常有市场，啦啦啦~~  
本软件迎合了多类人群的实际需求，将 **工作时间打酱油** 的精神发挥到顶点。  
![Shadowin 影窗浏览器 + ShadowStock 影子证券](docs/demo-preview.png)  

* Shadowin 基于 WindowsAPI 的窗体控制接口实现，可以通过老板键（系统级热键）控制窗口的尺寸、透明度、显示和隐藏。  
* Shadowin 会创建一个基于 IE 核心的浏览器外框，通过修改 `Shadowin.exe.config` 文件可关注任意 URL 的实时内容（比如：股票、刷秒杀、刷在线、挂等级……）。  
* Shadowin 更允许您自行配置喜欢的系统热键（见：[Keys Enumeration]）和初始外观，改到满意为止吧！  
  
ShadowStock 影子证券，是上班看股、个性化盯盘神器
----------------------------------------------
`Shadowin 影窗浏览器` 和 `ShadowStock 影子证券` 两个方案须配套使用方能发挥神器奇效！  

* ShadowStock 提供了完备的股票盯盘界面，允许创建您自己的投资组合、实现盯盘、关注实时盈亏；神不知鬼不觉助您把握股牛、满钵满盏。  
* ShadowStock 专为 Shadowin 影窗浏览器设计，站点采用 **纯静态页面 + 客户端脚本** 实现，方便二次部署，后台链接[新浪财经]实时数据源，使用模板引擎思路设计更方便扩展。  
  
  
----------------------------------------------------------------------------------------------

![Shadowin 影窗浏览器](docs/logo.png)  
**[点击下载已编译包，解压直接使用]**  
> 运行需 [Microsoft .NET Framework 2.0] 支持  
> 或使用 [Microsoft .NET Framework 4.0] 编译的版本  
  
----------------------------------------------------------------------------------------------

ShadowStock 影子证券 - 沪深创业板 功能介绍
-----------------------------------------
**地址：**  
> http://stock.plusii.com/  
  
  
* 微型界面和透明效果 - 你值得拥有
![微型界面和透明效果](docs/demo-main.png)  
  
* 智能选股列表 - 创建激情投资组合
![智能选股列表](docs/demo-autocomplete.png)  
  
* 即时拖动排序 - 把握视觉主次
![即时拖动排序](docs/demo-move.png)  
  
* 成本持仓维护 - 关注实时收益
![成本持仓维护](docs/demo-edit.png)  
  
* 个性化界面设置 - 体现你的独到见解
![个性化界面设置](docs/demo-settings.png)  
  
* 设置导入导出 - 回避繁杂、只留方便
![设置导入导出](docs/demo-impexp.png)  
  
  
Shadowin 影窗浏览器 默认配置和操作方法
-------------------------------------
```xml
  <appSettings>

    <!-- URL -->
    <add key="Url" value="http://stock.plusii.com/"/>
    <!-- 自动刷新时间间隔（0 表示不刷新；ShadowStock 无需设置刷新） -->
    <add key="RefreshInterval" value="0"/>
    <!-- 分屏显示 -->
    <add key="ScreenId" value="0"/>

    <!-- 热键：窗口宽度 -->
    <add key="IncreaseWidthHotKeyModifierKey" value="Control"/>
    <add key="IncreaseWidthHotKeyKey" value="Left"/>
    <add key="DecreaseWidthHotKeyModifierKey" value="Control"/>
    <add key="DecreaseWidthHotKeyKey" value="Right"/>
    <!-- 热键：窗口高度 -->
    <add key="IncreaseHeightHotKeyModifierKey" value="Control"/>
    <add key="IncreaseHeightHotKeyKey" value="Up"/>
    <add key="DecreaseHeightHotKeyModifierKey" value="Control"/>
    <add key="DecreaseHeightHotKeyKey" value="Down"/>
    <!-- 热键：窗口透明度 -->
    <add key="IncreaseOpacityHotKeyModifierKey" value="Control"/>
    <add key="IncreaseOpacityHotKeyKey" value="Oemplus"/>
    <add key="DecreaseOpacityHotKeyModifierKey" value="Control"/>
    <add key="DecreaseOpacityHotKeyKey" value="OemMinus"/>
    <!-- 热键：窗口显示/隐藏 -->
    <add key="ShowHideHotKeyModifierKey" value="Control"/>
    <add key="ShowHideHotKeyKey" value="Oemtilde"/>
    <!-- 热键：退出程序 -->
    <add key="ExitHotKeyModifierKey" value="Control"/>
    <add key="ExitHotKeyKey" value="D0"/>

  </appSettings>
```
  
|热键		|效果			|
|----		|----			|
|`Ctrl + ~`	|显示/隐藏窗口（`ESC`下方的`波浪线`，热键更顺手！）	|
|`Ctrl + ↑`	|增大窗口高		|
|`Ctrl + ↓`	|减小窗口高		|
|`Ctrl + ←`	|增大窗口宽		|
|`Ctrl + →`	|减小窗口宽		|
|`Ctrl + +`	|增大窗口不透明度	|
|`Ctrl + -`	|减小窗口不透明度	|
|`Ctrl + 0`	|退出程序		|
  

Shadowin 影窗浏览器 域名切换方法
-------------------------------------
1. 按 Ctrl+0 先退出程序；
2. 使用记事本打开 Shadowin 安装目录下的 `Shadowin.exe.config` 文件；
3. 找到 `<add key="Url" value="http://stock.shadowin.net/"/>` 这一行，将其中的 `shadowin.net` 改为 `plusii.com`，保存；
4. 重新运行 Shadowin 即可。  
  
**或者，重新[点击下载已编译包，解压直接使用]**

----------------------------------------------------------------------------------------------
  
ShadowStock 影子證券（雅虎奇摩台灣版）
------------------------------------
應網友要求，2011-02-18 發佈了《ShadowStock 影子證券(雅虎奇摩台灣版)》，後臺連接雅虎奇摩實時數據源，
對臺灣股票（tw）實現同樣完美的支持——隱蔽操作、自訂股票、實時行情關注、漲跌警示、盈虧分析等，首開國內兩岸之先河！   
  
**位址：**  
> http://tw.stock.plusii.com/  

**自選股格式和範例：**  
> 代號[/成本[/持倉]][,代號[/成本[/持倉]]]  
> tw1101,tw1103/2.33,tw2305/20.5/100  
  
**附註：**  
> 填入的股票代碼需以 tw 作為前綴。  
> [台泥]的代碼是 tw1101  
> [台積電]的代碼是 tw2330  
  
  
  
注意事项
--------
* `/ShadowStock` 目录下是**纯静态的网站**，按需放到任何主机上即可使用；  
* ShadowStock 的个性化设置是保存在本地的 `Cookie` 中的，可以支持设置的导入/导出以及通过 QQ 之类的工具传输；
* ShadowStock 影子證券(雅虎奇摩台灣版) 调用的是经二次包装的雅虎奇摩数据源 http://tw.stock.plusii.com/stockdata.aspx?rn={0}&list={1}，
您可以在 `/ShadowStock/stock_tw/Shared.js` 和 `/ShadowStock/stock_tw/stockdata.aspx` 中找到相关代码（**注意：**自行托管 stockdata.aspx，需要 ASP.NET 2.0 服务器）； 
* 支持 IE7 等更老浏览器的 ShadowStock 影子证券 (旧版 http://v1.stock.shadowin.net) 已不再提供服务。
  

-------------------------------------------------  
使用中有任何问题和建议，欢迎 [在此留爪] 或 QQ [9812152]。  
![微信扫码捐赠](docs/donate-wechat.jpg)
  
  
[Keys Enumeration]: https://msdn.microsoft.com/en-us/library/system.windows.forms.keys(v=vs.110).aspx
[Microsoft .NET Framework 2.0]: https://www.microsoft.com/zh-cn/download/details.aspx?id=25150
[Microsoft .NET Framework 4.0]: https://www.microsoft.com/zh-cn/download/details.aspx?id=17718
[新浪财经]: http://finance.sina.com.cn
[上证指数]: http://finance.sina.com.cn/realstock/company/sh000001/nc.shtml
[深证成指]: http://finance.sina.com.cn/realstock/company/sz399001/nc.shtml
[雅虎奇摩]: https://tw.stock.yahoo.com
[台泥]: https://tw.stock.yahoo.com/q/q?s=1101
[台積電]: https://tw.stock.yahoo.com/q/q?s=2330
[点击下载已编译包，解压直接使用]: https://github.com/heddaz/shadowin/releases
[在此留爪]: https://github.com/heddaz/shadowin/issues
[9812152]: tencent://message/?uin=9812152