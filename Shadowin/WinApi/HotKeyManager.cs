using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

namespace Shadowin.WinApi
{
    public delegate void HotKeyEventHandler();

    public enum ModifierKeys
    {
        None = 0,
        Alt = 1,
        Control = 2,
        Shift = 4,
        Windows = 8
    }

    public class HotKeyManager : IMessageFilter, IDisposable
    {
        private const int WM_HOTKEY = 0x0312;

        [DllImport(SwGlobal.User32DllName)]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
        [DllImport(SwGlobal.User32DllName)]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        private Control Owner
        {
            get;
            set;
        }
        private Dictionary<ushort, HotKeyEventHandler> HotKeyTable
        {
            get;
            set;
        }

        public HotKeyManager(Control owner)
        {
            this.Owner = owner;
            this.HotKeyTable = new Dictionary<ushort, HotKeyEventHandler>();

            Application.AddMessageFilter(this);
        }

        ~HotKeyManager()
        {
            this.Dispose(false);
        }

        #region IDisposable

        private bool disposed = false;
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }
        protected virtual void Dispose(bool disposing)
        {
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


                #endregion

                this.disposed = true;
            }
        }

        #endregion
        #region IMessageFilter

        public bool PreFilterMessage(ref Message m)
        {
            if (m.Msg == WM_HOTKEY)
            {
                ushort id = (ushort)m.WParam; // 热键ID
                this.HotKeyTable[id](); // 调用热键事件委托

                return true;
            }
            return false;
        }

        #endregion

        public bool Register(ModifierKeys modifierKey, Keys key, HotKeyEventHandler hotKeyEventHandler)
        {
            ushort id = GlobalAtom.Add(this.GetHotKeyName(modifierKey, key));
            if (HotKeyManager.RegisterHotKey(this.Owner.Handle, id, (uint)modifierKey, (uint)key))
            {
                this.HotKeyTable.Add(id, hotKeyEventHandler);
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool Register(Keys key, HotKeyEventHandler hotKeyEventHandler)
        {
            return this.Register(ModifierKeys.None, key, hotKeyEventHandler);
        }

        public bool Unregister(ModifierKeys modifierKey, Keys key)
        {
            ushort id = GlobalAtom.Find(this.GetHotKeyName(modifierKey, key));
            if (this.HotKeyTable.ContainsKey(id))
            {
                if (HotKeyManager.UnregisterHotKey(this.Owner.Handle, id))
                {
                    this.HotKeyTable.Remove(id);
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
                return false;
            }
        }

        public bool Unregister(Keys key)
        {
            return this.Unregister(ModifierKeys.None, key);
        }

        public void Clear()
        {
            foreach (ushort id in this.HotKeyTable.Keys)
            {
                HotKeyManager.UnregisterHotKey(this.Owner.Handle, id);
                GlobalAtom.Delete(id);
            }
            this.HotKeyTable.Clear();
        }

        private string GetHotKeyName(ModifierKeys modifierKey, Keys key)
        {
            return string.Format("HotKey({0}+{1})__Shadowin",
                (uint)modifierKey,
                (uint)key);
        }
    }
}
