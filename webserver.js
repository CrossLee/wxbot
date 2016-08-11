var express = require('express');
var webserver = express();
const spawn = require('child_process').spawn;

webserver.get('/', function(request, response) {
    var proc = spawn('electron', ['.']);
    proc.stdout.on('data', function (data) {
        response.send('<img src="' + data + '" />');
    })
})

webserver.listen(80);