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
          return matches[0];
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
          return input + letters;
      }
      return "";
  }

  function onKeyPress(e, options) {
      if (e.which === 9) {
        var $this = $(this),
            val = $this.val(),
            sel = getSelection(this),
            text = "",
            match = "", 
            first, 
            last;

        if (!sel.length && sel.start) {
            text = val.substr(0, sel.start);
            if (options.nick_match.test(text)) {
               text = text.match(options.nick_match)[1];
               match = matchName(text, options.nicknames);
               if(match){
                 first = val.slice(0, sel.start - text.length );
                 last  = val.slice(sel.start);
                 $this.val(first + match + last);
                 setCaretToPos(this, sel.start - text.length + match.length);
               }
               e.preventDefault();
            }
        }
      }
  };

  
  $.fn.nicknameTabComplete = function (options) {
    options = $.extend({}, $.fn.nicknameTabComplete.defaults, options);
    return this.bind('keydown', function (e) {
      onKeyPress(e, options);
    });
  };
  
  $.fn.nicknameTabComplete.defaults = {
    nicknames: [],
    nick_match: /@([-_a-z]*)$/i
  };
  
}(jQuery));