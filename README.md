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
* ShadowStock 专为 Shadowin 影窗浏览器设计，站点采用 **纯静态页面 + 客户端脚本** 实现，方便二次部署，代码采用模板引擎设计，方便功能扩展。  
* ShadowStock 自 V3 版本升级了几个强化隐蔽性的新特性。  
* ShadowStock 自 V4 版本遭遇新浪封堵，切换使用[腾讯证券]数据源！**去掉了一些特例代码，因为腾讯数据源更规范，相比较新浪真的乱。**  
  
  
----------------------------------------------------------------------------------------------

![Shadowin 影窗浏览器](docs/logo.png)  
**点击下载[已编译包]，解压直接使用！**  
> 运行需 [Microsoft .NET Framework 4.0] 支持 (Win10 已内置)  
> 使用中遇到问题，请务必看一下 [常见问题]
  
----------------------------------------------------------------------------------------------

ShadowStock 影子证券功能介绍
-----------------------------------------
**地址：**  
> http://stock.plusii.com/  
  
  
* 微型界面和透明效果 - 你值得拥有
![微型界面和透明效果](docs/demo-main.png)  
  
* 智能选股列表 - 创建激情投资组合（沪深、基金、新三板、港股、美股）
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
    <!-- 页面缩放 -->
    <add key="PageZoom" value="100%"/>

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
  
  
注意事项
--------
* 项目的`/stock`目录下是**纯静态网站程序**，托管到任何主机上即可使用影子证券。默认数据源 http://stock-data.plusii.com/ 是经过包装的腾讯数据源 https://web.sqt.gtimg.cn/utf8/ 自建方案请切换到腾讯数据源，降低本服务器压力。  
* 影子证券的个性化设置是保存在本地的 `Cookie` 中的，可以支持设置的导入、导出，以及通过微信、QQ之类工具传输。  
* 支持 IE7 等老浏览器影子证券 V1 (http://v1.stock.shadowin.net) 不再提供服务；需要的同学请牵出旧源码自行部署。  
* 雅虎在 2021.11.01 中断了来自中国大陆的访问，雅虎奇摩台湾版 (http://tw.stock.plusii.com) 不再提供服务；需要的同学请牵出旧源码自行部署。  
* 基于长期运维考虑，2022.02.25 已经开始设计和实现 ShadowStock 自己的数据源中间件，使用新分支跟踪此进度。  
  
  
-------------------------------------------------  
使用中有任何问题和建议，欢迎 [在此留爪] 或 [QQ9812152]。  
(聊表心意，金额随意)  
![微信扫码捐赠](http://images.iiwho.com/donate-wechat.jpg)
  
  
[Keys Enumeration]: https://msdn.microsoft.com/en-us/library/system.windows.forms.keys(v=vs.110).aspx
[Microsoft .NET Framework 4.0]: https://www.microsoft.com/zh-cn/download/details.aspx?id=17718
[常见问题]: https://github.com/HeddaZ/Shadowin/issues/43
[腾讯证券]: https://new.qq.com/ch/finance_stock/
[已编译包]: https://github.com/heddaz/shadowin/releases
[在此留爪]: https://github.com/heddaz/shadowin/issues
[QQ9812152]: tencent://message/?uin=9812152
