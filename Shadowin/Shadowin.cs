using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.Diagnostics;
using Plusal.Windows;
using Shadowin.Implement;
using Shadowin.Properties;

namespace Shadowin
{
    public partial class Shadowin : Form
    {
        public readonly static string Version = "V" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
        private const int SizeDifference = 15;
        private const double OpacityDifference = 0.1;
        private readonly Uri BlankUrl = new Uri("about:blank");

        #region 属性

        /// <summary>
        /// 热键管理器
        /// </summary>
        private HotKeyManager SwHotKeyManager
        {
            get;
            set;
        }

        /// <summary>
        /// 允许自动刷新
        /// </summary>
        private bool RefreshEnabled
        {
            get;
            set;
        }

        #endregion

        public Shadowin()
        {
            InitializeComponent();

            this.Initialize();
        }
        ~Shadowin()
        {
            this.Close();
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

            //增大宽度
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.IncreaseWidthHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.IncreaseWidthHotKeyKey),
                new HotKeyEventHandler(this.OnIncreaseWidthHotKey)
                );
            //减小宽度
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.DecreaseWidthHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.DecreaseWidthHotKeyKey),
                new HotKeyEventHandler(this.OnDecreaseWidthHotKey)
                );
            //增大高度
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.IncreaseHeightHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.IncreaseHeightHotKeyKey),
                new HotKeyEventHandler(this.OnIncreaseHeightHotKey)
                );
            //减小高度
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.DecreaseHeightHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.DecreaseHeightHotKeyKey),
                new HotKeyEventHandler(this.OnDecreaseHeightHotKey)
                );
            //增大不透明度
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.IncreaseOpacityHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.IncreaseOpacityHotKeyKey),
                new HotKeyEventHandler(this.OnIncreaseOpacityHotKey)
                );
            //减小不透明度
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.DecreaseOpacityHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.DecreaseOpacityHotKeyKey),
                new HotKeyEventHandler(this.OnDecreaseOpacityHotKey)
                );
            //显示隐藏
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.ShowHideHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.ShowHideHotKeyKey),
                new HotKeyEventHandler(this.OnShowHideHotKey)
                );
            //退出
            this.SwHotKeyManager.Register(
                (Enumeration.ModifierKeys)Enumeration.FromString<Enumeration.ModifierKeys>(SwGlobal.ExitHotKeyModifierKey),
                (Keys)Enumeration.FromString<Keys>(SwGlobal.ExitHotKeyKey),
                new HotKeyEventHandler(this.OnExitHotKey)
                );

            #endregion

            #region 窗体

            this.toolTip1.ToolTipTitle = SwGlobal.Title;
            this.toolTip1.SetToolTip(this.pictureBox1, Version);
            this.Size = Settings.Default.FormSize;

            #endregion

            #region 刷新定时器

            if (SwGlobal.RefreshInterval > 0)
            {
                timer1.Interval = SwGlobal.RefreshInterval;
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

        /// <summary>
        /// 增大宽度
        /// </summary>
        private void OnIncreaseWidthHotKey()
        {
            if (this.Visible)
            {
                this.Width += SizeDifference;
            }
        }
        /// <summary>
        /// 减小宽度
        /// </summary>
        private void OnDecreaseWidthHotKey()
        {
            if (this.Visible)
            {
                this.Width -= SizeDifference;
            }
        }
        /// <summary>
        /// 增大高度
        /// </summary>
        private void OnIncreaseHeightHotKey()
        {
            if (this.Visible)
            {
                this.Height += SizeDifference;
            }
        }
        /// <summary>
        /// 减小高度
        /// </summary>
        private void OnDecreaseHeightHotKey()
        {
            if (this.Visible)
            {
                this.Height -= SizeDifference;
            }
        }
        /// <summary>
        /// 增大不透明度
        /// </summary>
        private void OnIncreaseOpacityHotKey()
        {
            if (this.Visible)
            {
                this.Opacity += OpacityDifference;
            }
        }
        /// <summary>
        /// 减小不透明度
        /// </summary>
        private void OnDecreaseOpacityHotKey()
        {
            if (this.Visible)
            {
                this.Opacity -= OpacityDifference;
            }
        }
        /// <summary>
        /// 显示隐藏
        /// </summary>
        private void OnShowHideHotKey()
        {
            this.Visible = !this.Visible;
        }
        /// <summary>
        /// 退出
        /// </summary>
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

        private void timer1_Tick(object sender, EventArgs e)
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
                //后台歇息
                webBrowser1.Url = BlankUrl;
            }

            timer1.Enabled = this.Visible && this.RefreshEnabled;
        }
        private void LoadUrl()
        {
            if (webBrowser1.Url == null || webBrowser1.Url.Equals(BlankUrl))
            {
                webBrowser1.Url = new Uri(SwGlobal.Url);
            }
            else
            {
                webBrowser1.Refresh(WebBrowserRefreshOption.Completely);
            }
        }

        private void Shadowin_SizeChanged(object sender, EventArgs e)
        {
            Screen screen;
            try
            {
                screen = Screen.AllScreens[SwGlobal.ScreenId];
            }
            catch
            {
                screen = Screen.PrimaryScreen;
            }
            this.Left = screen.WorkingArea.X + screen.WorkingArea.Width - this.Width;
            this.Top = screen.WorkingArea.Y + screen.WorkingArea.Bottom - this.Height;
        }

        private void pictureBox1_Click(object sender, EventArgs e)
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
    }
}
