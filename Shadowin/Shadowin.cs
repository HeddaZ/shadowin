using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.Diagnostics;
using Shadowin.Properties;
using Shadowin.WinApi;

namespace Shadowin
{
    public partial class Shadowin : Form
    {
        public readonly static string Version = "V" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
        private const int SizeDifference = 15;
        private const double OpacityDifference = 0.1;
        private readonly Uri BlankUrl = new Uri("about:blank");
        private Screen _currentScreen;
        private int? _currentZoom;

        private HotKeyManager SwHotKeyManager
        {
            get;
            set;
        }
        private bool RefreshEnabled
        {
            get;
            set;
        }

        public Shadowin()
        {
            InitializeComponent();

            this.Initialize();
        }
        ~Shadowin()
        {
            this.Close();
        }

        private void logoImage_Click(object sender, EventArgs e)
        {
            using (var about = new About())
            {
                var result = about.ShowDialog();
                if (result == DialogResult.OK)
                {
                    Process.Start("https://github.com/heddaz/shadowin");
                }
            }
        }
        private void Shadowin_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (this.SwHotKeyManager != null)
            {
                try
                {
                    this.SwHotKeyManager.Dispose();
                }
                catch
                {
                }
                finally
                {
                    this.SwHotKeyManager = null;
                }
            }
        }

        #region 初始化

        private void Initialize()
        {
            #region 热键

            this.SwHotKeyManager = new HotKeyManager(this);

            // 增大宽度
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.IncreaseWidthHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.IncreaseWidthHotKeyKey),
                new HotKeyEventHandler(this.OnIncreaseWidthHotKey));
            // 减小宽度
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.DecreaseWidthHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.DecreaseWidthHotKeyKey),
                new HotKeyEventHandler(this.OnDecreaseWidthHotKey));
            // 增大高度
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.IncreaseHeightHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.IncreaseHeightHotKeyKey),
                new HotKeyEventHandler(this.OnIncreaseHeightHotKey));
            // 减小高度
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.DecreaseHeightHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.DecreaseHeightHotKeyKey),
                new HotKeyEventHandler(this.OnDecreaseHeightHotKey));
            // 增大不透明度
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.IncreaseOpacityHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.IncreaseOpacityHotKeyKey),
                new HotKeyEventHandler(this.OnIncreaseOpacityHotKey));
            // 减小不透明度
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.DecreaseOpacityHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.DecreaseOpacityHotKeyKey),
                new HotKeyEventHandler(this.OnDecreaseOpacityHotKey));
            // 显示隐藏
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.ShowHideHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.ShowHideHotKeyKey),
                new HotKeyEventHandler(this.OnShowHideHotKey));
            // 退出
            this.SwHotKeyManager.Register(
                AppHelper.StringToEnum<ModifierKeys>(AppHelper.ExitHotKeyModifierKey),
                AppHelper.StringToEnum<Keys>(AppHelper.ExitHotKeyKey),
                new HotKeyEventHandler(this.OnExitHotKey));

            #endregion

            #region 窗体

            this.toolTip.ToolTipTitle = AppHelper.Title;
            this.toolTip.SetToolTip(this.logoImage, Version);
            this.Size = Settings.Default.FormSize;

            #endregion

            #region 刷新定时器

            if (AppHelper.RefreshInterval > 0)
            {
                refreshTimer.Interval = AppHelper.RefreshInterval;
                this.RefreshEnabled = true;
            }
            else
            {
                this.RefreshEnabled = false;
            }

            #endregion
        }

        #endregion

        #region 热键委托

        private void OnIncreaseWidthHotKey()
        {
            if (this.Visible)
            {
                this.Width += SizeDifference;
            }
        }
        private void OnDecreaseWidthHotKey()
        {
            if (this.Visible)
            {
                this.Width -= SizeDifference;
            }
        }
        private void OnIncreaseHeightHotKey()
        {
            if (this.Visible)
            {
                this.Height += SizeDifference;
            }
        }
        private void OnDecreaseHeightHotKey()
        {
            if (this.Visible)
            {
                this.Height -= SizeDifference;
            }
        }
        private void OnIncreaseOpacityHotKey()
        {
            if (this.Visible)
            {
                this.Opacity += OpacityDifference;
            }
        }
        private void OnDecreaseOpacityHotKey()
        {
            if (this.Visible)
            {
                this.Opacity -= OpacityDifference;
            }
        }
        private void OnShowHideHotKey()
        {
            this.Visible = !this.Visible;
        }
        private void OnExitHotKey()
        {
            using (var confirm = new Confirm("感谢您使用！您确定要关闭程序吗？"))
            {
                var result = confirm.ShowDialog();
                if (result == DialogResult.Yes)
                {
                    this.Close();
                }
            }
        }

        #endregion

        #region 刷新和显示

        private void refreshTimer_Tick(object sender, EventArgs e)
        {
            this.LoadUrl();
        }
        private void Shadowin_VisibleChanged(object sender, EventArgs e)
        {
            if (this.Visible)
            {
                this.Shadowin_SizeChanged(sender, e);
                this.LoadUrl();
            }
            else
            {
                // 后台歇息
                webBrowser.Url = BlankUrl;
            }

            refreshTimer.Enabled = this.Visible && this.RefreshEnabled;
        }
        private void LoadUrl()
        {
            if (webBrowser.Url == null || webBrowser.Url.Equals(BlankUrl))
            {
                webBrowser.Url = new Uri(AppHelper.Url);
            }
            else
            {
                webBrowser.Refresh(WebBrowserRefreshOption.Completely);
            }
        }
        private void Shadowin_SizeChanged(object sender, EventArgs e)
        {
            // 分屏
            if (_currentScreen == null)
            {
                try
                {
                    _currentScreen = Screen.AllScreens[AppHelper.ScreenId];
                }
                catch
                {
                    _currentScreen = Screen.PrimaryScreen;
                }
            }

            // 位置
            this.Left = _currentScreen.WorkingArea.X + _currentScreen.WorkingArea.Width - this.Width;
            this.Top = _currentScreen.WorkingArea.Y + _currentScreen.WorkingArea.Bottom - this.Height;
        }
        private void webBrowser_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            // 缩放
            if (!_currentZoom.HasValue)
            {
                _currentZoom = AppHelper.PageZoom;
                object value = _currentZoom.Value, obj = null;
                try
                {
                    (webBrowser.ActiveXInstance as SHDocVw.WebBrowser)
                        .ExecWB(SHDocVw.OLECMDID.OLECMDID_OPTICAL_ZOOM, SHDocVw.OLECMDEXECOPT.OLECMDEXECOPT_DONTPROMPTUSER, ref value, ref obj);
                }
                catch { }
            }
        }

        #endregion
    }
}
