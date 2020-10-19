using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace Shadowin.WinApi
{
    public class GlobalAtom
    {
        [DllImport(AppHelper.Kernel32DllName)]
        private static extern ushort GlobalAddAtom(string lpString);
        [DllImport(AppHelper.Kernel32DllName)]
        private static extern ushort GlobalFindAtom(string lpString);
        [DllImport(AppHelper.Kernel32DllName)]
        private static extern ushort GlobalDeleteAtom(ushort nAtom);

        public static ushort Add(string key)
        {
            return GlobalAddAtom(key);
        }
        public static ushort Find(string key)
        {
            return GlobalFindAtom(key);
        }
        public static bool Delete(ushort value)
        {
            return GlobalDeleteAtom(value) == 0;
        }
    }
}
