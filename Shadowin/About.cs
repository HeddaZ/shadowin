using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace Shadowin
{
    public partial class About : Form
    {
        public About()
        {
            InitializeComponent();
        }

        private void About_Load(object sender, EventArgs e)
        {
            versionLabel.Text = Shadowin.Version;
        }

        private void projectLink_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            var link = sender as LinkLabel;
            if (link != null)
            {
                OpenLink(link.Tag.ToString());
            }
        }

        private void qqLink_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            var link = sender as LinkLabel;
            if (link != null)
            {
                OpenLink(link.Tag.ToString());
            }
        }

        private static void OpenLink(string url)
        {
            Process.Start(url);
        }
    }
}
