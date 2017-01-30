<%
    oo_bw = get('oo_bw')
    oo_read = None
    oo_write = None
    if oo_bw:
        oo_read = oo_bw.read()
        oo_write = oo_bw.write()
    end

    if oo_show:

%>

var history_series_options = {
    dontDropOldData: true
};

var written_data_history = [];
var read_data_history = [];

// var history_chart_keys = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];
// var history_chart_keys = ['3_days', '1_week', '1_month', '3_months', '1_year', '5_years'];
// var history_chart_labels = ['3 Days', '1 Week', '1 Month', '3 Months', '1 Year', '5 Years'];

var history_chart_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3'];
var history_chart_labels = ['5 Years', '1 Year', '3 Months', '1 Month', '1 Week', '3 Days'];

for (len = history_chart_keys.length, i=0; i<len; ++i) {
    if (i in history_chart_keys) {
        written_data_history[history_chart_keys[i]] = new boxTimeSeries(history_series_options);
        read_data_history[history_chart_keys[i]] = new boxTimeSeries(history_series_options);
    }
}

%# // 1: bandwidth charts

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

var oobw_read = new boxChart(oobw_style);
var oobw_write = new boxChart(oobw_style);
var oobw_shows = '';

function oobw_handler() {}
oobw_handler.prototype = new DataHandler();
oobw_handler.prototype.process = function(data, timedelta) {

% if oo_read is not None or oo_write is not None:

    // console.log(data);

    var last_inserted_button = null;
    var new_show_key = oobw_shows;

    var last_key_read = '';
    var last_key_write = '';

    for (var len = history_chart_keys.length, i=0; i<len; ++i) {

        if (i in history_chart_keys) {

            var key = history_chart_keys[i];
            var insert_button = false;

            if (data.read[key] && data.read[key].length > 0) {

                var result = [];

                if (last_key_read !== '') {
                    var first_time = data.read[key][0][0];
                    var check_time = read_data_history[last_key_read].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(read_data_history[last_key_read].data[check_index]);
                        ++check_index;
                        check_time = read_data_history[last_key_read].data[check_index][0];
                    }
                }

                read_data_history[key].data = result.concat(data.read[key]);
                read_data_history[key].resetBounds();
                last_key_read = key;
                insert_button = true;
            }

            if (data.write[key] && data.write[key].length > 0) {

                var result = [];

                if (last_key_write !== '') {
                    var first_time = data.write[key][0][0];
                    var check_time = written_data_history[last_key_write].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(written_data_history[last_key_write].data[check_index]);
                        ++check_index;
                        check_time = written_data_history[last_key_write].data[check_index][0];
                    }
                }

                written_data_history[key].data = result.concat(data.write[key]);
                written_data_history[key].resetBounds();
                last_key_write = key;
                insert_button = true;
            }

            if (insert_button) {
                if (!$('#oobw_' + key).length) {

                    button_code = '<label id=\"oobw_' + key + '\"';
                    button_code += ' class=\"btn btn-default box_chart_button\"';
                    button_code += ' onclick=\"set_oobw_display(\'' + key + '\')\">';
                    button_code += '<input type=\"radio\" autocomplete=\"off\">';
                    button_code += history_chart_labels[i];
                    button_code += '</label>';

                    if (last_inserted_button && last_inserted_button.length) {
                        last_inserted_button = $(button_code).insertBefore(last_inserted_button);
                    }
                    else {
                        $("#oo-charts").html('');
                        last_inserted_button = $(button_code).prependTo($("#oo-charts"));
                        // $('#oobw_' + key).addClass('active');
                    }
                }
                else {
                    last_inserted_button = $('#oobw_' + key);
                }
                // Latest inserted key ( = first in row) will be shown!
                new_show_key = key;
            }
            else {
                if ($('#oobw_' + key).length) {
                    $('#oobw_' + key).remove();
                }
            }
        }
    }

    if (last_inserted_button && last_inserted_button.length) {
        last_inserted_button.addClass('active');
    }

    // change chart to display only if no or invalid selection
    if (oobw_shows === '' || oobw_shows !== '' && !$('#oobw_' + oobw_shows).length) {
        if (oobw_shows != new_show_key) {
            set_oobw_display(new_show_key);
        }
    }

% end
};

oobw_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

oobw_handler.prototype.nav = function() {
    return 'Onionoo Network Data';
};

$(document).ready(function() {

    boxData.addHandler('oo_bw', new oobw_handler());

    var canvas;
    % if oo_read is not None:
        canvas = document.getElementById('oo-bw-read');
        oobw_read.prepare(canvas, 5000);

        var oobwr_watcher = scrollMonitor.create(canvas, 100);
        oobwr_watcher.enterViewport(function () {
            oobw_read.start();
        });
        oobwr_watcher.exitViewport(function () {
            oobw_read.stop();
        });

    % end
    % if oo_write is not None:
        canvas = document.getElementById('oo-bw-write');
        oobw_write.prepare(canvas, 5000);

        var oobww_watcher = scrollMonitor.create(canvas, 100);
        oobww_watcher.enterViewport(function () {
            oobw_write.start();
        });
        oobww_watcher.exitViewport(function () {
            oobw_write.stop();
        });

    % end

});

function set_oobw_display(selector)
{
    if (selector == oobw_shows) { return; }

    var charts = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];

    if ($.inArray(selector, charts) > -1) {
        s = selector;

        var style_r = {
            chartOptions: chart_style[s],
            timeseries: [ {
                serie: read_data_history[s],
                options: {
                    lineWidth:1,
                    strokeStyle:'rgb(0, 0, 153)',
                    fillStyle:'rgba(0, 0, 153, 0.30)',
                    nullTo0:true
                }
            } ]
        };

        var style_w = {
            chartOptions: chart_style[s],
            timeseries: [ {
                serie: written_data_history[s],
                options: {
                    lineWidth:1,
                    strokeStyle:'rgb(0, 0, 153)',
                    fillStyle:'rgba(0, 0, 153, 0.30)',
                    nullTo0:true
                }
            } ]
        };

        oobw_read.setDisplay(style_r);
        oobw_write.setDisplay(style_w);
        oobw_shows = selector;

        // console.log(oobw_read);
        // console.log(oobw_write);

    }
}

// Display Styles setzen
var oo_style = {};

oo_style.d3 = {
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
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
};

oo_style.w1 = {
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
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
};

oo_style.m1 = {
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
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
};

oo_style.m3 = {
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
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
};

// y1: This one is untested! Please provide feedback if it is ugly!!
oo_style.y1 = {
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
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
};

// y5: This one is untested! Please provide feedback if it is ugly!!
oo_style.y5 = {
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
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
};


% #// 'end' for 'if oo_show is True:'
% end