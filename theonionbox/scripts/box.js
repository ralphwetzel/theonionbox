%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

    // # The Onion Box

<%
    base_path = get('virtual_basepath', '') + '/'
    sections = get('sections', [])
    from tob.template_tools import *

    login = get('box.js_login', False)
    token = get('token', 'ThisIsAnError')
%>

% if login is False:

    %# // DataHandler
    %# // Interface created by the sections to communicate with the DataManager
    function DataHandler() {}
    DataHandler.prototype.process = function(data) {};
    DataHandler.prototype.prepare = function() {};

    %# // DataManager
    %# // Used to pull the data from the server

    function DataManager(error_callback) {
        this.error_callback = error_callback;
        this.handlers = {};
        this.timer = null;
        this.stop_flag = false;
        this.handler_count = 0;
    }

    DataManager.prototype.addHandler = function(name, handler) {
        if (!(name in this.handlers)) {
            this.handlers[name] = handler;
            this.handler_count += 1;
            // this.start();
        }
        else {
            console.log("Handler '" + name + "' already registered!");
        }
    };

    DataManager.prototype.removeHandler = function(name) {
        if (name in this.handlers) {
            delete this.handlers[name];
        }
    };

    var pull_error_counter = 0;

    DataManager.prototype.start = function() {

        var process_data = function(json_text) {

            pull_error_counter = 0;
            try {
                var data = JSON.parse(json_text);
            }
            catch(err) {
                console.log(json_text);
            }

            var timedelta = 0;
            if (data && data.tick)
            {
                timedelta = new Date().getTime() - data.tick;
            }

            if (data && data.token) {
                session_token_set(data.token)
            }

            // console.log(data)
            for (var name in this.handlers) {
                if (this.handlers.hasOwnProperty(name)) {
                    if (data && data[name]) {
                        this.handlers[name].process(data[name], timedelta);
                    }
                }
            }
        }.bind(this);

        var pull_data = function () {

            this.stop_flag = false;
            var action = 'token=' + session_token_get();

            for (var name in this.handlers) {
                var param = this.handlers[name].prepare();
                if (param !== '') {
                    if (action.length > 0) {
                        action += '&';
                    }
                    action += param;
                }
            }

            var ajax_settings = {};
            ajax_settings.method = 'POST';
            if (action.length > 0) {
                ajax_settings.data = action;
            }
            ajax_settings.success = process_data;
            ajax_settings.error = this.error_callback;

            jQuery.ajax('{{base_path}}{{session_id}}/data.html', ajax_settings);

            if (this.stop_flag === false) {
                this.timer = setTimeout(pull_data, 5000);
            }

        }.bind(this);

        pull_data();

    };

    DataManager.prototype.stop = function () {
        this.stop_flag = true;
        if (this.timer) {
            clearTimeout(this.timer);
        }
    };

    function pull_error(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404 || jqXHR.status == 500) {
            window.location.href = "{{base_path}}{{session_id}}/logout.html";
        }
        else if (textStatus == 'error' && jqXHR.status === 0 && jqXHR.readyState === 0) {

            pull_error_counter += 1;

            if (pull_error_counter > 2) {
                $('#network_error_warning').collapse('show');

                var its_now = new Date().getTime();

                var charts = $(".chart").trigger("tob:zero");
    <%
    #//            read_data_hd.append(its_now, 0);
    #//            read_data_ld.append(its_now, 0);
    #//            written_data_hd.append(its_now, 0);
    #//            written_data_ld.append(its_now, 0);
    #//
    #//        %  for count in range(cpu_count):
    #//            proc_data_{{count}}.append(its_now, 0);
    #//        % end
    #//
    #//            mem_data.append(its_now, 0);
    %>

            }
        }
        else {
            console.log('error: ' + jqXHR.status);
        }
    }

    var boxData = new DataManager(pull_error);

    function boxDataPlayer(play_callback, delay, timestamp_index) {
        this.delay = (delay ? delay : 0);
        this.timer_running = false;
        this.timer = null;
        this.frame_queue = [];
        this.frame_queue_length = Math.round(delay / 1000) + 10;
        this.last_pointer = -1;  // signals the cell for the latest data that was appended
        this.first_pointer = -1; // signals the cell keeping the last data being sliced; if == last_pointer: empty
        this.play_callback = (play_callback ? play_callback : null);
        this.play_counter = 0;

        this.timestamp_index = (timestamp_index ? timestamp_index : 's');

        this.play_frame = null;
        this.play_data = null;
        this.play_data_index = 0;
    }

    boxDataPlayer.prototype.start = function() {

        var peek_frame = function()
        {
            if (this.first_pointer == this.last_pointer) { return null; }

            var peek_pointer = this.first_pointer + 1;
            if (peek_pointer >= this.frame_queue_length) { peek_pointer = 0;}

            return this.frame_queue[peek_pointer];

        }.bind(this);

        var slice_frame = function()
        {
            if (this.first_pointer == this.last_pointer) { return null; }

            this.first_pointer += 1;
            if (this.first_pointer >= this.frame_queue_length) { this.first_pointer = 0; }

            return this.frame_queue[this.first_pointer];

        }.bind(this);

        var load_next_data = function() {

            this.play_data = null;
            do
            {
                // no play_frame?
                if (!this.play_frame) {
                    // get a play_frame
                    this.play_frame = slice_frame();
                    // zero index pointer
                    this.play_data_index = 0;
                }
                else {
                    // increase index in the current frame
                    this.play_data_index += 1;
                }

                // no frame? job done!
                if (!this.play_frame) { break; }

                // get the next play_data
                this.play_data = null;
                if (this.play_frame.length > this.play_data_index)
                    this.play_data = this.play_frame[this.play_data_index];

                // no play_data?
                if (this.play_data === null)
                {
                    // this play_frame ran out of play_data
                    this.play_frame = null;
                    this.play_data = null;
                }

            } while (!this.play_data);

            // signal 'job done!'
            if (!this.play_frame) { return false; }

            return true;

        }.bind(this);

        var play_next_data = function() {
            this.timer_running = false;
            if (!this.play_data) { return false; }
            this.play_callback(this.play_data);
            wait_next_data();
            return true;
        }.bind(this);

        var wait_next_data = function () {

            if (this.timer_running === true) { return true; }
            if (load_next_data() === false) { return; }

            var next_timestamp = this.play_data[this.timestamp_index];

            var client_time = new Date().getTime();
            var timeout_value = next_timestamp + this.delay - client_time;

            if (timeout_value < 0)
            {
                play_next_data();
                return;
            }

            this.timer_running = true;
            this.timer = setTimeout(play_next_data, timeout_value);
            return;

        }.bind(this);

        wait_next_data();
    };

    boxDataPlayer.prototype.stop = function() {
        clearTimeout(this.timer);
        this.timer_running = false;
        this.timer = null;
    };

    boxDataPlayer.prototype.append = function(frame) {

        var test_pointer = this.last_pointer + 1;

        // check if overfloating => circle
        if (test_pointer >= this.frame_queue_length) { test_pointer = 0; }

        // no operation if we hit the first_pointer!
        if (test_pointer == this.first_pointer) { return false; }

        this.last_pointer = test_pointer;
        this.frame_queue[this.last_pointer] = frame;

        this.start();
        return true;
    };

    %# // helper functions

    function prettyNumber(pBytes, pCalc, pUnits, separator) {

        // Thank's to 'Brennan T' on
        // http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript

        if (!separator)
        {
            separator = ' ';
        }

        // Handle some special cases
        if(pBytes === 0) return '0 Bytes';
        if(pBytes == 1) return '1 Byte';
        if(pBytes == -1) return '-1 Byte';

        var bytes = Math.abs(pBytes);

        // Attention: arm calculates according IEC, yet displays 'si' - Abbreviations
        // Therefore we have to enable this wrong behaviour here!

        // IEC units use 2^10 as an order of magnitude
        var orderOfMagnitude = Math.pow(2, 10);
        if(pCalc && pCalc.toLowerCase() && pCalc.toLowerCase() == 'si') {
            // SI units use the Metric representation based on 10^3 as a order of magnitude
            orderOfMagnitude = Math.pow(10, 3);
        }

        // IEC units use 2^10 as an order of magnitude
        var abbreviations = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        if(pUnits && pUnits.toLowerCase() && pUnits.toLowerCase() == 'si') {
            // SI units use the Metric representation based on 10^3 as a order of magnitude
            abbreviations = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        }

        var i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));
        var result = (bytes / Math.pow(orderOfMagnitude, i));

        // This will get the sign right
        if(pBytes < 0) {
            result *= -1;
        }

        // This bit here is purely for show. it drops the precision on numbers greater than 100 before the units.
        // it also always shows the full number of bytes if bytes is the unit.
        if(result >= 99.995 || i===0) {
            if (result.toFixed(0) == 1) return '1 Byte';
            return result.toFixed(0) + separator + abbreviations[i];
        } else {
            return result.toFixed(2) + separator + abbreviations[i];
        }
    }

    %# // Special Thanks goes to Rtlprmft
    %# // http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format

    String.form = function(str, arr) {
        var i = -1;
        function callback(exp, p0, p1, p2, p3, p4) {
            if (exp=='%%') return '%';
            if (arr[++i]===undefined) return undefined;
            exp  = p2 ? parseInt(p2.substr(1)) : undefined;
            var base = p3 ? parseInt(p3.substr(1)) : undefined;
            var val;
            switch (p4) {
                case 's': val = arr[i]; break;
                case 'c': val = arr[i][0]; break;
                case 'f': val = parseFloat(arr[i]).toFixed(exp); break;
                case 'p': val = parseFloat(arr[i]).toPrecision(exp); break;
                case 'e': val = parseFloat(arr[i]).toExponential(exp); break;
                case 'x': val = parseInt(arr[i]).toString(base?base:16); break;
                case 'd': val = parseFloat(parseInt(arr[i], base?base:10).toPrecision(exp)).toFixed(0); break;
            }
            val = typeof(val)=='object' ? JSON.stringify(val) : val.toString(base);
            var sz = parseInt(p1); /* padding size */
            var ch = p1 && p1[0]=='0' ? '0' : ' '; /* isnull? */
            while (val.length<sz) val = p0 !== undefined ? val+ch : ch+val; /* isminus? */
           return val;
        }
        var regex = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd])/g;
        return str.replace(regex, callback);
    };

    String.prototype.$ = function() {
        return String.form(this, Array.prototype.slice.call(arguments));
    };

    function format_date(date_value) {
        date_value = new Date(date_value);

        var out = "%04d".$(date_value.getFullYear());
        out += "-" + "%02d".$(date_value.getMonth() + 1);
        out += "-" + "%02d".$(date_value.getDate());
        out += " " + "%02d".$(date_value.getHours());
        out += ":" + "%02d".$(date_value.getMinutes());
        out += ":" + "%02d".$(date_value.getSeconds());

        return out;
    }

    // https://eureka.ykyuen.info/2014/06/24/javascript-round-a-number-to-certain-significant-figures/
    function sigFigs(n, sig) {
        var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    }

    function format_time(date_value) {
        date_value = new Date(date_value);

        var out = "%02d".$(date_value.getHours());
        out += ":" + "%02d".$(date_value.getMinutes());
        out += ":" + "%02d".$(date_value.getSeconds());

        return out;
    }

    var navBarButtonCount = 0;
    var navBarButtonTargets = ['top'];
    function addNavBarButton(text, target) {
        var btn = '<li style="font-size: 25px;" class="nav-item"';
        if (navBarButtonCount < 1) {
            // btn += ' class="active"';
        }
        btn += '><a href="#' + target + '" class="nav-link">' + text + '</a></li>';

        $("#box_navbar_buttons").append(btn);
        navBarButtonCount += 1;
        navBarButtonTargets.push(target);
    }

    $(document).on('keydown', function() {

        var current_href;
        var current_btn;

        if (event.which === 37 || event.which === 39) {
            try {
                current_href = $('#box_navbar_buttons li a.active').prop('href').split('#');
                current_btn = current_href[current_href.length - 1];
            }
            catch(err) {
                current_btn = 'top';
            }

            for (var i = 0; i < navBarButtonTargets.length; i++) {
                if (current_btn === navBarButtonTargets[i]) {
                    break;
                }
            }

            // left
            if (event.which === 37) {
                if (i > 0) {
                    i -= 1;
                }
            }
            // right
            else if (event.which === 39) {
                if (i < navBarButtonTargets.length - 1) {
                    i += 1;
                }
            }

            // There are situations - when e.g. the last but one section is too small - that the
            // scrollspy jumps over this section highlighting the last section.
            // This is ok when going down (right key) yet prevents us from going up again (left key).
            // This is a well known behaviour of scrollspy, yet annoying and needs to be fixed:

            var current_st = $(document).scrollTop();

            do {
                // goto new section
                location.href = '#' + navBarButtonTargets[i];
                // the new scroll pos (there should be a change if 'goto' was successful)
                var new_st = $(document).scrollTop();

                if (current_btn === navBarButtonTargets[navBarButtonTargets.length - 1] && // at the last section
                    event.which === 37 &&   // tried to go up
                    new_st === current_st)  // no scroll
                {
                    // try to go up another section!
                    i -=1;
                } else {
                    break;
                }
            } while ( i > 0 )
        }
    });

    // Bootstrap NavBar 'Fold on Selection or Click'
    // maniqui @ https://github.com/twbs/bootstrap/issues/9497
    $(document).on('click', function(event) {
        var $clickedOn = $(event.target),
        $collapsableItems = $('.collapse'),
        isToggleButton = ($clickedOn.closest('.navbar-toggle').length == 1),
        isLink = ($clickedOn.closest('a').length == 1),
        isOutsideNavbar = ($clickedOn.parents('.navbar').length === 0);

        if( (!isToggleButton && isLink) || isOutsideNavbar ) {
            $collapsableItems.each(function() {
                $(this).collapse('hide');
            });
        }
    });

    // Filo @ http://stackoverflow.com/questions/24765155/shrinking-navigation-bar-when-scrolling-down-bootstrap3
    $("#scrollablearea").scroll(function() {
        if ($("#scrollablearea").scrollTop() > 80) {
            if ($('.box_name').hasClass('hide_name')) {
                $('.box_name').show();
                $('.box_name').removeClass('hide_name');
                $('#TOBNavBar').removeClass('noline');
            }
        } else {
            if ($('.box_name').hasClass('hide_name') === false) {
                $('.box_name').addClass('hide_name');
                $('#TOBNavBar').addClass('noline');
            }
      }
    });

    // AJFarmar @ http://stackoverflow.com/questions/9255279/callback-when-css3-transition-finishes
    $(".box_name").on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e){
        if ($('.box_name').hasClass('hide_name')) {
            $('.box_name').hide();
        }
        //    $(this).off(e);
     });

    var history_chart_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3'];
    var history_chart_labels = ['5 Years', '1 Year', '3 Months', '1 Month', '1 Week', '3 Days'];

    var history_series_options = {
        dontDropOldData: true
    };

var oobw_style = {
    millisPerPixel: 500,
    maxValueScale: 1.1,
    minValueScale: 1.1,
    // maxDataSetLength: 5000,     // TBC: is this ok for all use cases??
    interpolation: 'step',
    yMaxFormatter: function(data, precision) {
        if (!precision) {
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; },
    enableDpiScaling: true,
    timeLabelLeftAlign: true,
    timeLabelSeparation: 2,
    grid:
        {
        fillStyle: '#E6E6E6',
        strokeStyle: '#777777',
        millisPerLine: 60000,
        verticalSections: 1,
        borderVisible: true
        },
    labels: {
        fillStyle: '#000000',
        disabled: false,
        fontSize: 10,
        fontFamily: 'monospace',
        precision: 2
        }
    };

    // Display Styles setzen
    function pad2(number) { return (number < 10 ? '0' : '') + number; }
    var chart_style = {};

    chart_style.hd = {
        millisPerPixel: 500,
        grid: {
            millisPerLine: 60000,
        },
        timestampFormatter: function(date) {
            return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    chart_style.ld = {
        millisPerPixel: 30000,
        grid: {
            millisPerLine: 3600000,
        },
        timestampFormatter: function(date) {
            return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    chart_style.d3 = {
        millisPerPixel: 1000 * 900 / 4,
        grid: {
            millisPerLine: 1000 * 60 * 60 * 24, // daily
            timeDividers: ''
        },
        timestampFormatter: function(date) {
            return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    chart_style.w1 = {
        millisPerPixel: 1000 * 3600 / 4,
        grid: {
            millisPerLine: 1000 * 60 * 60 * 24, // daily
            timeDividers: ''
        },
        timestampFormatter: function(date) {
            return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    chart_style.m1 = {
        millisPerPixel: 1000 * 14400 / 4,
        grid: {
            millisPerLine: 0,
            timeDividers: 'weekly'
        },
        timestampFormatter: function(date) {
            return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    chart_style.m3 = {
        millisPerPixel: 1000 * 43200 / 4,
        grid: {
            millisPerLine: 0,
            timeDividers: 'monthly'
        },
        timestampFormatter: function(date) {
            return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    chart_style.m6 = {
        millisPerPixel: 1000 * 86400 / 4,
        grid: {
            millisPerLine: 0,
            timeDividers: 'monthly'
        },
        timestampFormatter: function(date) {
            return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    // y1: This one is untested! Please provide feedback if it is ugly!!
    chart_style.y1 = {
        millisPerPixel: 1000 * 172800 / 4,
        grid: {
            millisPerLine: 0,
            timeDividers: 'monthly'
        },
        timestampFormatter: function(date) {
            return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };

    // y5: This one is untested! Please provide feedback if it is ugly!!
    chart_style.y5 = {
        millisPerPixel: 1000 * 864000 / 4,
        grid: {
            millisPerLine: 0,
            timeDividers: 'yearly'
        },
        timestampFormatter: function(date) {
            return date.getFullYear();
        },
        yMaxFormatter: function(data, precision) {
            if (!precision) {
                precision = 2;
            }
            return (prettyNumber(data, '', 'si') + '/s');
        },
        yMinFormatter: function() { return ""; }
    };



% end

    /* Bootstrap Toggle */
% # include('bootstrap-toggle/js/bootstrap-toggle.min.js')


% # include('bootstrap-switch/js/bootstrap-switch.min.js')



<%
    # Compensating the missing 'FileNotFoundError' in Python2.x
    # try:
    #     FileNotFoundError
    # except NameError:
    #    FileNotFoundError = IOError

    for section in sections:

        special = section[0]
        if special == '!' or special == '-':
            continue
        end

        file = 'sections/{0}/{0}.js'.format(section)
        try:
            include(file)
        # except FileNotFoundError:
        #    pass
        except Exception as exc:
            import logging
            bL = logging.getLogger('theonionbox')
            bL.debug("While including '{}' into 'box.js': {}".format(file, exc))
        end
    end
%>

    // Bootstrap NavBar 'Fold on Selection or Click'
    // maniqui @ https://github.com/twbs/bootstrap/issues/9497
    $(document).on('click', function(event) {
        var $clickedOn = $(event.target),
            $collapsableItems = $('.collapse'),
            isToggleButton = ($clickedOn.closest('.navbar-toggle').length == 1),
            isLink = ($clickedOn.closest('a').length == 1),
            isOutsideNavbar = ($clickedOn.parents('.navbar').length === 0);

        if( (!isToggleButton && isLink) || isOutsideNavbar ) {
            $collapsableItems.each(function() {
                $(this).collapse('hide');
            });
        }
    });

// to compensate for missing 'messages' section
if (typeof log !== 'function') {
    log = function(text) {
        console.log(text)
    };
}

% if login is False:

    // #####
    // # Customized Glide.js for TOB
    function boxGlide(selector)
    {
        Glide.call(this, selector);
    }

    boxGlide.prototype = new Glide();
    boxGlide.prototype.mount = function(settings) {


        var _extends = Object.assign || function (target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];

                for (var key in source) {
                  if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                  }
                }
              }

              return target;
            };

        /**
         * Merges passed settings object with default options.
         *
         * @param  {Object} defaults
         * @param  {Object} settings
         * @return {Object}
         */
        function mergeOptions(defaults, settings) {
          var options = _extends({}, defaults, settings);

          // `Object.assign` do not deeply merge objects, so we
          // have to do it manually for every nested object
          // in options. Although it does not look smart,
          // it's smaller and faster than some fancy
          // merging deep-merge algorithm script.
          if (settings.hasOwnProperty('classes')) {
            options.classes = _extends({}, defaults.classes, settings.classes);

            if (settings.classes.hasOwnProperty('direction')) {
              options.classes.direction = _extends({}, defaults.classes.direction, settings.classes.direction);
            }
          }

          return options;
        }

        var AddBullets = function (Glide, Components, Events) {

            // https://stackoverflow.com/a/4793630
            function insertAfter(newNode, referenceNode) {
                referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            }

            var AddBullets = {

                add_bullets() {

                    var NAV_SELECTOR = '[data-glide-el="controls[nav]"]';
                    var nav = Components.Html.root.querySelector(NAV_SELECTOR);

                    var TRACK_SELECTOR = '[data-glide-el="track"]';
                    var track = Components.Html.root.querySelector(TRACK_SELECTOR);

                    var slides = Array.from(track.children[0].children).filter(function (slide) {
                        return !slide.classList.contains(Glide.settings.classes.cloneSlide);
                    });

                    for (var i = 0; i < slides.length; i++) {

                        var bullets = Array.from(nav.children);
                        // var bullet;

                        if (i > bullets.length - 1) {
                            var bullet = document.createElement("BUTTON");
                            bullet.classList.add('glide__bullet');
                            bullet.setAttribute('data-glide-dir', "=" + i);
                            insertAfter(bullet, bullets[bullets.length - 1]);
                        }
                    }

                    Components.Controls.mount();
                }
            };

            Events.on('mount.after', function () {
                AddBullets.add_bullets();
            });

            return AddBullets;
        };

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        options = mergeOptions(options, {'AddBullets': AddBullets});

        Glide.mount(this, options);
    };



    var session_token = '{{token}}';

    function session_token_get() {
        return session_token;
    }

    function session_token_set(token) {
        session_token = token;
    }


    // Final step of the script ... to launch the site logic!
    //$(window).on('load', function() {
    $(document).ready(function() {
        // log("Client Script Operation launched.");

        boxData.start();
    });

    $(function () {
      $('[data-toggle="popover"]').popover()
    });

% end


