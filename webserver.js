var express = require('express');
var webserver = express();
const spawn = require('child_process').spawn;

webserver.get('/', function(request, response) {
    var proc = spawn('electron', ['.']);
    var getQrImg = function (data) {
        response.send('<img src="' + data + '" />');
        proc.stdout.removeListener('data', getQrImg);
    };

    proc.stdout.on('data', getQrImg);
})

webserver.listen(80);