using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;

namespace Plusal.Windows
{
    /// <summary>
    /// 全局原子服务类
    /// </summary>
    public class GlobalAtom
    {
        #region API

        /// <summary>
        /// 添加全局原子
        /// </summary>
        /// <param name="lpString">特征字符串</param>
        /// <returns>全局原子标识</returns>
        [DllImport(Global.Kernel32DllName)]
        private static extern ushort GlobalAddAtom(string lpString);
        /// <summary>
        /// 查询全局原子
        /// </summary>
        /// <param name="lpString">特征字符串</param>
        /// <returns>全局原子标识</returns>
        [DllImport(Global.Kernel32DllName)]
        private static extern ushort GlobalFindAtom(string lpString);
        /// <summary>
        /// 删除全局原子
        /// </summary>
        /// <param name="nAtom">全局原子标识</param>
        /// <returns>0</returns>
        [DllImport(Global.Kernel32DllName)]
        private static extern ushort GlobalDeleteAtom(ushort nAtom);

        #endregion

        /// <summary>
        /// 添加
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static ushort Add(string key)
        {
            return GlobalAtom.GlobalAddAtom(key);
        }

        /// <summary>
        /// 查询
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static ushort Find(string key)
        {
            return GlobalAtom.GlobalFindAtom(key);
        }

        /// <summary>
        /// 删除
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static bool Delete(ushort value)
        {
            return (GlobalAtom.GlobalDeleteAtom(value) == 0);
        }
    }
}
