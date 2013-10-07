/**
 * Tall Tail URL Definitions
 */
// Dependencies
var fs = require('fs')
  , io = require('socket.io')
  , routes = require('../routes')
;

require('./ttconfig.js');

// Namespacing
if (typeof TallTail === 'undefined') {
    TallTail = {};
}
if (typeof TallTail.urls === 'undefined') {
    TallTail.urls = {};
}

// main urls
// expects an express app object passed in
TallTail.urls.configure = function(app) {
    app.get('/', routes.redirect);
    app.get('/tail', routes.index);
    app.get('/tail/f/:fileid', routes.tailer);
    app.get('/tail/download/:fileid', routes.download);
};

// socket.io -- for sending the file lines to the clients in real time
// listens at /tail/data and passes in the fileid for the file it wants
// to stream
TallTail.urls.listen = function(server) {

    var sio = io.listen(server);

    sio.of('/tail/data').on('connection', function(socket) {
        console.log('a connection was made!');
        socket.on('tail', function(fileid) {
            console.log('setting up tailer for file ' + fileid);
            //var filedef = TallTail.files[fileid];
            var filedef = TallTail.config.getFileDef(fileid);

            if (filedef == null) {
                console.log('file id "' + fileid + '" not found!');
                return; // todo: should send back an error or some shit
            }

            console.log('Tailing file at path ' + filedef.path);
            fs.stat(filedef.path, function(err, stats) {
                if (err) {
                    //throw err;
                    console.log('Error tailing file: fildef.path ' + err);
                    return;
                }

                var start = 0;
                // Only get the last <buffersize> lines if it is a large file
                console.log('Stats size: ' + stats.size);
                console.log(' Buffer: ' + TallTail.config.getBufferSize());

                if (stats.size > TallTail.config.getBufferSize()) {
                    start = stats.size - TallTail.config.getBufferSize();
                }

                console.log('@@@@ Start: ' + start + ' to ' + stats.size);
                var stream = fs.createReadStream(filedef.path, {
                    start : start,
                    end : stats.size
                });
                stream.addListener("data", function(lines) {
                    lines = lines.toString('utf-8');
                    // lines = lines.slice(lines.indexOf("\n")+1).split("\n");
                    // lines = lines.split("\n");
                    socket.emit('data', {
                        lines : lines
                    });
                });
            });
            fs.watchFile(filedef.path, function(curr, prev) {
                if (prev.size > curr.size) {
                    return {
                        clear : true
                    };
                }
                var stream = fs.createReadStream(filedef.path, {
                    start : prev.size,
                    end : curr.size
                });
                stream.addListener("data", function(lines) {
                    //socket.broadcast({ tail : lines.toString('utf-8').split("\n") 
                    socket.emit('data', {
                        //lines: lines.toString('utf-8').split('\n')
                        lines : lines.toString('utf-8')
                    });
                });
            });
        });
    });
};

