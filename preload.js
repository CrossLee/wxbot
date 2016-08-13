var clipboard = require('electron').clipboard
var nativeImage = require('electron').nativeImage
var _ = require('lodash')
var moment = require('moment');
var ipcRenderer = require('electron').ipcRenderer;  

var mongojs = require('mongojs')
var dbS = mongojs('mongodb://localhost/Vikvon',['single'])
var dbG = mongojs('mongodb://localhost/Vikvon',['theGroup'])

// 应对 微信网页偷换了console 使起失效
// 保住console引用 便于使用
window._console = window.console

function debug(/*args*/){
	var args = JSON.stringify(_.toArray(arguments))
	_console.log(args)
}

// 禁止外层网页滚动 影响使用
document.addEventListener('DOMContentLoaded', () => {
	// document.body.style.height = '100%'
	document.body.style.overflow = 'hidden'
})

var free = true
// setTimeout(function(){
	init()
// }, 3000)

function init(){
	var checkForQrcode = setInterval(function(){
		var qrimg = document.querySelector('.qrcode img')
		if (qrimg && qrimg.src.match(/\/qrcode/)) {
			ipcRenderer.send('set-qrimg', qrimg.src);
			// debug('二维码', qrimg.src)
			clearInterval(checkForQrcode)
		}
	}, 100)
	var checkForLogin = setInterval(function(){
		var chat_item = document.querySelector('.chat_item')
		if (chat_item) {
			onLogin()
			clearInterval(checkForLogin)
		}
	}, 500)
}

var _bigBrother = [{
	name: '机器人',
	lastmsg: ''
}, {
	name: 'jvm研究',
	lastmsg: ''
}, {
	name: 'erp移动信息化平台 交流群',
	lastmsg: ''
}, {
	name: 'topgeek | java开发者',
	lastmsg: ''
}, {
	name: '架构师高级群',
	lastmsg: ''
}, {
	name: '智能交互&朋友们',
	lastmsg: ''
}, {
	name: '中国架构师群英会',
	lastmsg: ''
}, {
	name: '火星高可用架构群',
	lastmsg: ''
}, {
	name: '黑画会 01',
	lastmsg: ''
}, {
	name: '贵溪上海商会.会员群',
	lastmsg: ''
}];

function checkMsgByReddot() {
	var $reddot = $('.web_wechat_reddot, .web_wechat_reddot_middle').last()
	if ($reddot.length) {
		var $chat_item = $reddot.closest('.chat_item');
		try {
			onReddot($chat_item)
		} catch (err) { // 错误解锁
			reset()
		}
	}
}

function bigBrotherIsWatching() {
	$('.chat_item').each(function(idx, item) {
		var $nickname = $(item).find('.info .nickname .nickname_text');

		if ($nickname.length) {
			var title = $nickname.text();
			title = title.toLowerCase();
			for (var i = 0; i < _bigBrother.length; ++i) {
				var bb = _bigBrother[i];
				var $msg = $(item).find('.info .msg');
				if (!$msg) continue;

				var msg = $msg.text();
				msg = msg ? msg.trim() : '';
				if (bb.name == title && msg && bb.lastmsg != msg) {
					bb.lastmsg = msg;
					onReddot([item]);
				}
			}
		}
	})
}

function onLogin(){
	$('img[src*=filehelper]').closest('.chat_item')[0].click()
	var checkForReddot = setInterval(function(){
		if (_bigBrother.length) {
			bigBrotherIsWatching();
		} else {
			checkMsgByReddot();
		}
	}, 500)
}

function onWxSystemMsg() {
	var $msg = $([
		'.message:not(.me) .bubble_cont > div',
		'.message:not(.me) .bubble_cont > a.app',
		'.message:not(.me) .emoticon',
		'.message_system'
	].join(', ')).last()
	if ($msg.is('.message_system')) {
		text = $msg.text();
		debug('收到消息');
	} 
}

function onReddot($chat_item){
	// if (!free) return
	// free = false
	$chat_item[0].click()

	setTimeout(function(){
		var reply = {
			date: moment().format('YYYY-MM-DD'),
			time: new Date().getTime()
		}

		// 自动回复 相同的内容
		var $msg = $([
			'.message:not(.me) .bubble_cont > div',
			'.message:not(.me) .bubble_cont > a.app',
			'.message:not(.me) .emoticon',
			'.message_system'
		].join(', ')).last()
		var $message = $msg.closest('.message')
		var $nickname = $message.find('.nickname')
		var $titlename = $('.title_name')

		if ($nickname.length) { // 群聊
			var from = $nickname.text()
			var room = $titlename.text()
		} else { // 单聊
			var from = $titlename.text()
			var room = null
		}

		if ($msg.is('.message_system')) {
			text = $msg.text();
			debug('收到消息');
		} else if ($msg.is('.plain')) {
			var text = ''
			var normal = false
			var $text = $msg.find('.js_message_plain')

			$text.contents().each(function(i, node){
				if (node.nodeType === Node.TEXT_NODE) {
					text += node.nodeValue
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					var $el = $(node)
					if ($el.is('br')) text += '\n'
					else if ($el.is('.qqemoji, .emoji')) {
						text += $el.attr('text').replace(/_web$/, '')
					}
				}
			})
	
			if (text === '[收到了一个表情，请在手机上查看]' ||
					text === '[Received a sticker. View on phone]') { // 微信表情包
				text = ''
			} else if (text === '[收到一条微信转账消息，请在手机上查看]' ||
					text === '[Received transfer. View on phone.]') {
				text = ''
			} else if (text === '[收到一条视频/语音聊天消息，请在手机上查看]' ||
					text === '[Received video/voice chat message. View on phone.]') {
				text = ''
			} else if (text === '我发起了实时对讲') {
				text = ''
			} else if (text === '该类型暂不支持，请在手机上查看') {
				text = ''
			} else if (text.match(/(.+)发起了位置共享，请在手机上查看/) ||
					text.match(/(.+)started a real\-time location session\. View on phone/)) {
				text = ''
			} else {
				normal = true
			}

			reply.text = text
		}

		// debug('回复', reply)

		// 借用clipboard 实现输入文字 更新ng-model=EditAreaCtn
		// ~~直接设#editArea的innerText无效 暂时找不到其他方法~~
		// paste(reply, room)

		if (dbS) {
			if (!room) {
				dbS.single.insert(reply)
			} else {
				reply.from = from
				reply.room = room
				dbG.theGroup.insert(reply)
			}
		}

		if (reply.image) {
			setTimeout(function(){
				var tryClickBtn = setInterval(function(){
					var $btn = $('.dialog_ft .btn_primary')
					if ($btn.length) {
						$('.dialog_ft .btn_primary')[0].click()
					} else {
						clearInterval(tryClickBtn)
						reset()
					}
				}, 200)
			}, 100)
		} else {
			$('.btn_send')[0].click()
			reset()
		}
	}, 100)
}

function reset(){
	// 适当清理历史 缓解dom数量
	var msgs = $('#chatArea').scope().chatContent
	if (msgs.length >= 30) msgs.splice(0, 20)
	$('img[src*=filehelper]').closest('.chat_item')[0].click()
	free = true
}

function paste(opt, waltWhite){
// 	// var oldImage = clipboard.readImage()
 	var oldHtml = clipboard.readHtml()
 	var oldText = clipboard.readText()
 	clipboard.clear() // 必须清空

    /*
    if (!waltWhite) {
    	dbS.single.insert(opt)
    } else {
     	dbG.theGroup.insert(opt)
    }
	*/
}

