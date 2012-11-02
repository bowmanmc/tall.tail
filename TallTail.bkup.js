/**
 * TallTail.js
 * 
 */
var fs = require('fs');

if (typeof TallTail === 'undefined') {
   TallTail = {};
   TallTail.files = [];
}

TallTail.bufferSize = 5000;

TallTail.tailFile = function(filedef) {
    console.log('Tailing file ' + filedef.id);
    TallTail.files.push(filedef);

    if (!fs.existsSync(filedef.path)) {
        console.log('ERROR: file path ' + filedef.path + 
                    '" does not exist!');
        return;
    }
    console.log('Setting up tailer for file [' + filedef.id + 
                '] at ' + filedef.path);

    // Does the initial load of data (reads back bufferSize of lines)
    fs.stat(filedef.path, function(err, stats) {
        if (err) throw err;
        var start = 0;
        if (stats.size > TallTail.bufferSize) {
            start = (stats.size - TallTail.bufferSize);
        }
        var stream = fs.createReadStream(filedef.path, {
            start: start, 
            end: stats.size
        });

        stream.addListener("data", function(lines) {
            lines = lines.toString('utf-8');
            lines = lines.split(/\n/);
            TallTail.addLines(filedef.id, lines);
        });
    });

    // now tail it
    fs.watchFile(filedef.path, {
        persistent: true,
        interval: 1500
    }, function(curr, prev) {
        if(prev.size > curr.size) return {
            clear: true
        };
        var stream = fs.createReadStream(filedef.path, { 
            start: prev.size, 
            end: curr.size
        });
        stream.addListener("data", function(lines) {
            lines = lines.toString('utf-8');
            lines = lines.split(/\n/);
            TallTail.addLines(filedef.id, lines);
        });
    });
};

TallTail.addLines = function(bufferId, lines) {
    lines.forEach(function(line, i, arr) {
        if (line != '') {
            console.log(bufferId + ': ' + line);
            buffer = TallTail.getBuffer(bufferId);
            buffer.push(line);
        }
    });
};

TallTail.getBuffer = function(fileid) {
    return TallTail.buffers[fileId];
};
