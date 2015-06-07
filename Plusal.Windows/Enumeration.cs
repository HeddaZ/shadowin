using System;
using System.Collections.Generic;
using System.Text;

namespace Plusal.Windows
{
    /// <summary>
    /// 枚举集合类
    /// </summary>
    public class Enumeration : Plusal.Shared.Enumeration
    {
        /// <summary>
        /// 组合键
        /// </summary>
        public enum ModifierKeys
        {
            /// <summary>
            /// 无
            /// </summary>
            None = 0,
            /// <summary>
            /// Alt键
            /// </summary>
            Alt = 1,
            /// <summary>
            /// Ctrl键
            /// </summary>
            Control = 2,
            /// <summary>
            /// Shift键
            /// </summary>
            Shift = 4,
            /// <summary>
            /// Win键
            /// </summary>
            Windows = 8
        }
    }
}
