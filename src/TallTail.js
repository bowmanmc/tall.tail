/**
 * TallTail.js
 * 
 */
if (typeof TallTail === 'undefined') {
   TallTail = {};
   TallTail.fileids = [];
   TallTail.files = {};
}

//TallTail.bufferSize = 5000;
TallTail.bufferSize = 10;

TallTail.tailFile = function(filedef) {
    console.log('Tailing file ' + filedef.id);
    TallTail.files[filedef.id] = filedef;
    TallTail.fileids.push(filedef.id);
};
