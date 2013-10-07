/**
 * Tall Tail Module dependencies.
 */
var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , config = require('./config.js')
;

require('./app/urls.js');

console.log('Starting TalTail...');

var startTime = new Date();

console.log('  configuring express app...');
var port = config.port;
var app = express();
app.configure(function() {
    app.set('port', port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

// Startup the server
console.log('  creating http server');
server = http.createServer(app);

TallTail.urls.configure(app);
TallTail.urls.listen(server); //socket.io listener

server.listen(app.get('port'), function() {
    console.log("TallTail server listening on port " + app.get('port'));
    var startupEnd = new Date();
    var duration = startupEnd.getTime() - startTime.getTime();
    console.log('    Startup time: ' + duration + 'ms');
});
