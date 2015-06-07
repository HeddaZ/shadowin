using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Microsoft.DirectX.DirectSound;

namespace Plusal.Windows.Media
{
    /// <summary>
    /// 录音服务类
    /// </summary>
    public class SoundRecorder : Plusal.Common.ThreadingWork
    {
        #region 属性

        /// <summary>
        /// 宿主
        /// </summary>
        protected Control Owner
        {
            get;
            set;
        }
        /// <summary>
        /// 结果
        /// </summary>
        private Stream Result
        {
            get;
            set;
        }
        /// <summary>
        /// 设备
        /// </summary>
        private Capture Device
        {
            get;
            set;
        }
        /// <summary>
        /// 缓冲区
        /// </summary>
        private CaptureBuffer Buffer
        {
            get;
            set;
        }
        /// <summary>
        /// 缓冲区描述
        /// </summary>
        private CaptureBufferDescription BufferDescription
        {
            get;
            set;
        }
        /// <summary>
        /// 通知点信号
        /// </summary>
        private AutoResetEvent NotificationEvent
        {
            get;
            set;
        }
        /// <summary>
        /// 缓冲区位置通知序列
        /// </summary>
        private BufferPositionNotify[] BufferPositionNotifys
        {
            get;
            set;
        }
        /// <summary>
        /// 上次读取位置
        /// </summary>
        private int LastReadPosition
        {
            get;
            set;
        }

        #endregion

        #region 事件

        /// <summary>
        /// 开始事件
        /// </summary>
        public event StartedEventHandler Started;
        /// <summary>
        /// 触发开始事件
        /// </summary>
        /// <param name="sender">来源</param>
        protected virtual void OnStarted(object sender)
        {
            if (this.Started != null)
            {
                this.Started(sender);
            }
        }
        /// <summary>
        /// 完成事件
        /// </summary>
        public event CompleteEventHandler Complete;
        /// <summary>
        /// 触发完成事件
        /// </summary>
        /// <param name="sender">来源</param>
        /// <param name="e">参数</param>
        protected virtual void OnComplete(object sender, CompleteEventArgs e)
        {
            if (this.Complete != null)
            {
                this.Complete(sender, e);
            }
        }

        #endregion

        /// <summary>
        /// 创建录音服务对象
        /// </summary>
        /// <param name="owner">宿主</param>
        /// <param name="deviceIndex">设备序号（0 - 默认设备）</param>
        /// <param name="channelCount">通道数</param>
        /// <param name="frequency">采样频率（次/秒）</param>
        /// <param name="sampleSize">样本尺寸（位/次）</param>
        /// <param name="bufferSectionTimeSpan">缓冲区片段的时间间隔</param>
        /// <param name="bufferSectionCount">缓冲区片段数</param>
        /// <param name="notificationEvent">通知点信号（工作线程等待此信号）</param>
        public SoundRecorder(Control owner, int deviceIndex, short channelCount, int frequency, short sampleSize, TimeSpan bufferSectionTimeSpan, int bufferSectionCount, AutoResetEvent notificationEvent)
            : base()
        {
            //宿主
            this.Owner = owner;

            #region 设备

            CaptureDevicesCollection devices = new CaptureDevicesCollection();
            this.Device = new Capture(devices[deviceIndex].DriverGuid);

            #endregion

            #region 缓冲区描述

            #region Wave格式

            WaveFormat format = new WaveFormat();
            format.FormatTag = WaveFormatTag.Pcm;                                       //格式类型
            format.Channels = channelCount;                                             //通道数
            format.SamplesPerSecond = frequency;                                        //采样频率（次/秒）
            format.BitsPerSample = sampleSize;                                          //样本尺寸（位/次）
            format.BlockAlign = (short)((format.BitsPerSample / 8) * format.Channels);  //数据块的最小单元（字节/次）
            format.AverageBytesPerSecond = format.BlockAlign * format.SamplesPerSecond; //采样性能（字节/秒）

            #endregion

            //缓冲区片段尺寸
            int bufferSectionSize = format.AverageBytesPerSecond * (int)bufferSectionTimeSpan.TotalSeconds;
            //缓冲区尺寸
            int bufferSize = bufferSectionSize * bufferSectionCount;

            //创建
            CaptureBufferDescription bufferDescription = new CaptureBufferDescription();
            bufferDescription.Format = format;
            bufferDescription.BufferBytes = bufferSize;
            this.BufferDescription = bufferDescription;

            #endregion

            #region 缓冲区位置通知序列

            //通知点信号
            this.NotificationEvent = notificationEvent;
            //位置通知序列
            this.BufferPositionNotifys = new BufferPositionNotify[bufferSectionCount];
            for (int i = 0; i < bufferSectionCount; i++)
            {
                this.BufferPositionNotifys[i].Offset = bufferSectionSize * (i + 1) - 1; //通知点
                this.BufferPositionNotifys[i].EventNotifyHandle = this.NotificationEvent.SafeWaitHandle.DangerousGetHandle(); //通知点信号 Set()
            }

            #endregion

            #region 工作线程

            this.ThreadWorking = true;
            this.WorkingThread = new Thread(new ParameterizedThreadStart(this.WorkingThreadProcess));
            this.WorkingThread.IsBackground = true;
            this.WorkingThread.Start(this.NotificationEvent); //带入参数

            #endregion
        }

        /// <summary>
        /// 创建录音服务对象（使用默认设备）
        /// </summary>
        /// <param name="owner">宿主</param>
        /// <param name="channelCount">通道数</param>
        /// <param name="frequency">采样频率（次/秒）</param>
        /// <param name="sampleSize">样本尺寸（位/次）</param>
        /// <param name="bufferSectionTimeSpan">缓冲区片段的时间间隔</param>
        /// <param name="bufferSectionCount">缓冲区片段数</param>
        /// <param name="notificationEvent">通知点信号（工作线程等待此信号）</param>
        public SoundRecorder(Control owner, short channelCount, int frequency, short sampleSize, TimeSpan bufferSectionTimeSpan, int bufferSectionCount, AutoResetEvent notificationEvent)
            : this(owner, 0, channelCount, frequency, sampleSize, bufferSectionTimeSpan, bufferSectionCount, notificationEvent)
        {
        }

        /// <summary>
        /// 销毁
        /// </summary>
        ~SoundRecorder()
        {
            this.Dispose(false);
        }

        #region Override IDisposable Members

        /// <summary>
        /// 是否资源已释放
        /// </summary>
        private bool disposed = false;
        /// <summary>
        /// 释放资源
        /// </summary>
        /// <param name="disposing">是否释放托管资源</param>
        protected override void Dispose(bool disposing)
        {
            //是否已释放
            if (!this.disposed)
            {
                if (disposing)
                {
                    #region 释放托管资源

                    if (this.ThreadWorking)
                    {
                        this.ThreadWorking = false;
                    }
                    if (this.NotificationEvent != null)
                    {
                        try
                        {
                            this.NotificationEvent.Close();
                        }
                        catch
                        {
                        }
                        finally
                        {
                            this.NotificationEvent = null;
                        }
                    }
                    if (this.WorkingThread != null)
                    {
                        try
                        {
                            this.WorkingThread.Abort();
                        }
                        catch
                        {
                        }
                        finally
                        {
                            this.WorkingThread = null;
                        }
                    }
                    if (this.Result != null)
                    {
                        try
                        {
                            this.Result.Dispose();
                        }
                        catch
                        {
                        }
                        finally
                        {
                            this.Result = null;
                        }
                    }
                    if (this.Buffer != null)
                    {
                        try
                        {
                            this.Buffer.Dispose();
                        }
                        catch
                        {
                        }
                        finally
                        {
                            this.Buffer = null;
                        }
                    }
                    if (this.BufferPositionNotifys != null)
                    {
                        this.BufferPositionNotifys = null;
                    }
                    if (this.Device != null)
                    {
                        try
                        {
                            this.Device.Dispose();
                        }
                        catch
                        {
                        }
                        finally
                        {
                            this.Device = null;
                        }
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

            //释放基类资源
            base.Dispose(disposing);
        }

        #endregion

        #region 初始化

        /// <summary>
        /// 初始化
        /// </summary>
        private void Initialize()
        {
            #region 预清理

            if (this.Result != null)
            {
                this.Result.Dispose();
                this.Result = null;
            }
            if (this.Buffer != null)
            {
                this.Buffer.Dispose();
                this.Buffer = null;
            }

            #endregion

            //上次读取位置
            this.LastReadPosition = 0;
            //结果
            this.Result = new MemoryStream();
            //缓冲区
            this.Buffer = new CaptureBuffer(this.BufferDescription, this.Device);
            //将位置通知序列指派到缓冲区
            (new Notify(this.Buffer)).SetNotificationPositions(this.BufferPositionNotifys);
        }

        #endregion

        #region 处理

        /// <summary>
        /// 工作线程处理（接收缓冲区位置通知信号，保存成功捕获的数据）
        /// </summary>
        /// <param name="argument"></param>
        private void WorkingThreadProcess(object argument)
        {
            while (this.ThreadWorking)
            {
                if (((AutoResetEvent)argument).WaitOne(Timeout.Infinite, true))
                {
                    this.ReadFromBuffer();
                }
            }
        }

        /// <summary>
        /// 从缓冲区中读取已成功捕获数据
        /// </summary>
        private void ReadFromBuffer()
        {
            int currentCapturePosition, currentReadPosition, availableDataSize;
            this.Buffer.GetCurrentPosition(out currentCapturePosition, out currentReadPosition);
            //可读取的数据尺寸
            availableDataSize = (currentReadPosition >= this.LastReadPosition) ? (currentReadPosition - this.LastReadPosition) : (currentReadPosition + this.BufferDescription.BufferBytes - this.LastReadPosition);
            //可以读
            if (availableDataSize > 0)
            {
                byte[] buffer = (byte[])this.Buffer.Read(this.LastReadPosition, typeof(byte), LockFlag.None, availableDataSize); //取数据（改进：此处若有异常可丢弃本次数据保证录音继续）
                this.Result.Write(buffer, 0, buffer.Length); //存数据（改进：此处若有异常可丢弃本次数据保证录音继续）

                //更新上次读取位置
                this.LastReadPosition += buffer.Length;
                this.LastReadPosition %= this.BufferDescription.BufferBytes; //环状
            }
        }

        #endregion

        #region 操作

        /// <summary>
        /// 开始
        /// </summary>
        public void Start()
        {
            //初始化
            this.Initialize();
            //开始（循环利用缓冲区）
            this.Buffer.Start(true);
            //触发事件
            this.OnStarted(this);
        }

        /// <summary>
        /// 停止
        /// </summary>
        public void Stop()
        {
            //停止
            this.Buffer.Stop();
            //清理缓冲区
            this.ReadFromBuffer();
            //触发事件
            this.OnComplete(this, new CompleteEventArgs(this.Result));
        }

        #endregion
    }
}
