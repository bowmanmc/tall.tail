
Tailer = function() {
	this.divId = 'tail';
	this.divSelector = '#' + this.divId;
	this.setHeight();

	this.forceScroll = true;

	var tailer = this;
	$(window).resize(function() {
		tailer.setHeight();
	});
};

Tailer.prototype.setHeight = function() {
	var docHeight = $(document).height();
	var navHeight = $('#navbar').height();
	var tailerHeight = docHeight - navHeight;

	$(this.divSelector).height(tailerHeight);
};

Tailer.prototype.tail = function(fileId) {
	var tailer = this;
	var socket = io.connect('/tail/data');
	socket.emit('tail', fileId);
	socket.on('data', function(data) {
	    tailer.handleLines(data.lines);
	});
};

Tailer.prototype.handleLines = function(linesIn) {
    var lines = linesIn.split("\n");
    var len = lines.length;
    var line, i;
    var shouldScroll = this.shouldScroll();
    for (i = 0; i < len; i++) {
        line = lines[i];
        $(this.divSelector).append('<div class="line">' + line + '</div>');
    }
    if (shouldScroll) {
        this.scroll();
    }
    this.incrementLineCount(len);
};

Tailer.prototype.incrementLineCount = function(inc) {
    var current = parseInt($('#linecount').html());
    $('#linecount').html((current + inc));
};

Tailer.prototype.shouldScroll = function() {
    if (this.forceScroll) {
        this.forceScorll = false;
        return true;
    }

    var result = false;
    var elem = $(this.divSelector);
    var divHeight = elem.height();
    var scrollHeight = elem.get(0).scrollHeight;
    var top = elem.get(0).scrollTop;
    if (top == (scrollHeight - divHeight)) {
        // the user hasn't scrolled the contents
        result = true;
    }
    return result;
};

Tailer.prototype.scroll = function() {
    var elem = $(this.divSelector)
    var height = elem.get(0).scrollHeight;
    console.log('ScrollTop: ' + height);
    elem.animate({
        scrollTop: height
    }, 500);
};


