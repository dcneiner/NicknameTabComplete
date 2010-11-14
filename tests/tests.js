var ntc = $.fn.nicknameTabComplete,
    names = ["douglasn", "benjamin", "LynnRegis", "douglas_neiner", "GEORGE", "daniel", "danny", "DAnger", "0_doug", "l33t"],
    sample = "This is some sample text that includes an @doug symbol with a space.\n\nAnd an @lywithout a space.\n And finally, another @geo for testing.",
    completed_1 = "This is some sample text that includes an @douglas symbol with a space.\n\nAnd an @lywithout a space.\n And finally, another @geo for testing.",
    completed_2 = "This is some sample text that includes an @doug symbol with a space.\n\nAnd an @LynnRegis without a space.\n And finally, another @geo for testing.",
    completed_3 = "This is some sample text that includes an @doug symbol with a space.\n\nAnd an @lywithout a space.\n And finally, another @GEORGE for testing.",
    dont_add_space = "This is some sample text that includes an @doug",
    dont_add_space_completed = "This is some sample text that includes an @douglas",
    return_test = "This count\r\nbegins\r\nto @lyn",
    return_test_completed = "This count\nbegins\nto @LynnRegis ",
    end_of_text = "Sample @ly",
    end_of_text_completed = "Sample @LynnRegis ",
    no_letters = "@",
    new_line_bug = $.fn.nicknameTabComplete.has_newline_bug;

function create_textarea(options) {
  this.$textarea = $("<textarea></textarea>").appendTo("#qunit-fixture");
  this.textarea = this.$textarea[0];
  this.$textarea.val(sample);
  this.$textarea.nicknameTabComplete($.extend({nicknames: names}, options));
}

function trigger_tab() {
  var tab = jQuery.Event("keydown");
  tab.which = 9;
  this.$textarea.trigger(tab);
}

function matchValue(string) {
  return ntc.matchName(string, names).value;
}

function matches(string) {
  return ntc.matchName(string, names).matches;  
}

// test("splitting", function (){
//   equal("\n\nhi\n".split("\n").length, 4);
// });

module("Selection tests", { setup: create_textarea });

test("Setting then retrieving the caret position should be accurate", function () {
  ntc.setCaretToPos(this.textarea, 80);
  var values = ntc.getSelection(this.textarea), expected = (new_line_bug ? 82 : 80);
  
  expect(5);
  
  
  equal(values.length, 0, "Length should be 0");
  equal(values.start, expected, "Start should be at index 80");
  equal(values.end, expected, "End should be at index 80");
  
  equal(this.$textarea.val().substr(0, 80), sample.substr(0,80), "First half of string should match sample string.");
  
  this.$textarea.val(return_test);
  
  ntc.setCaretToPos(this.textarea, 27);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), return_test_completed, "Completion should be accurate.");
});

module("Nickname completion");

test("When presented with enough characters for only one match, it should fully complete the name.", function () {
  equal(matchValue("ly"), "LynnRegis", "Should return full name");
});

test("Even if case does not match, it should return the correctly cased completed nickname.", function () {  
  expect(3);
  strictEqual(matchValue("lYN"), "LynnRegis", "Case should be correct.");
  strictEqual(matchValue("DOUGLas_"), "douglas_neiner", "Case should be all lowercase.");
  strictEqual(matchValue("g"), "GEORGE", "Case should be all uppercase.");
});

test("If two or more nicknames could match, returned value should included all letters up to the first different letter in the responses.", function () {
  expect(2);
  equal(matchValue("da"), "dan", "Should complete up to first unique letter.");
  equal(matchValue("dou"),"douglas", "Should complete up to the first unique letter.");
});

test("If two or more nicknames could match, all matches should be returned from the matchName function", function () {
  var _matches = matches("da");
  expect(2);
  equal(_matches.length, 3, "Three results should have been returned.");
  strictEqual(_matches[2], "DAnger", "Results should contain original case.");
});

test("If no letters are present after the symbol, it should return all names", function () {
  var _matches = matches("");
  expect(1);
  equal(_matches.length, names.length, "All names should have been returned");
});

test("Should match nicknames containing numbers", function () {
  equal(matchValue("0"), "0_doug", "Should match a name starting with a number");
  equal(matchValue("l3"), "l33t", "Should match a name containing a number");
});


module("Integration into textarea", {setup: create_textarea});

test("If caret is preceeded by only a-z, -, or _ and then a @, it should attempt to complete the name", function (){
  expect(2);
  
  ntc.setCaretToPos(this.textarea, 47);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), completed_1, "Should have completed douglas");
  
  this.$textarea.val(sample);
  
  ntc.setCaretToPos(this.textarea, 123);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), completed_3, "Should have completed GEORGE");
});

test("Unless a space already exists immediately following the caret position, one should be added, but only in the case of a complete match.", function () {
  ntc.setCaretToPos(this.textarea, 80);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), completed_2, "Should have completed LynnRegis and added a space.");
  
  this.$textarea.val(sample);
  ntc.setCaretToPos(this.textarea, 123);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), completed_3, "Should not put a space after GEORGE");
  
  this.$textarea.val(end_of_text);
  ntc.setCaretToPos(this.textarea, 10);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), end_of_text_completed, "Should add space at end of text string");
  
  this.$textarea.val(dont_add_space);
  ntc.setCaretToPos(this.textarea, 47);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), dont_add_space_completed, "Should not add a space if there are more than one possible results.");
});

module("Custom events", { setup: create_textarea });

test("When a match is triggered, it should fire a nickname-complete event and pass along the current value of the text as well as the matches.", function () {
  stop();
  expect(2);
  this.$textarea.bind("nickname-complete", function (e) {
    equals(e.value, "douglas", "Should match douglas");
    equals(2, e.matches.length, "Should return two matches");
    start();
  });
  
  ntc.setCaretToPos(this.textarea, 47);
  trigger_tab.call(this);
});

test("The event should be able to be bound during setup of the plugin", function () {
  stop();
  expect(3);
  this.$textarea.remove();
  create_textarea.call(this, { on_complete: function (e) {
    ok(true, "Event was properly called.");
    equals(e.value, "douglas", "Should match douglas");
    equals(2, e.matches.length, "Should return two matches");
    start();
  } });
  
  ntc.setCaretToPos(this.textarea, 47);
  trigger_tab.call(this);
});

test("If `preventDefault()` or `return false` is called on this custom event, then the match should not be made", function () {
  expect(2);
  
  this.$textarea.bind("nickname-complete", function (e) {
    e.preventDefault();
  });
  
  ntc.setCaretToPos(this.textarea, 80);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), sample, "Should still contain the original text.");
  
  this.$textarea.unbind("nickname-complete");
  
  this.$textarea.bind("nickname-complete", function () {
    return false;
  });
  
  ntc.setCaretToPos(this.textarea, 80);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), sample, "Should still contain the original text.");
});

test("Event should provide accurate placement of the caret", function () {
  expect(1);
  
  this.$textarea.bind("nickname-complete", function (e) {
    equals(e.caret, 80, "caret position should current position.");
    start();
  });
  
  stop();
  ntc.setCaretToPos(this.textarea, 80);
  trigger_tab.call(this);
});