var ntc = $.fn.nicknameTabComplete,
    names = ["douglasn", "benjamin", "LynnRegis", "douglas_neiner", "GEORGE", "daniel", "danny", "DAnger"],
    sample = "This is some sample text that includes an @doug symbol with a space.\n\nAnd an @lywithout a space.\n And finally, another @geo for testing.",
    completed_1 = "This is some sample text that includes an @douglas symbol with a space.\n\nAnd an @lywithout a space.\n And finally, another @geo for testing.",
    completed_2 = "This is some sample text that includes an @doug symbol with a space.\n\nAnd an @LynnRegis without a space.\n And finally, another @geo for testing.",
    completed_3 = "This is some sample text that includes an @doug symbol with a space.\n\nAnd an @lywithout a space.\n And finally, another @GEORGE for testing.",
    end_of_text = "Sample @ly",
    end_of_text_completed = "Sample @LynnRegis ",
    no_letters = "@";

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

module("Selection tests", {
  setup: function () {
    create_textarea.call(this);
  }
});

test("Setting then retrieving the carat position should be accurate", function () {
  ntc.setCaretToPos(this.textarea, 47);
  var values = ntc.getSelection(this.textarea);
  
  expect(4);
  
  equal(values.length, 0, "Length should be 0");
  equal(values.start, 47, "Start should be at index 43");
  equal(values.end, 47, "End should be at index 43");
  
  equal(this.$textarea.val().substr(0, 47), sample.substr(0,47), "First half of string should match sample string.");
});

module("Nickname completion");

test("When presented with enough characters for only one match, it should fully complete the name.", function () {
  equal(matchValue("ly"), "LynnRegis", "Should return full name");
})

test("Even if case does not match, it should return the correctly cased completed nickname.", function () {
  
  strictEqual(matchValue("lYN"), "LynnRegis", "Case should be correct.");
  strictEqual(matchValue("DOUGLas_"), "douglas_neiner", "Case should be all lowercase.")
  strictEqual(matchValue("g"), "GEORGE", "Case should be all uppercase.")
});

test("If two or more nicknames could match, returned value should included all letters up to the first different letter in the responses.", function () {
  equal(matchValue("da"), "dan", "Should complete up to first unique letter.");
  equal(matchValue("dou"),"douglas", "Should complete up to the first unique letter.")
})

test("If two or more nicknames could match, all matches should be returned from the matchName function", function () {
  var _matches = matches("da");
  equal(_matches.length, 3, "Three results should have been returned.");
  strictEqual(_matches[2], "DAnger", "Results should contain original case.");
});

test("If no letters are present after the symbol, it should return all names", function () {
  var _matches = matches("");
  equal(_matches.length, names.length, "All names should have been returned");
});


module("Integration into textarea", {setup: create_textarea});

test("If carat is preceeded by only a-z, -, or _ and then a @, it should attempt to complete the name", function (){
  ntc.setCaretToPos(this.textarea, 47);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), completed_1, "Should have completed douglas");
  
  this.$textarea.val(sample);
  
  ntc.setCaretToPos(this.textarea, 123);
  trigger_tab.call(this);
  strictEqual(this.$textarea.val(), completed_3, "Should have completed GEORGE");
})

test("Unless a space already exists immediately following the carat position, one should be added, but only in the case of a complete match.", function () {
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
});