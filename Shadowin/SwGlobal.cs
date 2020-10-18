using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Text;

namespace Shadowin
{
    public class SwGlobal
    {
        public static string Title = "Shadowin 影窗浏览器";
        internal const string User32DllName = "user32.dll";
        internal const string Kernel32DllName = "kernel32.dll";

        public static string Url
        {
            get
            {
                return SwGlobal.GetConfig("Url");
            }
        }
        public static int RefreshInterval
        {
            get
            {
                return int.Parse(SwGlobal.GetConfig("RefreshInterval"));
            }
        }
        public static int ScreenId
        {
            get
            {
                try
                {
                    return int.Parse(SwGlobal.GetConfig("ScreenId"));
                }
                catch
                {
                    return 0;
                }
            }
        }
        public static int PageZoom
        {
            get
            {
                try
                {
                    return int.Parse(SwGlobal.GetConfig("PageZoom").Replace("%", string.Empty));
                }
                catch
                {
                    return 100;
                }
            }
        }

        #region 热键

        public static string IncreaseWidthHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("IncreaseWidthHotKeyModifierKey");
            }
        }
        public static string IncreaseWidthHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("IncreaseWidthHotKeyKey");
            }
        }

        public static string DecreaseWidthHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("DecreaseWidthHotKeyModifierKey");
            }
        }
        public static string DecreaseWidthHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("DecreaseWidthHotKeyKey");
            }
        }

        public static string IncreaseHeightHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("IncreaseHeightHotKeyModifierKey");
            }
        }
        public static string IncreaseHeightHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("IncreaseHeightHotKeyKey");
            }
        }

        public static string DecreaseHeightHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("DecreaseHeightHotKeyModifierKey");
            }
        }
        public static string DecreaseHeightHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("DecreaseHeightHotKeyKey");
            }
        }

        public static string IncreaseOpacityHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("IncreaseOpacityHotKeyModifierKey");
            }
        }
        public static string IncreaseOpacityHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("IncreaseOpacityHotKeyKey");
            }
        }

        public static string DecreaseOpacityHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("DecreaseOpacityHotKeyModifierKey");
            }
        }
        public static string DecreaseOpacityHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("DecreaseOpacityHotKeyKey");
            }
        }

        public static string ShowHideHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("ShowHideHotKeyModifierKey");
            }
        }
        public static string ShowHideHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("ShowHideHotKeyKey");
            }
        }

        public static string ExitHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfig("ExitHotKeyModifierKey");
            }
        }
        public static string ExitHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfig("ExitHotKeyKey");
            }
        }

        #endregion

        public static string GetConfig(string name)
        {
            return ConfigurationManager.AppSettings[name];
        }
        public static T StringToEnum<T>(string s)
        {
            return (T)Enum.Parse(typeof(T), s, true);
        }
    }
}
