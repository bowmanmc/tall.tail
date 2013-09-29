
Tailer = function() {
	this.divId = 'tail';
	this.divSelector = '#' + this.divId;
	this.selectedText = '';

	this.highlighter = new Highlighter();

	//this.filters = [new RegExp('shuttle')];
	this.filters = [];
    this.forceScroll = true;

	this.setHeight();

	var tailer = this;
	$(window).resize(function() {
		tailer.setHeight();
	});

	// Filter UI Events
	$('#new-filter-btn').hover(function() {
	    tailer.selectedText = tailer.getSelection();
	});
	$('#new-filter-btn').click(function() {
        tailer.promptNewFilter();
    });
};

Tailer.prototype.promptNewFilter = function() {
    console.log('new filter...');
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
        this.handleLine(line);
    }
    if (shouldScroll) {
        this.scroll();
    }
};

Tailer.prototype.handleLine = function(line) {
    var cls = "line";

    // filters
    if (this.shouldFilterOut(line)) {
        this.incrementHiddenCount(1);
        cls += " hidden";
    }

    var div = '<div class="' + cls + '">' + line + '</div>';
    var el = $(div).appendTo(this.divSelector);
    var color = this.highlighter.getHighlightColor(line);
    if (color !== null) {
        el.css('color', color);
    }
    
    this.incrementLineCount(1);
};

Tailer.prototype.shouldFilterOut = function(line) {
    var len = this.filters.length;
    if (len === 0) {
        return false;
    }
    var filter, i;
    for (i = 0; i < len; i++) {
        filter = this.filters[i];
        if (line.match(filter)) {
            return false;
        }
    }
    return true;
};

Tailer.prototype.incrementHiddenCount = function(inc) {
    var current = parseInt($('#hiddencount').html());
    $('#hiddencount').html((current + inc));
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
    elem.animate({
        scrollTop: height
    }, 500);
};


