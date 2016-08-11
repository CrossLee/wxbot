var BrowserWindow = require('electron').BrowserWindow
var app = require('electron').app
var _ = require('lodash')
var fs = require('fs-extra')
var bytes = require('bytes')
var ipcMain = require('electron').ipcMain;

function debug(/*args*/){
	var args = JSON.stringify(_.toArray(arguments))
	console.log(args)
}

var downloadDir = `${__dirname}/download`
fs.mkdirpSync(downloadDir)

app.on('ready', function(){
	var win = new BrowserWindow({
		width: 900,
		height: 610,
		webPreferences: {
			nodeIntegration: false,
			preload: __dirname + '/preload.js'
		}
	})
	win.loadURL('https://wx.qq.com/?lang=zh_CN&t=' + Date.now())

	win.on('closed', function() {
		win = null;
	});
	
	ipcMain.on('set-qrimg', function(event, arg) {
		console.log(arg);
	});
})

