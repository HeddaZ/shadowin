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
    /// 播放服务类
    /// </summary>
    public class SoundPlayer : Plusal.Common.ThreadingWork
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
        /// 源
        /// </summary>
        private Stream Source
        {
            get;
            set;
        }
        /// <summary>
        /// 设备
        /// </summary>
        private Device Device
        {
            get;
            set;
        }
        /// <summary>
        /// 缓冲区
        /// </summary>
        private SecondaryBuffer Buffer
        {
            get;
            set;
        }
        /// <summary>
        /// 缓冲区片段尺寸
        /// </summary>
        private int BufferSectionSize
        {
            get;
            set;
        }
        /// <summary>
        /// 缓冲区尺寸
        /// </summary>
        private int BufferSize
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
        /// 上次写入位置
        /// </summary>
        private int LastWritePosition
        {
            get;
            set;
        }
        /// <summary>
        /// 播放服务空闲
        /// </summary>
        public bool Idle
        {
            get;
            set;
        }

        #endregion

        /// <summary>
        /// 创建播放服务对象
        /// </summary>
        /// <param name="owner">宿主</param>
        /// <param name="deviceIndex">设备序号（0 - 默认设备）</param>
        /// <param name="channelCount">通道数</param>
        /// <param name="frequency">采样频率（次/秒）</param>
        /// <param name="sampleSize">样本尺寸（位/次）</param>
        /// <param name="bufferSectionTimeSpan">缓冲区片段的时间间隔</param>
        /// <param name="bufferSectionCount">缓冲区片段数</param>
        /// <param name="notificationEvent">通知点信号（工作线程等待此信号）</param>
        public SoundPlayer(Control owner, int deviceIndex, short channelCount, int frequency, short sampleSize, TimeSpan bufferSectionTimeSpan, int bufferSectionCount, AutoResetEvent notificationEvent)
            : base()
        {
            //宿主
            this.Owner = owner;

            #region 源

            this.Source = new MemoryStream();

            #endregion

            #region 设备

            DevicesCollection devices = new DevicesCollection();
            this.Device = new Device(devices[deviceIndex].DriverGuid);
            //协作等级
            this.Device.SetCooperativeLevel(this.Owner, CooperativeLevel.Priority);

            #endregion

            #region 缓冲区

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
            this.BufferSectionSize = format.AverageBytesPerSecond * (int)bufferSectionTimeSpan.TotalSeconds;
            //缓冲区尺寸
            this.BufferSize = this.BufferSectionSize * bufferSectionCount;

            //缓冲区描述
            BufferDescription bufferDescription = new BufferDescription(format);
            bufferDescription.BufferBytes = this.BufferSize;
            bufferDescription.ControlPositionNotify = true;
            bufferDescription.CanGetCurrentPosition = true;
            bufferDescription.GlobalFocus = true; //允许后台播放

            //创建
            this.Buffer = new SecondaryBuffer(bufferDescription, this.Device);

            #endregion

            #region 缓冲区位置通知序列

            //通知点信号
            this.NotificationEvent = notificationEvent;
            //位置通知序列
            BufferPositionNotify[] bufferPositionNotifys = new BufferPositionNotify[bufferSectionCount];
            for (int i = 0; i < bufferSectionCount; i++)
            {
                bufferPositionNotifys[i].Offset = this.BufferSectionSize * i; //通知点
                bufferPositionNotifys[i].EventNotifyHandle = this.NotificationEvent.SafeWaitHandle.DangerousGetHandle(); //通知点信号 Set()
            }
            //将位置通知序列指派到缓冲区
            (new Notify(this.Buffer)).SetNotificationPositions(bufferPositionNotifys);

            #endregion

            #region 工作线程

            this.ThreadWorking = true;
            this.WorkingThread = new Thread(new ParameterizedThreadStart(this.WorkingThreadProcess));
            this.WorkingThread.IsBackground = true;
            this.WorkingThread.Start(this.NotificationEvent); //带入参数

            #endregion

            //启动
            this.Idle = true;
            this.LastWritePosition = -1; //初始化为负数，播放时再次初始化
            this.Buffer.Play(0, BufferPlayFlags.Looping);
        }

        /// <summary>
        /// 创建播放服务对象（使用默认设备）
        /// </summary>
        /// <param name="owner">宿主</param>
        /// <param name="channelCount">通道数</param>
        /// <param name="frequency">采样频率（次/秒）</param>
        /// <param name="sampleSize">样本尺寸（位/次）</param>
        /// <param name="bufferSectionTimeSpan">缓冲区片段的时间间隔</param>
        /// <param name="bufferSectionCount">缓冲区片段数</param>
        /// <param name="notificationEvent">通知点信号（工作线程等待此信号）</param>
        public SoundPlayer(Control owner, short channelCount, int frequency, short sampleSize, TimeSpan bufferSectionTimeSpan, int bufferSectionCount, AutoResetEvent notificationEvent)
            : this(owner, 0, channelCount, frequency, sampleSize, bufferSectionTimeSpan, bufferSectionCount, notificationEvent)
        {
        }

        /// <summary>
        /// 销毁
        /// </summary>
        ~SoundPlayer()
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
                    if (this.Source != null)
                    {
                        try
                        {
                            this.Source.Dispose();
                        }
                        catch
                        {
                        }
                        finally
                        {
                            this.Source = null;
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

        #region 处理

        /// <summary>
        /// 工作线程处理（接收缓冲区位置通知信号，写入待播放的数据）
        /// </summary>
        /// <param name="argument"></param>
        private void WorkingThreadProcess(object argument)
        {
            while (this.ThreadWorking)
            {
                if (((AutoResetEvent)argument).WaitOne(Timeout.Infinite, true))
                {
                    this.WriteToBuffer();
                }
            }
        }

        /// <summary>
        /// 将待播放的数据写入缓冲区中
        /// </summary>
        private void WriteToBuffer()
        {
            int currentPlayPosition, currentWritePosition;
            this.Buffer.GetCurrentPosition(out currentPlayPosition, out currentWritePosition);
            #region 再次初始化上次写入位置
            //需要再次初始化
            if (this.LastWritePosition < 0)
            {
                this.LastWritePosition = currentWritePosition; //当前写位置
            }
            #endregion

            //读取源（按片段）
            byte[] buffer = new byte[this.BufferSectionSize];
            int realDataSize = this.Source.Read(buffer, 0, buffer.Length);
            #region 指示是否空闲
            //是否能从当前源中读取有效数据
            this.Idle = !(realDataSize > 0);
            #endregion

            //写入缓冲区（无论是否有效数据，写入固定尺寸）
            this.Buffer.Write(this.LastWritePosition, buffer, LockFlag.None);

            //更新上次写入位置
            this.LastWritePosition += this.BufferSectionSize;
            this.LastWritePosition %= this.BufferSize; //环状
        }

        #endregion

        #region 操作

        /// <summary>
        /// 播放
        /// </summary>
        /// <param name="source">源</param>
        public void Play(Stream source)
        {
            //保持旧源引用
            Stream oldSource = this.Source;
            //更换新源
            source.Seek(0, SeekOrigin.Begin);
            this.Source = source;
            //最后释放旧源
            if (oldSource != null)
            {
                try
                {
                    oldSource.Dispose();
                }
                catch
                {
                }
                finally
                {
                    oldSource = null;
                }
            }
        }

        #endregion
    }
}
