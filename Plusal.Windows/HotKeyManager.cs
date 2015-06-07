using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace Plusal.Windows
{
    /// <summary>
    /// 热键管理器
    /// </summary>
    public class HotKeyManager : IMessageFilter, IDisposable
    {
        /// <summary>
        /// 热键消息值
        /// </summary>
        private const int WM_HOTKEY = 0x0312;

        #region API

        /// <summary>
        /// 注册热键
        /// </summary>
        /// <param name="hWnd">窗体句柄</param>
        /// <param name="id">热键ID</param>
        /// <param name="fsModifiers">组合键</param>
        /// <param name="vk">键</param>
        /// <returns></returns>
        [DllImport(Global.User32DllName)]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
        /// <summary>
        /// 注销热键
        /// </summary>
        /// <param name="hWnd">窗体句柄</param>
        /// <param name="id">热键ID</param>
        /// <returns></returns>
        [DllImport(Global.User32DllName)]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        #endregion

        #region 属性

        /// <summary>
        /// 宿主
        /// </summary>
        private Control Owner
        {
            get;
            set;
        }
        /// <summary>
        /// 热键表
        /// </summary>
        private Dictionary<ushort, HotKeyEventHandler> HotKeyTable
        {
            get;
            set;
        }

        #endregion

        #region IMessageFilter Members

        /// <summary>
        /// 预过滤消息
        /// </summary>
        /// <param name="m"></param>
        /// <returns></returns>
        public bool PreFilterMessage(ref Message m)
        {
            //热键消息
            if (m.Msg == WM_HOTKEY)
            {
                //热键ID
                ushort id = (ushort)m.WParam;
                //调用热键事件委托
                this.HotKeyTable[id]();

                return true;
            }
            return false;
        }

        #endregion

        /// <summary>
        /// 创建热键管理器对象
        /// </summary>
        /// <param name="owner">宿主</param>
        public HotKeyManager(Control owner)
        {
            //属性
            this.Owner = owner;
            this.HotKeyTable = new Dictionary<ushort, HotKeyEventHandler>();

            //将自身添加为本应用程序消息过滤器
            Application.AddMessageFilter(this);
        }

        /// <summary>
        /// 销毁
        /// </summary>
        ~HotKeyManager()
        {
            this.Dispose(false);
        }

        #region IDisposable Members

        /// <summary>
        /// 是否资源已释放
        /// </summary>
        private bool disposed = false;
        /// <summary>
        /// 释放资源
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            //垃圾收集器
            GC.SuppressFinalize(this);
        }
        /// <summary>
        /// 释放资源
        /// </summary>
        /// <param name="disposing">是否释放托管资源</param>
        protected virtual void Dispose(bool disposing)
        {
            //是否已释放
            if (!this.disposed)
            {
                if (disposing)
                {
                    #region 释放托管资源

                    try
                    {
                        this.Clear();
                    }
                    catch
                    {
                    }
                    finally
                    {
                        this.HotKeyTable = null;
                    }
                    try
                    {
                        Application.RemoveMessageFilter(this);
                    }
                    catch
                    {
                    }
                    if (this.Owner != null)
                    {
                        this.Owner = null;
                    }

                    #endregion
                }

                #region 释放非托管资源

                //

                #endregion

                //已释放
                this.disposed = true;
            }
        }

        #endregion

        #region 操作

        /// <summary>
        /// 注册
        /// </summary>
        /// <param name="modifierKey">组合键</param>
        /// <param name="key">键</param>
        /// <param name="hotKeyEventHandler">热键事件委托</param>
        /// <returns></returns>
        public bool Register(Enumeration.ModifierKeys modifierKey, Keys key, HotKeyEventHandler hotKeyEventHandler)
        {
            //热键ID
            ushort id = GlobalAtom.Add(this.GetHotKeyName(modifierKey, key));

            //注册
            if (HotKeyManager.RegisterHotKey(this.Owner.Handle, id, (uint)modifierKey, (uint)key))
            {
                //保存到热键表中
                this.HotKeyTable.Add(id, hotKeyEventHandler);
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// 注册
        /// </summary>
        /// <param name="key">键</param>
        /// <param name="hotKeyEventHandler">热键事件委托</param>
        /// <returns></returns>
        public bool Register(Keys key, HotKeyEventHandler hotKeyEventHandler)
        {
            return this.Register(Enumeration.ModifierKeys.None, key, hotKeyEventHandler);
        }

        /// <summary>
        /// 注销
        /// </summary>
        /// <param name="modifierKey">组合键</param>
        /// <param name="key">键</param>
        /// <returns></returns>
        public bool Unregister(Enumeration.ModifierKeys modifierKey, Keys key)
        {
            //热键ID
            ushort id = GlobalAtom.Find(this.GetHotKeyName(modifierKey, key));

            //热键存在
            if (this.HotKeyTable.ContainsKey(id))
            {
                //注销
                if (HotKeyManager.UnregisterHotKey(this.Owner.Handle, id))
                {
                    //从热键表中删除
                    this.HotKeyTable.Remove(id);
                    //删除对应的全局原子
                    GlobalAtom.Delete(id);
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                //热键不存在
                return false;
            }
        }

        /// <summary>
        /// 注销
        /// </summary>
        /// <param name="key">键</param>
        /// <returns></returns>
        public bool Unregister(Keys key)
        {
            return this.Unregister(Enumeration.ModifierKeys.None, key);
        }

        /// <summary>
        /// 清空
        /// </summary>
        public void Clear()
        {
            //轮循
            foreach (ushort id in this.HotKeyTable.Keys)
            {
                //注销
                HotKeyManager.UnregisterHotKey(this.Owner.Handle, id);
                //删除对应的全局原子
                GlobalAtom.Delete(id);
            }
            //从热键表中删除
            this.HotKeyTable.Clear();
        }

        #endregion

        #region 方法

        /// <summary>
        /// 获取热键名称标识
        /// </summary>
        /// <param name="modifierKey">组合键</param>
        /// <param name="key">键</param>
        /// <returns></returns>
        private string GetHotKeyName(Enumeration.ModifierKeys modifierKey, Keys key)
        {
            return string.Format("HotKey({0}+{1})@Plusal",
                (uint)modifierKey,
                (uint)key
                );
        }

        #endregion
    }
}
