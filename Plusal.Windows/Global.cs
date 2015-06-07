using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace Plusal.Windows
{
    /// <summary>
    /// 全局服务类
    /// </summary>
    public class Global : Plusal.Shared.Global
    {
        #region 常量

        /// <summary>
        /// User32.dll
        /// </summary>
        internal const string User32DllName = "user32.dll";
        /// <summary>
        /// Kernel32.dll
        /// </summary>
        internal const string Kernel32DllName = "kernel32.dll";

        #endregion

        #region 属性

        /// <summary>
        /// 应用程序工作目录路径
        /// </summary>
        public static string ApplicationWorkingDirectoryPath
        {
            get
            {
                return Directory.GetCurrentDirectory().TrimEnd('\\') + "\\";
            }
        }

        /// <summary>
        /// 用户临时目录路径
        /// </summary>
        public static string UserTempDirectoryPath
        {
            get
            {
                return Path.GetTempPath().TrimEnd('\\') + "\\";
            }
        }

        #endregion
    }
}
