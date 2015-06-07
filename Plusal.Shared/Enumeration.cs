using System;
using System.Collections.Generic;
using System.Text;

namespace Plusal.Shared
{
    /// <summary>
    /// 枚举集合类
    /// </summary>
    public class Enumeration
    {
        /// <summary>
        /// 配置节点
        /// </summary>
        public enum ConfigurationElement
        {
            /// <summary>
            /// appSettings节点
            /// </summary>
            AppSettings,

            /// <summary>
            /// connectionStrings节点
            /// </summary>
            ConnectionStrings
        }

        /// <summary>
        /// 散列算法密码术
        /// </summary>
        public enum HashAlgorithmCryptography
        {
            /// <summary>
            /// SHA1
            /// </summary>
            SHA1,
            /// <summary>
            /// MD5
            /// </summary>
            MD5,
            /// <summary>
            /// SHA256
            /// </summary>
            SHA256,
            /// <summary>
            /// SHA384
            /// </summary>
            SHA384,
            /// <summary>
            /// SHA512
            /// </summary>
            SHA512
        }

        /// <summary>
        /// 对称算法密码术
        /// </summary>
        public enum SymmetricAlgorithmCryptography
        {
            /// <summary>
            /// DES
            /// </summary>
            DES,
            /// <summary>
            /// RC2
            /// </summary>
            RC2,
            /// <summary>
            /// Rijndael
            /// </summary>
            Rijndael,
            /// <summary>
            /// TripleDES
            /// </summary>
            TripleDES
        }

        #region 转换方法

        /// <summary>
        /// 转换为字符串
        /// </summary>
        /// <param name="enumObject"></param>
        /// <returns></returns>
        public static string ToString(object enumObject)
        {
            return enumObject.ToString();
        }

        /// <summary>
        /// 从字符串获取枚举对象
        /// </summary>
        /// <typeparam name="T">枚举类型</typeparam>
        /// <param name="enumString"></param>
        /// <returns>枚举对象</returns>
        public static T FromString<T>(string enumString)
        {
            return (T)Enum.Parse(typeof(T), enumString, true); //忽略大小写
        }

        #endregion
    }
}
