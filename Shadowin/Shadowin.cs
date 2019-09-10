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
using System.Runtime.InteropServices;

namespace Shadowin
{
    public partial class Shadowin : Form
    {
        public enum INTERNETFEATURELIST
        {
            FEATURE_OBJECT_CACHING = 0,
            FEATURE_ZONE_ELEVATION = 1,
            FEATURE_MIME_HANDLING = 2,
            FEATURE_MIME_SNIFFING = 3,
            FEATURE_WINDOW_RESTRICTIONS = 4,
            FEATURE_WEBOC_POPUPMANAGEMENT = 5,
            FEATURE_BEHAVIORS = 6,
            FEATURE_DISABLE_MK_PROTOCOL = 7,
            FEATURE_LOCALMACHINE_LOCKDOWN = 8,
            FEATURE_SECURITYBAND = 9,
            FEATURE_RESTRICT_ACTIVEXINSTALL = 10,
            FEATURE_VALIDATE_NAVIGATE_URL = 11,
            FEATURE_RESTRICT_FILEDOWNLOAD = 12,
            FEATURE_ADDON_MANAGEMENT = 13,
            FEATURE_PROTOCOL_LOCKDOWN = 14,
            FEATURE_HTTP_USERNAME_PASSWORD_DISABLE = 15,
            FEATURE_SAFE_BINDTOOBJECT = 16,
            FEATURE_UNC_SAVEDFILECHECK = 17,
            FEATURE_GET_URL_DOM_FILEPATH_UNENCODED = 18,
            FEATURE_TABBED_BROWSING = 19,
            FEATURE_SSLUX = 20,
            FEATURE_DISABLE_NAVIGATION_SOUNDS = 21,
            FEATURE_DISABLE_LEGACY_COMPRESSION = 22,
            FEATURE_FORCE_ADDR_AND_STATUS = 23,
            FEATURE_XMLHTTP = 24,
            FEATURE_DISABLE_TELNET_PROTOCOL = 25,
            FEATURE_FEEDS = 26,
            FEATURE_BLOCK_INPUT_PROMPTS = 27,
            FEATURE_ENTRY_COUNT = 28
        }

        private const int SizeDifference = 15;
        private const double OpacityDifference = 0.1;
        private readonly Uri BlankUrl = new Uri("about:blank");

        private uint _savedVolume = 0;

        private const int SET_FEATURE_ON_THREAD = 0x00000001;
        private const int SET_FEATURE_ON_PROCESS = 0x00000002;
        private const int SET_FEATURE_IN_REGISTRY = 0x00000004;
        private const int SET_FEATURE_ON_THREAD_LOCALMACHINE = 0x00000008;
        private const int SET_FEATURE_ON_THREAD_INTRANET = 0x00000010;
        private const int SET_FEATURE_ON_THREAD_TRUSTED = 0x00000020;
        private const int SET_FEATURE_ON_THREAD_INTERNET = 0x00000040;
        private const int SET_FEATURE_ON_THREAD_RESTRICTED = 0x00000080;

        [DllImport("urlmon.dll")]
        [PreserveSig]
        [return: MarshalAs(UnmanagedType.Error)]
        static extern int CoInternetSetFeatureEnabled(
          INTERNETFEATURELIST FeatureEntry,
          [MarshalAs(UnmanagedType.U4)] int dwFlags,
          bool fEnable);

        [DllImport("winmm.dll")]
        public static extern int waveOutGetVolume(IntPtr h, out uint dwVolume);

        [DllImport("winmm.dll")]
        public static extern int waveOutSetVolume(IntPtr h, uint dwVolume);

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

            // Silence the program
            CoInternetSetFeatureEnabled(INTERNETFEATURELIST.FEATURE_DISABLE_NAVIGATION_SOUNDS, SET_FEATURE_ON_PROCESS, true);
            waveOutGetVolume(IntPtr.Zero, out _savedVolume);
        }
        ~Shadowin()
        {
            // restore the volume
            waveOutSetVolume(IntPtr.Zero, _savedVolume);

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
            this.toolTip1.SetToolTip(this.pictureBox1, "V" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString());
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
            if (MessageBox.Show(this, "欢迎捐献支持本项目发展，接受 支付宝 或 PayPal ^_^\n\n您确定要退出吗？", SwGlobal.Title, MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button1) == DialogResult.Yes)
            {
                this.Close();
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

        /// <summary>
        /// 重新定位
        /// </summary>
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
            if (MessageBox.Show(this, string.Format("谢谢您使用 {0} ！\n\n作者：{1}\n邮件：{2}\n网站：{3}\n\n(尊重开源、尊重分享，再发布请保留以上信息，谢谢)",
                                            SwGlobal.Title,
                                            "Hedda",
                                            "heddaz(at)live.com",
                                            "https://github.com/heddaz/shadowin"
                                            ),
                                SwGlobal.Title,
                                MessageBoxButtons.OKCancel,
                                MessageBoxIcon.Information
               ) == DialogResult.OK)
            {
                Process.Start("iexplore.exe", "https://github.com/heddaz/shadowin");
            }
        }
    }
}
