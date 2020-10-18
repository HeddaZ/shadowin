using System;
using System.Collections.Generic;
using System.Threading;
using System.Windows.Forms;

namespace Shadowin
{
    static class Program
    {
        private static Mutex _mutex;

        [STAThread]
        static void Main()
        {
            bool allowStart;
            _mutex = new Mutex(true, SwGlobal.Title, out allowStart); //单实例互斥
            if (allowStart)
            {
                try
                {
                    Application.EnableVisualStyles();
                    Application.SetCompatibleTextRenderingDefault(false);
                    Application.Run(new Shadowin());
                }
                finally
                {
                    _mutex.ReleaseMutex();
                }
            }
            else
            {
                MessageBox.Show(SwGlobal.Title + "正在运行中，使用预设热键即可激活显示。\r\n谢谢使用！", SwGlobal.Title, MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }
    }
}
