% from tob.livedata import intervals
var history_intervals = {{!intervals}};

var history_keys = ['1s', '1m', '5m', '1h', '4h', 'Ch', 'm6', 'y1', 'y5'];
var history_read_data = {};
var history_written_data = {};
var history_bandwidth = {};


// from box.js:
// history_chart_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3'];

var translate_onionoo_to_history = {
    'y5': 'y5',
    'y1': 'y1',
    'm6': 'm6',
    'm3': 'Ch',
    'm1': '4h',
    'w1': '1h',
    'd3': '5m'
};

var history_glide_js = null;

function create_history_glide() {

    var current_slide = 0;

    if (history_glide_js !== null && history_glide_js.length !== 0) {
        current_slide = history_glide_js.index;
        history_glide_js.destroy();
    }

    history_glide_js = new Glide('#history_glide', {type: 'slider', startAt: current_slide});

    history_glide_js.on('run.before', function(move) {
        // to stop the repaint on the canvas gliding away...
        var ci = history_glide_js.index;
        var key = history_glide_js._c.Html.slides[ci].getAttribute('id').substr(-2);
        history_bandwidth[key].stop();
        history_bandwidth[key].mouseout();
        $('#history_button_' + key).removeClass('active');
    });

    history_glide_js.on('run', function(move) {
        // to start the repaint of the canvas now visible...
        // index already holds the new index!
        var new_index = history_glide_js.index;
        var key = history_glide_js._c.Html.slides[new_index].getAttribute('id').substr(-2);
        history_bandwidth[key].start();
        // $('#history_detail').text('Resolution: ' + md[key][0] + ' | Source: ' + md[key][1] + '.');
        $('#history_button_' + key).addClass('active');
    });

    history_glide_js.mount({'AddBullets': AddBullets});
    // history_glide_js.mount();

}

// ScrollMonitor to enable / disable repaint
var history_monitor = scrollMonitor.create(document.getElementById("history_glide"), 100);
history_monitor.enterViewport(function () {
    if (history_glide_js != null && history_glide_js.length !== 0) {
        var ci = history_glide_js.index;
        var key = history_glide_js._c.Html.slides[ci].getAttribute('id').substr(-2);
        history_bandwidth[key].start();
    }
});
history_monitor.exitViewport(function () {
    var ci = history_glide_js.index;
    var key = history_glide_js._c.Html.slides[ci].getAttribute('id').substr(-2);
    history_bandwidth[key].stop();
    history_bandwidth[key].mouseout();
});




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

            var slides = Array.prototype.slice.call(track.children[0].children).filter(function (slide) {
                return !slide.classList.contains(Glide.settings.classes.cloneSlide);
            });

            for (var i = 0; i < slides.length; i++) {

                var bullets = Array.prototype.slice.call(nav.children);
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



function history_handler() {}
history_handler.prototype = new DataHandler();
history_handler.prototype.process = function(data, timedelta) {

    var data_points;
    var data_point;
    var DOM_changed = false;

    // console.log(data);

    var last_key_read = '';
    var last_key_write = '';

    for (var hkey in translate_onionoo_to_history) {

        var translated_key = translate_onionoo_to_history[hkey];

        if (data.read[hkey] && data.read[hkey].length > 0) {

            DOM_changed = connect_history_canvas(translated_key) || DOM_changed;
            var result = [];

            if (last_key_read !== '') {
                var first_time = data.read[hkey][0][0];
                var check_time = history_read_data[last_key_read].data[0][0];
                var check_index = 0;

                while (check_time < first_time) {
                    result.push(history_read_data[last_key_read].data[check_index]);
                    ++check_index;
                    check_time = history_read_data[last_key_read].data[check_index][0];
                }
            }

            history_read_data[translated_key].data = result.concat(data.read[hkey]);
            history_read_data[translated_key].resetBounds();
            last_key_read = hkey;

        }

        if (data.write[hkey] && data.write[hkey].length > 0) {

            DOM_changed = connect_history_canvas(translated_key) || DOM_changed;
            result = [];

            if (last_key_write !== '') {
                first_time = data.write[hkey][0][0];
                check_time = history_written_data[last_key_write].data[0][0];
                check_index = 0;

                while (check_time < first_time) {
                    result.push(history_written_data[last_key_write].data[check_index]);
                    ++check_index;
                    check_time = history_written_data[last_key_write].data[check_index][0];
                }
            }

            history_written_data[translated_key].data = result.concat(data.write[hkey]);
            history_written_data[translated_key].resetBounds();
            last_key_write = hkey;

        }
    }

    if (DOM_changed) {
        create_history_glide();
    }

};

history_handler.prototype.prepare = function() {
    // console.log("section_monitor: prepare");
};

history_handler.prototype.nav = function() {
    return 'Onionoo Network Data';
};

$(document).ready(function() {
    // addNavBarButton('Onionoo Network Data', 'history');
    boxData.addHandler('oo_bw', new history_handler());

    for (var len = history_keys.length, i = 0; i < len; i++) {
        var key = history_keys[i];
        history_read_data[key] = new boxTimeSeries();
        history_written_data[key] = new boxTimeSeries();
        history_bandwidth[key] = new boxChart();

    }

});


function history_interval_style(key) {

    function pad2(number) { return (number < 10 ? '0' : '') + number; }

    var mppf = {
        '1s': 0.5,
        '1m': 0.5,
        '5m': 0.5,
        '1h': 0.25,
        '4h': 0.25,
        'Ch': 0.25,
        'm6': 0.25,
        'y1': 0.25,
        'y5': 0.25
    };

    var mpp = {
        '1s': history_intervals['1s'] * 1000 * mppf['1s'],
        '1m': history_intervals['1m'] * 1000 * mppf['1m'],
        '5m': history_intervals['5m'] * 1000 * mppf['5m'],
        '1h': history_intervals['1h'] * 1000 * mppf['1h'],
        '4h': history_intervals['4h'] * 1000 * mppf['4h'],
        'Ch': history_intervals['Ch'] * 1000 * mppf['Ch'],
        'm6': 1000 * 86400 * mppf['m6'],
        'y1': 1000 * 172800 * mppf['y1'],
        'y5': 1000 * 864000 * mppf['y5']
    };

    var mpl = {
        '1s': 60 * 1000, // minutely
        '1m': 60 * 60 * 1000, // hourly
        '5m': 60 * 60 * 1000 * 3, // 3 hourly
        '1h': 60 * 60 * 24 * 1000, // daily,
        '4h': 0,
        'Ch': 0,
        'm6': 0,
        'y1': 0,
        'y5': 0
    };

    var td = {
        '1s': '',
        '1m': '',
        '5m': '',
        '1h': '',
        '4h': 'weekly',
        'Ch': 'monthly',
        'm6': 'monthly',
        'y1': 'monthly',
        'y5': 'yearly'
    };
/*
    var mtt = {
        '1s': 'Minutes',
        '1m': 'Hours',
        '5m': 'Day',
        '1h': 'Week',
        '4h': 'Month',
        'Ch': 'Three Months',
        'y1': 'One Year',
        'y5': 'Fife Years'
    };*/

    function tsf(key) {
        if ($.inArray(key, ['1s', '1m', '5m']) > -1) {
            return function(date) {
                return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
                }
        } else if ($.inArray(key, ['1h', '4h', 'Ch', 'm6', 'y1']) > -1) {
            return function (date) {
                return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + ".";
            }
        } else if ($.inArray(key, ['y5']) > -1) {
            return function(date) {
                return date.getFullYear();
            }
        }
    }

    return {

        chartOptions: {
            millisPerPixel: mpp[key],
            maxValueScale: 1.1,
            minValueScale: 1.1,
            maxDataSetLength: Math.max(screen.width, screen.height),     // TBC: is this ok for all use cases??
            interpolation: 'step',
            enableDpiScaling: true,
            timeLabelLeftAlign: true,
            timeLabelSeparation: 2,
            // sizeToParent: false,

            grid: {
                millisPerLine: mpl[key],
                timeDividers: td[key],
                fillStyle: '#E6E6E6',
                strokeStyle: '#777777',
                verticalSections: 1,
                borderVisible: true
            },

            timestampFormatter: tsf(key),
            yMaxFormatter: function(data, precision) {
                if (!precision) {
                    precision = 2;
                }
                return (prettyNumber(data, '', 'si') + '/s');
            },
            yMinFormatter: function(data, precision) {
                if (!precision) {
                    precision = 2;
                }
                return (prettyNumber(Math.abs(data), '', 'si') + '/s');
            },

            labels: {
                fontFamily: "LatoLatinWebLight",
                fillStyle: '#000000',
                disabled: false,
                fontSize: 10,
                precision: 2
            },

            tooltip: false,
            tooltipLine: {
                lineWidth: 1,
                strokeStyle: '#FF0000'
            },

            /** Formats the HTML string content of the tooltip. */
            tooltipFormatter: function (timestamp, data) {
                var date = new Date(timestamp);
                var lines = ['<span style="font-size: 12px">' +
                                'Status @ ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds()) +
                                '</span>'];

                for (var i = 0; i < data.length; ++i) {
                    var text = '';
                    if (data[i].series.options.tooltipTextFormatter) {
                        text = data[i].series.options.tooltipTextFormatter(data[i].value);
                    } else {
                        text = this.options.yMaxFormatter(data[i].value, this.options.labels.precision);
                    }
                    lines.push('<span style="color:' + data[i].series.options.strokeStyle + '; font-size: 12px">' +
                        text + '</span>');
                }

                return lines.join('<br>');
            },
        },
        timeseries: [{
            serie: history_written_data[key],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(0, 0, 153)',
                fillStyle:'rgba(0, 0, 153, 0.50)',
                nullTo0:true
            }}, {
            serie: history_read_data[key],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(0, 0, 153)',
                fillStyle:'rgba(0, 0, 153, 0.30)',
                nullTo0:true
            }}
            ]
    };
}



var history_watchers = [];

$(document).ready(function() {

    var client_time = new Date().getTime();

    // read_data_hd.append(client_time - 5000, 0);
    // written_data_hd.append(client_time - 5000, 0);

    // read_data_ld.append(client_time - 5000, 0);
    // written_data_ld.append(client_time - 5000, 0);

    // history_bandwidth['1s'].prepare(canvas, 5000);
    history_bandwidth['m6'].setDisplay(history_interval_style('m6'));
    var canvas = document.getElementById('history_canvas_m6');
    history_bandwidth['m6'].streamTo(canvas, 0);

    create_history_glide();

});

function connect_history_canvas(tag) {

    // console.log(tag);

    var glide = $("#history_glide_" + tag);
    if (glide.length > 0) {
        return false;
    }

    var li = "<li class='glide__slide glide__slide__monitor' id='history_glide_" + tag + "' style=''></li>";
    var cv = "<canvas class='bw_chart box_canvas' " +
                "id='history_canvas_" + tag + "' " +
                "width='300' height='240' " +
                "style='vertical-align: middle'>" +
            "</canvas>";

    var pos = $.inArray(tag, history_keys);
    while (glide.length === 0 && pos > 0) {
        pos -= 1;
        glide = $("#history_glide_" + history_keys[pos]);
    }
    if (glide.length !== 0) {

        // To insert the new slide without visible DOM repaint:
        // Get the width of the wrapper
        var mww = $("#history_wrapper").width();

        // and size the li accordingly
        var jli = $(li);
        jli.width(mww);

        // now append the canvas - which will be sized to the same width
        jli.append(cv);

/*        // make room for this slide in the track
        var mt = $("#history_track");

        var mtw = mt.width();
        //console.log(mtw, mww, mtw + mww);

        var sc = $(".glide__slide__history").length;

        //mt.css("width", mtw + mww);
        mt.width((sc + 1) * mww);

        mtw = mt.width();
        //console.log(mtw);*/

        // and now insert the slide
        // console.log(glide, jli);
        jli.insertAfter(glide);

    } else {
        return false;
    }

    var mis=history_interval_style(tag);
    history_bandwidth[tag].setDisplay(mis);
    var canvas = document.getElementById('history_canvas_' + tag);
    // history_bandwidth[tag].prepare(canvas, 5000);
    history_bandwidth[tag].streamTo(canvas, 5000);

    history_add_button(tag);

    return true;
}

var history_buttons = {
    '1s': 'unexpected',
    '1m': 'unexpected',
    '5m': 'unexpected',
    '1h': 'unexpected',
    '4h': '1 Month',
    'Ch': '3 Months',
    'm6': '6 Months',
    'y1': '1 Year',
    'y5': '5 Years'
};

function history_add_button(tag) {

    var button = $("#history_button_" + tag);
    if (button.length > 0) {
        return false;
    }

    var lbl = "<label id='history_button_" + tag + "' " +
                "class='btn btn-outline-secondary box_chart_button' " +
                "role='button' " +
                "onclick='history_goto_slide(0)'>" +
              "</label>";

    var inpt = "<input type='radio' autocomplete='off'>" + history_buttons[tag];

    var pos = $.inArray(tag, history_keys);
    while (button.length === 0 && pos > 0) {
        pos -= 1;
        button = $("#history_button_" + history_keys[pos]);
    }
    if (button.length !== 0) {

        var btn = $(lbl);
        btn.append(inpt);

        btn.insertAfter(button);

    } else {
        return false;
    }

    var counter = 0;
    for (var i= 0; i < history_keys.length; ++i) {
        button = document.getElementById('history_button_' + history_keys[i]);

        if (button !== null && button.length !== 0) {
            button.setAttribute('onclick', 'history_goto_slide(' + counter + ')');
            counter += 1;
        }
    }

}

function history_goto_slide(number) {
    if (history_glide_js != null && history_glide_js.length !== 0) {
        history_glide_js.go('=' + number);
    }
}
