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
                // NOTE: attr(option.link) may not work for the 'onclick'
                //       member of option.link on some browsers. I observed
                //       that it worked on FF 3.6 and Failed on Chrome 6.
                //       To workaround that, we'll pull out option.link.onclick
                //       and add it in separately.
                var onclick = null;
                if (option.link && option.link.onclick) {
                    onclick = option.link.onclick;
                    delete option.link.onclick;
                }
                var a = $('<a></a>').attr(option.link)
                                    .text(option.name)
                                    .click(function() {
                                        if (onclick) {
                                            // NOTE: We have to eval onclick
                                            //       since it is a string.
                                            //
                                            //       We have to wrap it in
                                            //       a function to eat any
                                            //       return statement found in
                                            //       onclick.
                                            eval(
                                                'var onclickFn = function(){' +
                                                 onclick                      +
                                                '}'
                                            );
                                            onclickFn.call(this);
                                        }
                                        if ($(this).hasClass('selected')) {
                                            if (config.onSelect) {
                                                config.onDeselect(option);
                                            }
                                        }
                                        else {
                                            if (config.onDeselect) {
                                                config.onSelect(option);
                                            }
                                        }
                                    });
                if (option.selected) {
                    a.addClass('selected');
                }
                menu.append($('<li></li>').append(a));
            });
            $this.after(menu);

            var positionMenu = function() {
              if (config.positionMenu) {
                  config.positionMenu($this, menu);
              }
              else {
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
              }
            };

            // Show/hide menu on click.
            $this.click(function() {
                if (menu.is(':visible')) {
                    if (config.onClose) {
                        config.onClose();
                    }
                    menu.hide();
                }
                else {
                    positionMenu();
                    if (config.onOpen) {
                        config.onOpen();
                    }
                    menu.fadeIn(
                        'fast',
                        function() {
                            var clickAnywhereToClose = function(e) {
                                if (config.onClose) {
                                    config.onClose();
                                }
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

        // An array of objects, each of which defines an option in the menu.
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
        // Any other arbitrary properties stuck in here will be ignored,
        // but will be passed back in the onSelect and onDeselect callbacks.
        menuOptions : [],

        // An optional function that will get called when the popup menu
        // is about to be opened. This function is not passed any parameters.
        onOpen: null,

        // An optional function that will get called when the popup menu
        // is about to be closed. This function is not passed any parameters.
        onClose: null,

        // An optional function that will get called when a menu option
        // is selected. This function will be passed one parameter that
        // is the menuOption object (from the menuOptions array) that was
        // selected.
        onSelect: null,

        // An optional function that will get called when a menu option
        // is de-selected. This function will be passed one parameter that
        // is the menuOption object (from the menuOptions array) that was
        // selected.
        //
        // NOTE: This does not get called when the option is implicitly
        //       de-selected due to another option being selected. It only
        //       gets called when a currently-selected option is explicitly
        //       de-selected.
        onDeselect: null,

        // An optional function that will get called to set the position of
        // the popup menu. If omitted, a default positioning algorithm
        // will be used. This function is passed two parameters when the
        // menu popup is created:
        //
        //   positionMenu(
        //     target,       // The target element that was clicked
        //     menu          // The menu <ul> to be positioned
        //   )
        //
        positionMenu: null
    };
})(jQuery);
