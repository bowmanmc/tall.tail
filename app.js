/**
 * Tall Tail Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , nconf = require('nconf')
  , io = require('socket.io')
;

require('./TallTail.js'); //creates global TallTail obj

console.log('Starting TalTail...');

var startTime = new Date();

// Load configuration
console.log('  loading configuration.');
nconf.use('file', {
  file: './config.json'
});

TallTail.bufferSize = nconf.get('buffersize');

var port = nconf.get('port');

console.log('  configuring express app...');
var app = express();
app.configure(function(){
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

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * URLs here
 */
app.get('/', routes.redirect);
app.get('/tail', routes.index);
app.get('/tail/f/:fileid', routes.tailer);

/*
 * Startup the server
 */
console.log('  creating http server');
server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("TallTail server listening on port " + app.get('port'));

  console.log('    starting tailers...');
  var files = nconf.get('files');
  files.forEach(function(file, i, arr) {
    TallTail.tailFile(file);
  });

  var startupEnd = new Date();
  var duration = startupEnd.getTime() - startTime.getTime();
  console.log('    Startup time: ' + duration + 'ms');
});

// Setup socket.io
var sio = io.listen(server);
//data = sio.of('/tail/data').on('connection', function(socket) {
//sio.sockets.on('connection', function(socket) {
sio.of('/tail/data').on('connection', function(socket) {
  console.log('a connection was made!');

  socket.on('tail', function(fileid) {
    console.log('setting up tailer for file ' + fileid);
    var filedef = TallTail.files[fileid];
    if (typeof filedef === 'undefined') {
      console.log('file id "' + fileid + '" not found!');
      return; //todo: should send back an error or some shit
    }
    console.log('Tailing file at path ' + filedef.path);
    fs.stat(filedef.path, function(err,stats){
      if (err) throw err;
      var start = 0;
      if (stats.size > TallTail.buffersize) {
        start = stats.size - TallTail.buffersize;
      }
      console.log('@@@@ Start: ' + start + ' to ' + stats.size);
      var stream = fs.createReadStream(filedef.path, {
        start: start, 
        end: stats.size
      });
      stream.addListener("data", function(lines){
        lines = lines.toString('utf-8');
        lines = lines.slice(lines.indexOf("\n")+1).split("\n");
        socket.emit('data', { 
          lines : lines
        });
      });
    });
    fs.watchFile(filedef.path, function(curr, prev) {
      if (prev.size > curr.size) {
        return {clear:true};
      } 
      var stream = fs.createReadStream(filedef.path, { 
        start: prev.size, 
        end: curr.size
      });
      stream.addListener("data", function(lines) {
      //socket.broadcast({ tail : lines.toString('utf-8').split("\n") 
        socket.emit('data', {
          lines: lines.toString('utf-8').split('\n')
        });
      });
    });
  });
});
