/**  
 * jQuery bubbleMenu Plugin
 * Version: 0.0.1
 * URL: https://github.com/scottwb/jquery.bubbleMenu
 * Descripton: A simple bubble-like popup menu.
 * Requires: jQuery v1.3.2+
 * Author: Scott W. Bradley (http://www.google.com/profiles/scottwb)
 * Copyright: Copyright (c) 2010 Scott W. Bradley
 * License: BSD License
 *
 * Usage:
 *
 *   // Init element to popup a bubble menu when clicked.
 *   $(selector).bubbleMenu({
 *     menuOptions : [
 *       {name:'Chicken', link:{href:'http://...'}               },
 *       {name:'Beef',    link:{href:'http://...'}, selected:true},
 *       {name:'Pork',    link:{onclick:'...'}                   }
 *     ]
 *   });
 *
 *   // Un-init a previous init of bubbleMenu on an element.
 *   $(selector).bubbleMenu('destroy');
 *
 * For documentation on the supported options, see the bottom of this file.
 *
 *
 * TODO:
 *   [ ] Test on IE
 *   [ ] Factor out CSS/triangles into compass helpers.
 *   [ ] Build out Sass/Compass/CSS stuff to make this completely
 *       self-contained.
 *   [ ] Build out a unit-test/example page.
 */
(function($) {

    ////////////////////////////////////////////////////////////
    // Constants
    ////////////////////////////////////////////////////////////
    PLUGIN_NAME = 'bubbleMenu';


    ////////////////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////
    // Public Methods
    ////////////////////////////////////////////////////////////
    var publicMethods = {
        init: function(configOpts) {return this.each(function() {
            var config = $.extend({}, $.fn[PLUGIN_NAME].defaults, configOpts);
            var $this  = $(this);

            // Create the menu.
            var menu = $('<ul></ul>').addClass('bubbleMenu')
                                     .attr('style', 'display:none;');
            $.each(config.menuOptions, function(i, option) {
                var li = menu.append(
                    $('<li></li>').append(
                        $('<a></a>').attr(option.link).text(option.name)
                    )
                );
                if (option.selected) {
                    li.addClass('selected');
                }
            });
            $this.after(menu);

            // Position the menu so its "top center" is aligned with
            // the target's "center".
            //
            // REVISIT: If we updated to a later jQuery/UI we could:
            //
            //            menu.position({
            //              my: "top center",
            //              at: "center",
            //              of: $this
            //            });
            //
            var menuX = $this.offset().left + ($this.outerWidth() / 2);
            var menuY = $this.offset().top + ($this.outerHeight() / 2);
            menuX -= (menu.outerWidth() / 2);
            menu.css({left:menuX, top:menuY});

            // Show/hide menu on click.
            $this.click(function() {
                if (menu.is(':visible')) {
                    menu.hide();
                }
                else {
                    menu.fadeIn(
                        'fast',
                        function() {
                            var clickAnywhereToClose = function(e) {
                                menu.hide();
                                $(document).unbind('click', clickAnywhereToClose);
                                return true;
                            }
                            $(document).click(clickAnywhereToClose);
                        }
                    );
                }
            });

            var data  = $this.data(PLUGIN_NAME);
            if (!data) {
                $this.data(PLUGIN_NAME, {
                    menu : menu,
                });
            }
        })},

        destroy: function() {return this.each(function() {
            var $this = $(this);
            $this.data(PLUGIN_NAME).menu.remove();
            $this.removeData(PLUGIN_NAME);
        })},
    };


    ////////////////////////////////////////////////////////////
    // Plugin Initialization
    ////////////////////////////////////////////////////////////
    $.fn[PLUGIN_NAME] = function(method) {
        if (publicMethods[method]) {
            return publicMethods[method].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );
        }
        else if (typeof method == 'object' || !method) {
            return publicMethods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.' + PLUGIN_NAME);
        }
    };


    ////////////////////////////////////////////////////////////
    // Options
    ////////////////////////////////////////////////////////////
    $.fn[PLUGIN_NAME].defaults = {

        // An Array of objects, each of which defines an option in the menu.
        // Each of thise objects uses the following properties:
        //
        //   name : The name that will be displayed for the option.
        //
        //   link : An object that defines the HTML attributes of the
        //          menu option's <a> link. For example:
        //
        //          {
        //            href    : 'http://...',
        //            onclick : '...'
        //          }
        //
        //   selected : An optional boolean that indicates whether or
        //              not the option should be shown as being selected.
        //              Defaults to false.
        //
        menuOptions : []
    };
})(jQuery);
