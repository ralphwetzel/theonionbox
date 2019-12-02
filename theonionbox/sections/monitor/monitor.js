% from tob.livedata import intervals
var monitor_intervals = {{!intervals}};

var monitor_keys = ['1s', '1m', '5m', '1h', '4h', 'Ch', 'm6', 'y1', 'y5'];
var monitor_read_data = {};
var monitor_written_data = {};
var monitor_bandwidth = {};

var monitor_history_read_data = {};
var monitor_history_written_data = {};

// from box.js:
// history_chart_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3'];

var translate_history_to_monitor = {
    'y5': 'y5',
    'y1': 'y1',
    'm6': 'm6',
    'm3': 'Ch',
    'm1': '4h',
    'w1': '1h',
    'd3': '5m'
};

var monitor_glide_js = null;

function create_monitor_glide() {

    var current_slide = 0;

    if (monitor_glide_js !== null && monitor_glide_js.length !== 0) {
        current_slide = monitor_glide_js.index;
        monitor_glide_js.destroy();
    }

    // monitor_glide_js = new boxGlide('#monitor_glide', {type: 'slider', startAt: current_slide});
    monitor_glide_js = new Glide('#monitor_glide', {type: 'slider', startAt: current_slide, keyboard: false});

    monitor_glide_js.on('run.before', function(move) {
        // to stop the repaint on the canvas gliding away...
        var ci = monitor_glide_js.index;
        var key = monitor_glide_js._c.Html.slides[ci].getAttribute('id').substr(-2);
        monitor_bandwidth[key].stop();
        monitor_bandwidth[key].mouseout();
        $('#monitor_button_' + key).removeClass('active');
    });

    monitor_glide_js.on('run', function(move) {
        // to start the repaint of the canvas now visible...
        // index already holds the new index!
        var new_index = monitor_glide_js.index;
        var key = monitor_glide_js._c.Html.slides[new_index].getAttribute('id').substr(-2);
        monitor_bandwidth[key].start();
        // $('#monitor_detail').text('Resolution: ' + md[key][0] + ' | Source: ' + md[key][1] + '.');
        $('#monitor_button_' + key).addClass('active');
    });

    monitor_glide_js.mount({'AddBullets': AddBullets});
    // monitor_glide_js.mount();

}

// ScrollMonitor to enable / disable repaint
var monitor_monitor = scrollMonitor.create(document.getElementById("monitor_glide"), 100);
monitor_monitor.enterViewport(function () {
    if (monitor_glide_js != null && monitor_glide_js.length !== 0) {
        var ci = monitor_glide_js.index;
        var key = monitor_glide_js._c.Html.slides[ci].getAttribute('id').substr(-2);
        monitor_bandwidth[key].start();
    }
});
monitor_monitor.exitViewport(function () {
    var ci = monitor_glide_js.index;
    var key = monitor_glide_js._c.Html.slides[ci].getAttribute('id').substr(-2);
    monitor_bandwidth[key].stop();
    monitor_bandwidth[key].mouseout();
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



function monitor_handler() {}
monitor_handler.prototype = new DataHandler();
monitor_handler.prototype.process = function(data, timedelta) {

    var data_points;
    var data_point;
    var DOM_changed = false;

    for (var key in data) {
        if (!data.hasOwnProperty(key)) {
            //The current property is not a direct property of p
            continue;
        }

        data_points = data[key];

        if (key === 'oo_bw') {
/*
            var last_key_read = '';
            var last_key_write = '';

            for (var hkey in translate_history_to_monitor) {

                var translated_key = translate_history_to_monitor[hkey];

                if (data_points.read[hkey] && data_points.read[hkey].length > 0) {

                    DOM_changed = connect_canvas(translated_key) || DOM_changed;
                    var result = [];

                    if (last_key_read !== '') {
                        var first_time = data_points.read[hkey][0][0];
                        var check_time = monitor_history_read_data[last_key_read].data[0][0];
                        var check_index = 0;

                        while (check_time < first_time) {
                            result.push(monitor_history_read_data[last_key_read].data[check_index]);
                            ++check_index;
                            check_time = monitor_history_read_data[last_key_read].data[check_index][0];
                        }
                    }

                    monitor_history_read_data[translated_key].data = result.concat(data_points.read[hkey]);
                    monitor_history_read_data[translated_key].resetBounds();
                    last_key_read = hkey;

                }

                if (data_points.write[hkey] && data_points.write[hkey].length > 0) {

                    DOM_changed = connect_canvas(translated_key) || DOM_changed;
                    result = [];

                    if (last_key_write !== '') {
                        first_time = data_points.write[hkey][0][0];
                        check_time = monitor_history_written_data[last_key_write].data[0][0];
                        check_index = 0;

                        while (check_time < first_time) {
                            result.push(monitor_history_written_data[last_key_write].data[check_index]);
                            ++check_index;
                            check_time = monitor_history_written_data[last_key_write].data[check_index][0];
                        }
                    }

                    monitor_history_written_data[translated_key].data = result.concat(data_points.write[hkey]);
                    monitor_history_written_data[translated_key].resetBounds();
                    last_key_write = hkey;

                }

            }*/
        }
        else if (key === '1s') {

            for (data_point in data_points)
            {
                var timestamp = data_points[data_point].s + timedelta;

                monitor_read_data[key].append(timestamp, data_points[data_point].r);
                monitor_written_data[key].append(timestamp, data_points[data_point].w);

                // to prepare for the playback!
                data_points[data_point].s = timestamp;
            }

            monitor_bandwidth_player.append(data_points);
        }
        else {
            var ia = $.inArray(key, monitor_keys);
            if (ia > -1) {

                // console.log(key)

                DOM_changed = connect_canvas(key) || DOM_changed;

                if (data_points.length > 0) {
                    if (monitor_read_data[key].data.length === 0) {
                        monitor_read_data[key].append(data_points[0].m - (monitor_intervals[key] * 1000), 0);
                    }

                    if (monitor_written_data[key].data.length === 0) {
                        monitor_written_data[key].append(data_points[0].m - (monitor_intervals[key] * 1000), 0);
                    }
                }

                for (data_point in data_points) {
                    monitor_read_data[key].append(data_points[data_point].m, data_points[data_point].r / monitor_intervals[key]);
                    monitor_written_data[key].append(data_points[data_point].m, data_points[data_point].w / monitor_intervals[key]);
                }
            }
        }
    }

    if (DOM_changed) {
        create_monitor_glide();
    }

};

monitor_handler.prototype.prepare = function() {
    // console.log("section_monitor: prepare");
};

monitor_handler.prototype.nav = function() {
    return 'Monitoring';
};

$(document).ready(function() {
    addNavBarButton('Monitoring', 'monitor');
    boxData.addHandler('mon', new monitor_handler());

    for (var len = monitor_keys.length, i = 0; i < len; i++) {
        var key = monitor_keys[i];
        monitor_read_data[key] = new boxTimeSeries();
        monitor_written_data[key] = new boxTimeSeries();
        monitor_bandwidth[key] = new boxChart();

        // monitor_history_read_data[key] = new boxTimeSeries();
        // monitor_history_written_data[key] = new boxTimeSeries();

    }

});


function monitor_interval_style(key) {

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
        '1s': monitor_intervals['1s'] * 1000 * mppf['1s'],
        '1m': monitor_intervals['1m'] * 1000 * mppf['1m'],
        '5m': monitor_intervals['5m'] * 1000 * mppf['5m'],
        '1h': monitor_intervals['1h'] * 1000 * mppf['1h'],
        '4h': monitor_intervals['4h'] * 1000 * mppf['4h'],
        'Ch': monitor_intervals['Ch'] * 1000 * mppf['Ch'],
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
        } else if ($.inArray(key, ['1h', '4h', 'Ch', 'y1']) > -1) {
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
            serie: monitor_history_written_data[key],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(0, 0, 153)',
                fillStyle:'rgba(0, 0, 153, 0.50)',
                nullTo0:true
            }}, {
            serie: monitor_history_read_data[key],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(0, 0, 153)',
                fillStyle:'rgba(0, 0, 153, 0.30)',
                nullTo0:true
            }}, {
            serie: monitor_written_data[key],
            options: {
                lineWidth: 1,
                strokeStyle: '#64B22B',
                fillStyle: 'rgba(100, 178, 43, 0.30)'
            }}, {
            serie: monitor_read_data[key],
            options: {
                lineWidth: 1,
                strokeStyle: 'rgb(132, 54, 187)',
                fillStyle: 'rgba(132, 54, 187, 0.30)'
            }}
            ]
    };
}


var monitor_bandwidth_player;

function monitor_play_bandwidth(data) {
    $('#bw_down').text("Total: " + prettyNumber(data.tr, '', 'si') + " | Currently: " + prettyNumber(Math.abs(data.r), '', 'si') + '/s');
    $('#bw_up').text("Total: " + prettyNumber(data.tw, '', 'si') + " | Currently: " + prettyNumber(Math.abs(data.w), '', 'si') + '/s');
}



var md = {
    '1s': ['1 second', 'Live from Tor'],
    '1m': ['1 minute', 'Local recording'],
    '5m': ['5 minutes', 'Local recording'],
    '1h': ['1 hour', 'Local recording'],
    '4h': ['4 hours', 'Local recording'],
    'Ch': ['12 hours', 'Tor network protocol data'],
    'm6': ['24 hours', 'Tor network protocol data'],
    'y1': ['2 days', 'Tor network protocol data'],
    'y5': ['10 days', 'Tor network protocol data']
};

var monitor_watchers = [];

$(document).ready(function() {

    var client_time = new Date().getTime();

    // read_data_hd.append(client_time - 5000, 0);
    // written_data_hd.append(client_time - 5000, 0);

    // read_data_ld.append(client_time - 5000, 0);
    // written_data_ld.append(client_time - 5000, 0);

    // monitor_bandwidth['1s'].prepare(canvas, 5000);
    monitor_bandwidth['1s'].setDisplay(monitor_interval_style('1s'));
    var canvas = document.getElementById('monitor_canvas_1s');
    monitor_bandwidth['1s'].streamTo(canvas, 5000);

    monitor_bandwidth_player = new boxDataPlayer(monitor_play_bandwidth, 5000, 's');
    monitor_bandwidth_player.start();

    create_monitor_glide();

});

function connect_canvas(tag) {

    // only show chart with at least 3 points (to avoid empty charts!)
    if (monitor_read_data[tag].data.length < 3) {
        return false;
    }

    var glide = $("#monitor_glide_" + tag);
    if (glide.length > 0) {
        return false;
    }

    var li = "<li class='glide__slide glide__slide__monitor' id='monitor_glide_" + tag + "' style=''></li>";
    var cv = "<canvas class='bw_chart box_canvas' " +
                "id='monitor_canvas_" + tag + "' " +
                "width='300' height='240' " +
                "style='vertical-align: middle'>" +
            "</canvas>";

    var pos = $.inArray(tag, monitor_keys);
    while (glide.length === 0 && pos > 0) {
        pos -= 1;
        glide = $("#monitor_glide_" + monitor_keys[pos]);
    }
    if (glide.length !== 0) {

        // To insert the new slide without visible DOM repaint:
        // Get the width of the wrapper
        var mww = $("#monitor_wrapper").width();

        // and size the li accordingly
        var jli = $(li);
        jli.width(mww);

        // now append the canvas - which will be sized to the same width
        jli.append(cv);

/*        // make room for this slide in the track
        var mt = $("#monitor_track");

        var mtw = mt.width();
        //console.log(mtw, mww, mtw + mww);

        var sc = $(".glide__slide__monitor").length;

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

    var mis=monitor_interval_style(tag);
    monitor_bandwidth[tag].setDisplay(mis);
    var canvas = document.getElementById('monitor_canvas_' + tag);
    // monitor_bandwidth[tag].prepare(canvas, 5000);
    //monitor_bandwidth[tag].streamTo(canvas, 5000);

    // no delay if not '1s'!
    monitor_bandwidth[tag].streamTo(canvas, 0);

    monitor_add_button(tag);

    return true;
}

var monitor_buttons = {
    '1s': 'Minutes',
    '1m': 'Hours',
    '5m': '1 Day',
    '1h': '1 Week',
    '4h': '1 Month',
    'Ch': '3 Months',
    'm6': '6 Months',
    'y1': 'unexpected',
    'y5': 'unexpected'
};

function monitor_add_button(tag) {

    var button = $("#monitor_button_" + tag);
    if (button.length > 0) {
        return false;
    }

    var lbl = "<label id='monitor_button_" + tag + "' " +
                "class='btn btn-outline-secondary box_chart_button' " +
                "role='button' " +
                "onclick='monitor_goto_slide(0)'>" +
              "</label>";

    var inpt = "<input type='radio' autocomplete='off'>" + monitor_buttons[tag];

    var pos = $.inArray(tag, monitor_keys);
    while (button.length === 0 && pos > 0) {
        pos -= 1;
        button = $("#monitor_button_" + monitor_keys[pos]);
    }
    if (button.length !== 0) {

        var btn = $(lbl);
        btn.append(inpt);

        btn.insertAfter(button);

    } else {
        return false;
    }

    var counter = 0;
    for (var i= 0; i < monitor_keys.length; ++i) {
        button = document.getElementById('monitor_button_' + monitor_keys[i]);

        if (button !== null && button.length !== 0) {
            button.setAttribute('onclick', 'monitor_goto_slide(' + counter + ')');
            counter += 1;
        }
    }

}

function monitor_goto_slide(number) {
    if (monitor_glide_js != null && monitor_glide_js.length !== 0) {
        monitor_glide_js.go('=' + number);
    }
}
