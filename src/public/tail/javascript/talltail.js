
tall = {};
tall.tail = {};

/**
 * tall.tail.FileListing
 */
tall.tail.FileListing = function(divId) {
    this.divId = divId;
    this.divSelector = "#" + divId;
};

tall.tail.FileListing.prototype.refresh = function() {
    var listing = this;
    var url = '/talltail/getLogs.action';
    $.ajax({
        type: 'GET',
        url: url,
        processData: true,
        dataType: "json",
        success: function(json) {
            var entries = json.logFiles;
            $.each(entries, function(index, file) {
                var idSelector = "#logFileTemplate";
                if (file.errors) {
                    idSelector = "#logFileTemplateError";
                }
                $(idSelector).tmpl(file).appendTo(listing.divSelector);
            });
        },
        error: function(x,y,z) {
            console.log(x.responseText);
        }
    });
};

/**
 * tall.tail.InfoUpdater
 */
tall.tail.InfoUpdater = function(divId) {
    this.divId = divId;
    this.divSelector = "#" + divId;
};

/**
 * tall.tailer
 */
tall.tailer = function(divId) {
    // Make sure we get an id
    this.divId = divId;
    this.divSelector = '#' + divId;
    this.setHeight();
    this.mode = "play";
    this.checkInterval = 2.5 * 1000; // 1 second
    //this.checkInterval = 500; // 0.5 seconds
    this.rowcls = 'even';

    // setup the scroller vars
    this.bottomThreshold = 20;
    this._lastScrollPosition = 100000000;

    // Setup window resize events
    var tailerRef = this;
    $(window).resize(function() {
        tailerRef.setHeight();
    });
    
    $("#pause").click(function() {
        tailerRef.mode = "pause";
    });
    $("#play").click(function() {
        tailerRef.mode = "play";
        tailerRef.scrollToBottom();
    });
};

/**
 * Gets the top offset of the tailer and makes sure there is that much
 * at the bottom as well. Helps it look balanced on the page.
 */
tall.tailer.prototype.setHeight = function() {
    var tailerPosition = $(this.divSelector).position();
    //console.log(tailerPosition.left + 'x' + tailerPosition.top);
    var docHeight = $(document).height();
    var tailerHeight = docHeight - (2 * tailerPosition.top);
    //console.log('setting height to ' + tailerHeight);
    $(this.divSelector).height(tailerHeight);
};

tall.tailer.prototype.getRowStyle = function(lineText) {
    var re = /fire/i;
    if (typeof lineText === 'string' && lineText.match(re)) {
        return 'background: rgba(255, 32, 32, 0.25)';
    }
    return '';
};

tall.tailer.prototype.getRowClass = function() {
    // Update the rowclass
    if (this.rowcls === 'even') {
        this.rowcls = 'odd';
    }
    else {
        this.rowcls = 'even';
    }
    
    return this.rowcls;
};

tall.tailer.prototype.tidyUp = function() {
    var beforeLen = $(".line").length;
    // if we have more than MAX_SIZE, remove AXE_SIZE of them... trying to 
    // get a number
    // large enough that most people won't notice, but small enough that we
    // don't kill our browser's memory
    var MAX_SIZE = 5000;//10000;
    var AXE_SIZE = 2500;
    if (beforeLen >= MAX_SIZE) {
        var lines = $(".line").slice(0, AXE_SIZE);    
        $.each(lines, function(idx, item) {
            $(item).remove();
        });
    }
    var afterLen = $(".line").length;
    console.log("Length: " + beforeLen + "/" + afterLen + " [before/after tidying up]");
};

tall.tailer.prototype.tail = function() {
    console.log("now tailing...")
    //var scrollDiv = document.getElementById(this.divId);
    //this._lastScrollPosition = scrollDiv.scrollTop
    var tailerRef = this;
    this.update(tailerRef);
    window.setInterval(this.update, tailerRef.checkInterval, tailerRef);
};

tall.tailer.prototype.update = function(tailer) {
    var url = '/talltail/getLines.action';
    $.ajax({
        type: 'GET',
        url: url,
        processData: true,
        data: {
            fileId: 'access.log',
            lastIndex: tailer.lastIndex
        },
        dataType: "json",
        success: function(json) {
            var entries = json.entries;
            $.each(entries, function(key, value) {
                var rowclass = tailer.getRowClass();
                var style = tailer.getRowStyle(value);
                var txt = {
                    'index': key,
                    'line': value,
                    'rowcls': rowclass,
                    'style': style
                };
                $("#logLineTemplate").tmpl(txt).appendTo(tailer.divSelector);
                tailer.scroll();
                tailer.lastIndex = key;
            });
            tailer.tidyUp();
        },
        error: function(x,y,z) {
            console.log(x.responseText);
        }
    });
    
    //$("#logLineTemplate").tmpl(txt).appendTo(tailer.divSelector);
    //tailer.scroll();
};

/*
 * Most of the code from this method was snagged from
 *     http://radio.javaranch.com/pascarello/2006/08/17/1155837038219.html
 * and then reworked to fit our style.
 */
tall.tailer.prototype.scrollToBottom = function() {
    var scrollDiv = document.getElementById(this.divId);
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
};

tall.tailer.prototype.scroll = function() {
    var _ref = this;
    var scrollDiv = document.getElementById(this.divId);
    var currentHeight = 0;
    
    var _getElementHeight = function(){
      var intHt = 0;
      if(scrollDiv.style.pixelHeight)intHt = scrollDiv.style.pixelHeight;
      else intHt = scrollDiv.offsetHeight;
      return parseInt(intHt);
    }

    var _hasUserScrolled = function(){
      //console.log('_lastScrollPosition: ' + _ref._lastScrollPosition);
      if(_ref._lastScrollPosition == scrollDiv.scrollTop || _ref._lastScrollPosition == null){
        return false;
      }
      return true;
    }

    var _scrollIfInZone = function(){
      if (!_hasUserScrolled() ||
          (currentHeight - scrollDiv.scrollTop - _getElementHeight() <= _ref.bottomThreshold)){
          
          if (_ref.mode != 'pause') {
              scrollDiv.scrollTop = currentHeight;
          }
          else {
              scrollDiv.scrollTop = _ref._lastScrollPosition;
          }
      }
    }

    if (scrollDiv.scrollHeight > 0)currentHeight = scrollDiv.scrollHeight;
    else if(scrollDiv.offsetHeight > 0)currentHeight = scrollDiv.offsetHeight;

    _scrollIfInZone();
    _ref._lastScrollPosition = scrollDiv.scrollTop;
    
    _ref = null;
    scrollDiv = null;
};

