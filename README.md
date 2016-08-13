# wxbot 微信机器人

<a href="https://github.com/fritx/awesome-wechat"><img width="110" height="20" src="https://img.shields.io/badge/awesome-wechat-brightgreen.svg"></a>&nbsp;&nbsp;<a href="https://github.com/fritx/wxbot"><img width="74" height="20" src="https://img.shields.io/badge/github-dev-orange.svg"></a>

- __普通个人号 微信机器人/外挂__ (不同于[webot](https://github.com/node-webot/webot)等公众号机器人)
- 意义: 个人号可充当公众号使用 关系增强/门槛降低/更多行为/依旧自动化
- 与[qqbot](https://github.com/xhan/qqbot)/[wqq](https://github.com/fritx/wqq)等不同: 基于浏览器/用户行为自动化 更贴近用户/更可靠
- 基于浏览器桌面平台[electron](https://github.com/atom/electron) 跨平台win/linux/mac
- 基于微信网页版 <https://wx.qq.com>
- 目前处于高度开发和观察阶段
- 目前代码提供自动回复 可自行定制

## 如何正确地下载electron

最好是打开VPN，直接运行命令安装：`sudo npm install -g electron-prebuilt`
如果在安装的时候，发现electron下载不下来，那么可以先用vpn在浏览器里下载下来，然后将下载下来的`electron-v1.3.3-linux-x64.zip` 上传到服务器的 `~/.electron` 文件夹就可以了。

## 无界面linux运行

1. 安装[xvfb](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)，安装firefox的目的是同时把x环境依赖安装好：

```
sudo apt-get update
sudo apt-get install firefox
sudo apt-get install xvfb
sudo apt-get install xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic
sudo apt-get install libxss1 libgconf-2-4
```

2. 启动xvfb，并设置DISPLAY环境变量，把xclient连接的xserver指定到我们的虚拟环境里：

```
sudo Xvfb :10 -ac &
export DISPLAY=:10
```

3. 安装mongodb，以ubuntu 14为例

```
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install mongodb-org
```

4. 运行electron，并执行我们的脚本

```
cd wxbot
npm install
electron . --enable-logging
```

5. 如果在执行过程中有些文件找不到，那么可以用apt-file来查找安装包，详情请参考：http://askubuntu.com/a/59708 

6. 如果只监听几个群聊，那么请修改 [preload.js](https://github.com/shiyimin/wxbot/blob/master/preload.js) 里的数组 `_bigBrother`，加上你要监听的群聊名称即可。

## 运行

1. 启动express服务器，监听请求
```plain
$ sudo node webserver.js 
```

2. 打开浏览器，访问：http://yourhost/

3. 扫描二维码，就可以登录微信机器人，并记录聊天记录。扫描二维码后，其实就是启动一个新的 electron 进程。

## 功能实现

- [x] 自动回复
- [x] 识别并回复相同的文本/表情/emoji
- [x] 识别图片/语音/视频/小视频
- [x] 识别位置/名片/链接/附件
- [x] 识别转账/在线聊天/实时对讲
- [x] 发送图片
- [x] 下载自定义表情/名片/图片/语音/附件
- [ ] 下载视频/小视频
- [ ] 感应系统消息 时间/邀请加群/红包等
- [x] 探索运行于无界面平台 [atom/electron#228](https://github.com/atom/electron/issues/228)
