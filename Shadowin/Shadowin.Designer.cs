namespace Shadowin
{
    partial class Shadowin
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.webBrowser = new System.Windows.Forms.WebBrowser();
            this.toolTip = new System.Windows.Forms.ToolTip(this.components);
            this.refreshTimer = new System.Windows.Forms.Timer(this.components);
            this.logoImage = new System.Windows.Forms.PictureBox();
            ((System.ComponentModel.ISupportInitialize)(this.logoImage)).BeginInit();
            this.SuspendLayout();
            // 
            // webBrowser
            // 
            this.webBrowser.AllowWebBrowserDrop = false;
            this.webBrowser.Dock = System.Windows.Forms.DockStyle.Fill;
            this.webBrowser.Location = new System.Drawing.Point(0, 0);
            this.webBrowser.Margin = new System.Windows.Forms.Padding(3, 5, 3, 5);
            this.webBrowser.Name = "webBrowser";
            this.webBrowser.Size = new System.Drawing.Size(1060, 240);
            this.webBrowser.TabIndex = 0;
            this.webBrowser.TabStop = false;
            this.webBrowser.DocumentCompleted += new System.Windows.Forms.WebBrowserDocumentCompletedEventHandler(this.webBrowser_DocumentCompleted);
            // 
            // toolTip
            // 
            this.toolTip.IsBalloon = true;
            this.toolTip.ShowAlways = true;
            this.toolTip.ToolTipIcon = System.Windows.Forms.ToolTipIcon.Info;
            // 
            // refreshTimer
            // 
            this.refreshTimer.Tick += new System.EventHandler(this.refreshTimer_Tick);
            // 
            // logoImage
            // 
            this.logoImage.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.logoImage.BackColor = System.Drawing.Color.White;
            this.logoImage.Cursor = System.Windows.Forms.Cursors.Hand;
            this.logoImage.Image = global::Shadowin.Properties.Resources.Shadowin_16;
            this.logoImage.Location = new System.Drawing.Point(1018, 207);
            this.logoImage.Margin = new System.Windows.Forms.Padding(3, 5, 3, 5);
            this.logoImage.Name = "logoImage";
            this.logoImage.Size = new System.Drawing.Size(16, 16);
            this.logoImage.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize;
            this.logoImage.TabIndex = 1;
            this.logoImage.TabStop = false;
            this.logoImage.Click += new System.EventHandler(this.logoImage_Click);
            // 
            // Shadowin
            // 
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.None;
            this.BackColor = global::Shadowin.Properties.Settings.Default.FormBackColor;
            this.ClientSize = new System.Drawing.Size(1060, 240);
            this.Controls.Add(this.logoImage);
            this.Controls.Add(this.webBrowser);
            this.Font = global::Shadowin.Properties.Settings.Default.FormFont;
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            this.Margin = new System.Windows.Forms.Padding(3, 5, 3, 5);
            this.MaximumSize = global::Shadowin.Properties.Settings.Default.FormMaximumSize;
            this.MinimumSize = global::Shadowin.Properties.Settings.Default.FormMinimumSize;
            this.Name = "Shadowin";
            this.Opacity = global::Shadowin.Properties.Settings.Default.Opacity;
            this.ShowInTaskbar = false;
            this.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
            this.Text = "Shadowin 影窗浏览器";
            this.TopMost = true;
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Shadowin_FormClosing);
            this.SizeChanged += new System.EventHandler(this.Shadowin_SizeChanged);
            this.VisibleChanged += new System.EventHandler(this.Shadowin_VisibleChanged);
            ((System.ComponentModel.ISupportInitialize)(this.logoImage)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.WebBrowser webBrowser;
        private System.Windows.Forms.PictureBox logoImage;
        private System.Windows.Forms.ToolTip toolTip;
        private System.Windows.Forms.Timer refreshTimer;
    }
}

