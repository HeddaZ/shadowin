using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Text;

namespace Shadowin
{
    public class AppHelper
    {
        public static string Title = "Shadowin 影窗浏览器";
        internal const string User32DllName = "user32.dll";
        internal const string Kernel32DllName = "kernel32.dll";

        public static string Url
        {
            get
            {
                return AppHelper.GetConfig("Url");
            }
        }
        public static int RefreshInterval
        {
            get
            {
                return int.Parse(AppHelper.GetConfig("RefreshInterval"));
            }
        }
        public static int ScreenId
        {
            get
            {
                try
                {
                    return int.Parse(AppHelper.GetConfig("ScreenId"));
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
                    return int.Parse(AppHelper.GetConfig("PageZoom").Replace("%", string.Empty));
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
                return AppHelper.GetConfig("IncreaseWidthHotKeyModifierKey");
            }
        }
        public static string IncreaseWidthHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("IncreaseWidthHotKeyKey");
            }
        }

        public static string DecreaseWidthHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("DecreaseWidthHotKeyModifierKey");
            }
        }
        public static string DecreaseWidthHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("DecreaseWidthHotKeyKey");
            }
        }

        public static string IncreaseHeightHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("IncreaseHeightHotKeyModifierKey");
            }
        }
        public static string IncreaseHeightHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("IncreaseHeightHotKeyKey");
            }
        }

        public static string DecreaseHeightHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("DecreaseHeightHotKeyModifierKey");
            }
        }
        public static string DecreaseHeightHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("DecreaseHeightHotKeyKey");
            }
        }

        public static string IncreaseOpacityHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("IncreaseOpacityHotKeyModifierKey");
            }
        }
        public static string IncreaseOpacityHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("IncreaseOpacityHotKeyKey");
            }
        }

        public static string DecreaseOpacityHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("DecreaseOpacityHotKeyModifierKey");
            }
        }
        public static string DecreaseOpacityHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("DecreaseOpacityHotKeyKey");
            }
        }

        public static string ShowHideHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("ShowHideHotKeyModifierKey");
            }
        }
        public static string ShowHideHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("ShowHideHotKeyKey");
            }
        }

        public static string ExitHotKeyModifierKey
        {
            get
            {
                return AppHelper.GetConfig("ExitHotKeyModifierKey");
            }
        }
        public static string ExitHotKeyKey
        {
            get
            {
                return AppHelper.GetConfig("ExitHotKeyKey");
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
