# Nickname Tab Complete

This plugin detects when a tab key is pressed after an @ symbol and some characters have been typed. You supply the names via a setting.

I used code from all over, so I may need to play with the license, though all borrowed code is open source under some license and attributed.

## Example usage

    jQuery(document).ready(function ($) {
       $("textarea").nicknameTabComplete({
           nicknames: ["Doug", "PixelGun", "hax0r"]
       }); 
    });

## Options

* **nickmane_match**: This is the regular expression used to match the names. Be very careful when changing this as *most changes will break this plugin*. I recommend only changing the accepted characters between the brackets.
* **nicknames**: This should be an array of acceptable nicknames. They can contain mixed case.
* **on_complete**: This is an optional way to bind to the `nickname-complete` custom event.

## Custom Events

This plugin will trigger a `nickname-complete` custom event whenever a matching attempt is made. It is possible to cancel the completion by calling `preventDefault()` on the event, or returning `false` from your handler. In addition to the normal values on the event object, three additional properties are added:

* **value**: This is the current state of the completion. It will contain everything between the `@` and the end of the know letters of the nickname. If no match is found, this will be empty. If a partial match is found, this will contain that value.
* **matches**: This is an array of the availible matches for the current event. If no matches were found, this will be an empty array. If a match was completed, this will contain only one value. If an attempted match matched multiple results, they will all be listed here.
* **caret**: Position of the caret at the time the match was attempted. Does not reflect the new position after match.

**Example:**

    $("textarea").bind("nickname-complete", function (e) {
       if (e.matches.length === 1) {
           console.log("A full match was found: " + e.value);
       } else if (e.matches.length > 1) {
           console.log("Multiple matches were found, and this much is shared among the results: " + e.value);
       } else {
           console.log("No matches were found");
       }
    });
    
**Example of cancelling the completion:**

    $("textarea").bind("nickname-complete", function (e) {
        // Don't try to autocomplete `bob`
        if (e.value === "bob") {
            e.preventDefault();
        }
    })

## Special Behavior Note:

By design this plugin will cancel default tab behavior **only** if the entry passes a test of the `nickname_match` regex. This allows the rest of the user experience to be as desired. You can of course attach an additional keypress handler that cancels all tab behaviors if you desire.

## License (At least for my code)

Copyright (c) 2010 by Doug Neiner

Dual licensed under the MIT or GPL Version 2 licenses, same license as jQuery: http://jquery.org/license