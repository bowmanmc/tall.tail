
Highlighter = function(fileIdIn) {

    this.fileId = fileIdIn;
    
    this.highlighters = this.loadHighlighters();

    // Highlighter UI Events
    this.buildMenu();
    var h = this;
    $('#highlighter-form').modal('hide');
    $('#in-color').colorpicker();
    $('#new-highlight-btn').hover(function() {
        // save any selected text here, because when
        // a click happens, the selection is already
        // gone.
        h.selectedText = h.getSelection();
    });
    $('#new-highlight-btn').click(function() {
        h.promptNewHighlighter();
    });
    $('#highlight-save-btn').click(function() {
        h.saveHighlighter();
    });
};

Highlighter.prototype.loadHighlighters = function() {
    var c = $.cookie('tt.highlighters.' + this.fileId);
    if (typeof c === 'undefined' || c == null){
        return [];
    }
    return JSON.parse(c);
};

Highlighter.prototype.saveState = function() {
    $.cookie('tt.highlighters.' + this.fileId, 
             JSON.stringify(this.highlighters));
};

//http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text
Highlighter.prototype.getSelection = function() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};

Highlighter.prototype.promptNewHighlighter = function() {
    $('#in-regexp').val(this.selectedText);
    $('#highlighter-form').modal('show');
};

Highlighter.prototype.saveHighlighter = function() {
    var regexp = $('#in-regexp').val();
    var color = $('#in-color').val();
    this.highlighters.push({
        're': regexp,
        'color': color
    });
    $('#highlighter-form').modal('hide');

    // update the menu
    this.buildMenu();

    // store the new state
    this.saveState();

    // reload the colors for everything
    $(document).trigger('update');
};

Highlighter.prototype.redraw = function() {
    var highlighter = this;
    // go through the lines and update them if needed...
    $('.line').each(function() {
        var html = $(this).html();
        var color = highlighter.getHighlightColor(html);
        if (color !== null) {
            $(this).css('color', color);
        }
        else {
            $(this).css('color', 'inherit');
        }
    });  
};

Highlighter.prototype.buildMenu = function() {
    $('.highlighter-entry').remove();
    var highlighter = this;
    var len = this.highlighters.length;
    var item, i;
    for (i = 0; i < len; i++) {
        item = this.highlighters[i];
        var li = $('<li class="menu-entry highlighter-entry" />');
        li.append('<a><span class="glyphicon glyphicon-remove"></span> ' + 
                  item.re + '</a>');
        li.click([item], function(event) {
            highlighter.removeHighlighter(event.data[0]);
        });
        $('#highlighters-menu').prepend(li);
    }
};

Highlighter.prototype.removeHighlighter = function(h) {
    var index = this.highlighters.indexOf(h);
    if (index > -1) {
        this.highlighters.splice(index, 1);
        this.buildMenu();
        this.saveState();
        $(document).trigger('update');
    }
};

Highlighter.prototype.getHighlightColor = function(line) {
    var len = this.highlighters.length;
    if (len === 0) {
        return null;
    }
    var highlighter, i;
    for (i = 0; i < len; i++) {
        highlighter = this.highlighters[i];
        if (line.match(highlighter.re)) {
            return highlighter.color;
        }
    }
    return null;
};
