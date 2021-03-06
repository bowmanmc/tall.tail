
Tailer = function(fileIdIn) {
    this.MAX_SIZE = 10000;
	this.divId = 'tail';
	this.divSelector = '#' + this.divId;
	this.fileId = fileIdIn;
	this.selectedText = '';

	var tailer = this;

	this.highlighter = new Highlighter(this.fileId);
	this.filter = new Filter(this.fileId);
	// catch highlighter/filter events off the document
	$(document).on('update', function() {
	    tailer.redraw();
	});

    this.forceScroll = true;
	this.setHeight();

	
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

Tailer.prototype.tail = function() {
	var tailer = this;
	var socket = io.connect('/tail/data');
	socket.emit('tail', tailer.fileId);
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
    this.tidyUp();
};

Tailer.prototype.handleLine = function(line) {
    var cls = "line";

    // filters
    if (this.filter.shouldFilterOut(line)) {
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

Tailer.prototype.redraw = function() {
    var tailer = this;
    var total = 0;
    var hidden = 0;
    $('#linecount').html(total);
    $('#hiddencount').html(hidden);
    $('.line').each(function() {
        var html = $(this).html();
        total++;
        if (tailer.filter.shouldFilterOut(html)) {
            $(this).hide();
            hidden++;
        }
        else {
            $(this).removeClass('hidden');
            $(this).show();
        }

        var color = tailer.highlighter.getHighlightColor(html);
        if (color !== null) {
            $(this).css('color', color);
        }
        else {
            $(this).css('color', 'inherit');
        }
    });
    $('#linecount').html(total);
    $('#hiddencount').html(hidden);
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
        this.forceScroll = false;
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

Tailer.prototype.tidyUp = function() {
    // if we have more than MAX_SIZE, remove AXE_SIZE of them... trying to 
    // get a number
    // large enough that most people won't notice, but small enough that we
    // don't kill our browser's memory
    var tailer = this;
    var beforeLen = $(".line").length;
    if (beforeLen >= tailer.MAX_SIZE) {
        var AXE_SIZE = tailer.MAX_SIZE / 2;
        $(".line").slice(0, AXE_SIZE).each(function() {
            $(this).remove();
        });
        tailer.redraw();
    }
    var afterLen = $(".line").length;
    //console.log("Length: " + beforeLen + "/" + afterLen + " [before/after tidying up]");
}; 
