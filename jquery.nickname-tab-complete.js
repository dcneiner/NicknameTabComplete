/*! 
 * Nickname Tab Complete
 * 
 * Copyright (c) Doug Neiner, 2010
 * Dual licenses under MIT or GPL
 *
 */

(function ($) {
    
  /*!
   * This function adapted from: https://github.com/localhost/jquery-fieldselection
   * jQuery plugin: fieldSelection - v0.1.1 - last change: 2006-12-16
   * (c) 2006 Alex Brem <alex@0xab.cd> - http://blog.0xab.cd
   */
  function getSelection(field) {

    var e = field;

    return (

      /* mozilla / dom 3.0 */
      ('selectionStart' in e && function() {
        var l = e.selectionEnd - e.selectionStart;
        return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
      }) ||

      /* exploder */
      (document.selection && function() {

        e.focus();

        var r = document.selection.createRange();
        if (r === null) {
          return { start: 0, end: e.value.length, length: 0 };
        };

        var re = e.createTextRange();
        var rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
      }) ||

      /* browser not supported */
      function() { return null; }

    )();

  };

  /*!
    These two functions were taken directly from an answer 
    by CMS (http://stackoverflow.com/users/5445/cms) on Stack Overflow:
    http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
  */
  function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  }

  function setCaretToPos(input, pos) {
    // Fix for difference between normalized val() and value
    if ($.fn.nicknameTabComplete.has_newline_bug) {
      var adjustment = $(input).val().substr(0, pos).split(/\n/m).length - 1;
      pos = pos + adjustment;
    }
    setSelectionRange(input, pos, pos);
  }
  /* End functions from CMS */

  /* The rest of this code is my code */
  function matchName(input, nicknames){
      var match = input.toLowerCase(),
          matches = [], 
          length = input.length, 
          letters = "", 
          letter,
          i = 0;

      $.each(nicknames, function (index, value) {
          if(value.toLowerCase().substr(0,length) === match) {
              matches.push(value);
          }
      });

      if(matches.length === 1){
          return { value: matches[0], matches: matches };
      } else if (matches.length > 1) {
          for (; i < matches[0].length - length; i = i + 1) {
              letter = matches[0].toLowerCase().substr(length + i, 1);

              $.each(matches, function (index, value) {
                  if (value.toLowerCase().substr(length + i, 1) !== letter) {
                     letter = "";
                     return false;
                  } 
              });
              if (letter) {
                  letters += letter;
              } else {
                  break;
              }
          }
          return { value: input + letters, matches: matches };
      }
      return { value: "", matches: matches };
  }

  function onKeyPress(e, options) {
      if (e.which === 9) {
        var $this = $(this),
            val = $this.val(),
            sel = getSelection(this),
            text = "",
            match = "", 
            first, 
            last,
            completed_event;

        if (!sel.length && sel.start) {
            if($.fn.nicknameTabComplete.has_newline_bug) {
              // Carriage return fix
              text = this.value.substr(0, sel.start);
              sel.start = sel.start - (text.split(/\r/).length - 1); 
            }
            
            text = val.substr(0, sel.start);
            if (options.nick_match.test(text)) {
               text = text.match(options.nick_match)[1];
               match = matchName(text, options.nicknames);
               
               completed_event = $.Event("nickname-complete");
               $.extend(completed_event, match);
               completed_event.caret = sel.start;
               $this.trigger(completed_event);
               
               if(match.value && !completed_event.isDefaultPrevented()){
                 first = val.substr(0, sel.start - text.length );
                 last  = val.substr(sel.start);
                 /* Space should not be added when there is only 1 match
                    or if there is already a space following the caret position */
                 space = (match.matches.length > 1 || last.length && last[0] == " ") ? "" : " ";
                 $this.val(first + match.value + space + last);
                 setCaretToPos(this, sel.start - text.length + match.value.length + space.length);
               }
               
               e.preventDefault();
               
               // Part of a crazy hack for Opera
               this.lastKey = 9;
            }
        }
      }
  };

  
  $.fn.nicknameTabComplete = function (options) {
    options = $.extend({}, $.fn.nicknameTabComplete.defaults, options);
    this.bind('keydown.nickname', function (e) {
      onKeyPress.call(this, e, options);
    }).bind('focus.nickname', function () {
      // Part of a crazy hack for Opera
      this.lastKey = 0;
    }).bind('blur.nickname', function () {
      // Part of a crazy hack for Opera
      if (this.lastKey === 9) {
        this.focus();
      }
    });
    
    if (options.on_complete !== null) {
      this.bind('nickname-complete', options.on_complete);
    }
    return this;
  };
  
  $.fn.nicknameTabComplete.defaults = {
    nicknames: [],
    nick_match: /@([-_a-z0-9]*)$/i,
    on_complete: null // Pass in a function as an alternate way of binding to this event
  };
  
  $.fn.nicknameTabComplete.has_newline_bug = (function () {
    var textarea = $("<textarea>").val("Newline\nTest");
    return textarea[0].value === "Newline\r\nTest";
  }());
  
  // These are exposed for testing
  // do not try to use as the API can
  // change at any time
  if (typeof window.QUnit !== "undefined") {
    $.extend($.fn.nicknameTabComplete, {
      getSelection: getSelection,
      setSelectionRange: setSelectionRange,
      setCaretToPos: setCaretToPos,
      matchName: matchName
    });
  }
  
}(jQuery));