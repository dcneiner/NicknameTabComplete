# Nickname Tab Complete

This plugin detects when a tab key is pressed after an @ symbol and some characters have been typed. You supply the names via a setting.

I used code from all over, so I may need to play with the license, though all borrowed code is open source under some license and attributed.

## Example usage

    jQuery(document).ready(function ($) {
       $("textarea").nicknameTabComplete({
           nicknames: ["Doug", "PixelGun", "hax0r"]
       }); 
    });


## License (At least for my code)

Dual licensed under the MIT or GPL Version 2 licenses, same license as jQuery: http://jquery.org/license