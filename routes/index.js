
/*
 * GET home page.
 */
exports.index = function(req, res) {
  res.render('index.ejs', { 
    files: TallTail.fileids
  });
};

exports.tailer = function(req, res) {
    var fileid = req.params.fileid;
    var file = TallTail.files[fileid];

    if (typeof file === 'undefined') {
        file = {};
        file.id = 'none';
        file.path = 'not found';
    }

    res.render('tailer.ejs', {
        file: file,
        files: TallTail.fileids
    });
};

exports.redirect = function(req, res) {
  res.render('redirect.ejs');
};

