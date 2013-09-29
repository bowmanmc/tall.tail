
Filter = function(fileIdIn) {

    this.fileId = fileIdIn;
    this.filters = this.loadFilters();

    // Filter UI Events
    this.buildMenu();
    var f = this;
    $('#filter-form').modal('hide');
    $('#new-filter-btn').hover(function() {
        // save any selected text here, because when
        // a click happens, the selection is already
        // gone.
        f.selectedText = f.getSelection();
    });
    $('#new-filter-btn').click(function() {
        f.promptNewFilter();
    });
    $('#filter-save-btn').click(function() {
        f.saveFilter();
    });
};

Filter.prototype.loadFilters = function() {
    var c = $.cookie('tt.filters.' + this.fileId);
    if (typeof c === 'undefined' || c == null){
        return [];
    }
    return JSON.parse(c);
};

Filter.prototype.saveState = function() {
    $.cookie('tt.filters.' + this.fileId, 
             JSON.stringify(this.filters));
};

//http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text
Filter.prototype.getSelection = function() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};

Filter.prototype.promptNewFilter = function() {
    $('#filter-regexp').val(this.selectedText);
    $('#filter-form').modal('show');
};

Filter.prototype.saveFilter = function() {
    var regexp = $('#filter-regexp').val();
    this.filters.push({
        're': regexp
    });
    $('#filter-form').modal('hide');

    // update the menu
    this.buildMenu();

    // store the new state
    this.saveState();

    // reload the colors for everything
    $(document).trigger('update');
};

Filter.prototype.buildMenu = function() {
    $('.filter-entry').remove();
    var filter = this;
    var len = this.filters.length;
    var item, i;
    for (i = 0; i < len; i++) {
        item = this.filters[i];
        var li = $('<li class="menu-entry filter-entry" />');
        li.append('<a><span class="glyphicon glyphicon-remove"></span> ' + 
                  item.re + '</a>');
        li.click([item], function(event) {
            filter.removeFilter(event.data[0]);
        });
        $('#filters-menu').prepend(li);
    }
};

Filter.prototype.removeFilter = function(f) {
    var index = this.filters.indexOf(f);
    if (index > -1) {
        this.filters.splice(index, 1);
        this.buildMenu();
        this.saveState();
        $(document).trigger('update');
    }
};

Filter.prototype.shouldFilterOut = function(line) {
    var len = this.filters.length;
    if (len === 0) {
        return false;
    }
    var filter, i;
    for (i = 0; i < len; i++) {
        filter = this.filters[i];
        if (line.match(filter.re)) {
            return false;
        }
    }
    return true;
};