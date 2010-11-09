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

## Special Behavior Note:

By design this plugin will cancel default tab behavior **only** if the entry passes a test of the `nickname_match` regex. This allows the rest of the user experience to be as desired. You can of course attach an additional keypress handler that cancels all tab behaviors if you desire.

## License (At least for my code)

Copyright (c) 2010 by Doug Neiner

Dual licensed under the MIT or GPL Version 2 licenses, same license as jQuery: http://jquery.org/license