using System;
using System.Collections.Generic;
using System.Text;
using Plusal.Windows;

namespace Shadowin.Implement
{
    /// <summary>
    /// Shadowin全局服务类
    /// </summary>
    public class SwGlobal : Global
    {
        /// <summary>
        /// 标题
        /// </summary>
        public static string Title = "Shadowin 影窗浏览器";

        #region 属性

        /// <summary>
        /// Url
        /// </summary>
        public static string Url
        {
            get
            {
                return SwGlobal.GetConfiguration("Url");
            }
        }

        /// <summary>
        /// 刷新时间间隔
        /// </summary>
        public static int RefreshInterval
        {
            get
            {
                return int.Parse(SwGlobal.GetConfiguration("RefreshInterval"));
            }
        }

        #region 热键

        /// <summary>
        /// 增大宽度热键组合键
        /// </summary>
        public static string IncreaseWidthHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("IncreaseWidthHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 增大宽度热键键
        /// </summary>
        public static string IncreaseWidthHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("IncreaseWidthHotKeyKey");
            }
        }

        /// <summary>
        /// 减小宽度热键组合键
        /// </summary>
        public static string DecreaseWidthHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("DecreaseWidthHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 减小宽度热键键
        /// </summary>
        public static string DecreaseWidthHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("DecreaseWidthHotKeyKey");
            }
        }

        /// <summary>
        /// 增大高度热键组合键
        /// </summary>
        public static string IncreaseHeightHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("IncreaseHeightHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 增大高度热键键
        /// </summary>
        public static string IncreaseHeightHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("IncreaseHeightHotKeyKey");
            }
        }

        /// <summary>
        /// 减小高度热键组合键
        /// </summary>
        public static string DecreaseHeightHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("DecreaseHeightHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 减小高度热键键
        /// </summary>
        public static string DecreaseHeightHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("DecreaseHeightHotKeyKey");
            }
        }

        /// <summary>
        /// 增大不透明度热键组合键
        /// </summary>
        public static string IncreaseOpacityHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("IncreaseOpacityHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 增大不透明度热键键
        /// </summary>
        public static string IncreaseOpacityHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("IncreaseOpacityHotKeyKey");
            }
        }

        /// <summary>
        /// 减小不透明度热键组合键
        /// </summary>
        public static string DecreaseOpacityHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("DecreaseOpacityHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 减小不透明度热键键
        /// </summary>
        public static string DecreaseOpacityHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("DecreaseOpacityHotKeyKey");
            }
        }

        /// <summary>
        /// 显示隐藏热键组合键
        /// </summary>
        public static string ShowHideHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("ShowHideHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 显示隐藏热键键
        /// </summary>
        public static string ShowHideHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("ShowHideHotKeyKey");
            }
        }

        /// <summary>
        /// 退出热键组合键
        /// </summary>
        public static string ExitHotKeyModifierKey
        {
            get
            {
                return SwGlobal.GetConfiguration("ExitHotKeyModifierKey");
            }
        }
        /// <summary>
        /// 退出热键键
        /// </summary>
        public static string ExitHotKeyKey
        {
            get
            {
                return SwGlobal.GetConfiguration("ExitHotKeyKey");
            }
        }

        #endregion

        #endregion

        #region 方法

        /// <summary>
        /// 获取配置参数的值
        /// </summary>
        /// <param name="name">参数名称</param>
        /// <returns></returns>
        public static string GetConfiguration(string name)
        {
            Plusal.Shared.Configuration configuration = new Plusal.Shared.Configuration(Enumeration.ConfigurationElement.AppSettings);
            return configuration.Get(name);
        }

        #endregion
    }
}
