using System;
using System.Collections.Generic;
using System.Text;
using System.Configuration;

namespace Plusal.Shared
{
    /// <summary>
    /// 配置服务类
    /// </summary>
    public class Configuration
    {
        #region 属性

        /// <summary>
        /// 配置节点
        /// </summary>
        public Enumeration.ConfigurationElement ConfigurationElement
        {
            get;
            private set;
        }

        #endregion

        /// <summary>
        /// 创建配置服务对象
        /// </summary>
        /// <param name="configurationElement">当前操作的配置节点</param>
        public Configuration(Enumeration.ConfigurationElement configurationElement)
        {
            this.ConfigurationElement = configurationElement;
        }

        /// <summary>
        /// 获取配置参数的值
        /// </summary>
        /// <param name="name">参数名称</param>
        /// <returns></returns>
        public string Get(string name)
        {
            switch (this.ConfigurationElement)
            {
                case Enumeration.ConfigurationElement.AppSettings:
                    return ConfigurationManager.AppSettings[name];
                case Enumeration.ConfigurationElement.ConnectionStrings:
                    return ConfigurationManager.ConnectionStrings[name].ConnectionString;
                default:
                    return string.Empty;
            }
        }
    }
}
