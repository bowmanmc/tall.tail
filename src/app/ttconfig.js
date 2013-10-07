
var config = require('../config.js')
  , fs = require('fs')
;


if (typeof TallTail === 'undefined') {
    TallTail = {};
}
if (typeof TallTail.config === 'undefined') {
    TallTail.config = {};
}


// Watch the config.js file and reload it into our config var whenever it
// changes. This will update the files array we use in our routing below
fs.watch('./config.js', function(event, filename) {
    //console.log('reloading config file on event: ' + event);
    delete require.cache[require.resolve('../config.js')];
    config = require('../config.js');
});


TallTail.config.getBufferSize = function() {
    return config.buffersize;
};

TallTail.config.getFiles = function() {
    return config.files;
};

//utility methods used in routing
TallTail.config.getFileId = function(filepath) {
    var id = filepath.replace(/^.*[\\\/]/, '');
    return id;
};

TallTail.config.getFileIds = function() {
    var filepaths = TallTail.config.getFiles();
    var len = filepaths.length;
    var i, path;
    var ids = [];
    for (i = 0; i < len; i++) {
        path = filepaths[i];
        ids.push(TallTail.config.getFileId(path));
    }
    return ids;
};

TallTail.config.getFileDef = function(fileid) {
    var filepaths = TallTail.config.getFiles();
    var len = filepaths.length;
    var i, path, id;
    for (i = 0; i < len; i++) {
        path = filepaths[i];
        id = TallTail.config.getFileId(path);
        if (id == fileid) {
            return {
                id: id,
                path: path
            };
        }
    }
    return null;
};
