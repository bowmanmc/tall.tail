// 2012-10-22 - put on hold... try to do the socket.io thing
TallTail.Tailer = function(idIn, bufferSizeIn) {
    this.id = idIn;
    this.bufferSize = bufferSizeIn;
    this.lines = [];
    this.idx = 0;
};

TallTail.Tailer.prototype.addLines = function(linesIn) {
    linesIn.forEach(function(line, i, arr) {
        this.lines.push({
            'idx': this.idx,
            'line': line
        });
        this.idx++;
    });

    if (this.lines.length > this.bufferSize) {
        console.log('Buffer size was ' + this.lines.length);
        this.lines = this.lines.slice(this.bufferSize * -1);
        console.log('    now it is ' + this.lines.length);
    }
};

TallTail.Tailer.prototype.getLinesSince = function(idx) {
    if (typeof idx === 'undefined' || idx > this.lines.length) {
        return lines.slice(this.bufferSize * -1);
    }

    var results = [];
    var start = this.lenes.length - 1;
    var end = start - this.bufferSize;
    var i;
    for (i = start; i >= end; i--) {
        var line = this.lines[i];
        if (line.idx > idx) {
            results.push(line)
        }
    }
};
