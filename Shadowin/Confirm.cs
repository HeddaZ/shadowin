using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace Shadowin
{
    public partial class Confirm : Form
    {
        public Confirm()
        {
            InitializeComponent();
        }

        public Confirm(string message)
            : this()
        {
            messageLabel.Text = message;
        }
    }
}
