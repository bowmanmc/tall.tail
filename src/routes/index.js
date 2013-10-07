
var config = require('../config')
  , fs = require('fs')
;

require('../app/ttconfig.js');

// /tail
exports.index = function(req, res) {
  res.render('index.ejs', { 
    files: TallTail.config.getFileIds()
  });
};

// /tail/f/fileid
exports.tailer = function(req, res) {
    var fileid = req.params.fileid;
    var file = TallTail.config.getFileDef(fileid);

    if (file == null) {
        file = {};
        file.id = 'none';
        file.path = 'not found';
    }

    res.render('tailer.ejs', {
        file: file,
        files: TallTail.config.getFileIds()
    });
};

// /tail/download/fileid
exports.download = function(req, res) {
    var fileid = req.params.fileid;
    var file = TallTail.config.getFileDef(fileid);

    res.setHeader("content-type", "text/plain");
    fs.createReadStream(file.path).pipe(res);
};

// '/'
exports.redirect = function(req, res) {
  res.render('redirect.ejs');
};

