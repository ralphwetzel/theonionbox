
function monitor_handler() {}
monitor_handler.prototype = new DataHandler();
monitor_handler.prototype.process = function(data, timedelta) {

    var data_points;
    var data_point;

    if (data && data.hd)
    {
        data_points = data.hd;
        for (data_point in data_points)
        {
            var timestamp = data_points[data_point].s + timedelta;

            read_data_hd.append(timestamp, data_points[data_point].r);
            written_data_hd.append(timestamp, data_points[data_point].w);

            %# // to prepare for the playback!
            data_points[data_point].s = timestamp;
        }

        monitor_bandwidth_player.append(data_points);
    }

    if (data && data.ld)
    {
        data_points = data.ld;
        for (data_point in data_points)
        {
            read_data_ld.append(data_points[data_point].m, data_points[data_point].r / 60);
            written_data_ld.append(data_points[data_point].m, data_points[data_point].w / 60);
        }
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

});


function chart_format_bw(data, precision)
{
    if (!precision) {
        precision = 2;
    }

    if (monitor_bandwidth_shows == 'hd' || monitor_bandwidth_shows == 'm1' || monitor_bandwidth_shows == 'm3') {
        return (prettyNumber(data, '', 'si') + '/s');
    }
    else if (monitor_bandwidth_shows == 'ld') {
        return (prettyNumber(data / 60, '', 'si') + '/s');
    }

    return '';
}

function chart_format_timestamp(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number; }
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
}

function chart_format_timestamp_LD(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number; }
    return pad2(date.getHours());
}

function chart_format_day(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number; }
    return pad2(date.getDate()) + ".";
}

function chart_format_DayMonth(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number; }
    return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + ".";
}

function chart_format_null(data, precision)
{
    return "";
}

%# // 1: bandwidth charts

var bandwidth_style = {
    millisPerPixel: 500,
    maxValueScale: 1.1,
    minValueScale: 1.1,
    maxDataSetLength: screen.width,     // TBC: is this ok for all use cases??
    interpolation: 'step',
    yMaxFormatter: function(data, precision) {
        if (!precision) {
            precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; },
    timestampFormatter: chart_format_timestamp,
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
        fontFamily: 'LatoLatinWebLight',
        precision: 2
        },
    tooltip: true,
    tooltipLine: {
        lineWidth: 1,
        strokeStyle: '#FF0000'
        }
    };

// var client_time = new box_TimeCompensator(new Date().getTime(), {{server_time}}*1000);

var read_data_hd = new boxTimeSeries();
var read_data_ld = new boxTimeSeries();
var bandwidth_read = new boxChart(bandwidth_style);

var written_data_hd = new boxTimeSeries();
var written_data_ld = new boxTimeSeries();
var bandwidth_low = new boxChart(bandwidth_style);

function pad2(number) { return (number < 10 ? '0' : '') + number; }
var monitor_style = {};

monitor_style.hd = {
    millisPerPixel: 500,
    grid: {
        millisPerLine: 60000
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
    yMinFormatter: function(data, precision) {
        if (!precision) {
            precision = 2;
        }
        return (prettyNumber(Math.abs(data), '', 'si') + '/s');
    },
    labels:
        {
            fontFamily: "LatoLatinWebLight"
        },
    /** Formats the HTML string content of the tooltip. */
    tooltipFormatter: function (timestamp, data) {
        var date = new Date(timestamp);
        var lines = ['<span style="font-size: 12px">' +
                        'Status@: ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds()) +
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
    }
    // yMinFormatter: function() { return ""; }
};

monitor_style.ld = {
    millisPerPixel: 30000,
    grid: {
        millisPerLine: 3600000
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
    yMinFormatter: function(data, precision) {
        if (!precision) {
            precision = 2;
        }
        return (prettyNumber(Math.abs(data), '', 'si') + '/s');
    },
    labels: {
        fontFamily: "LatoLatinWebLight"
    }
};


var bw_style = {};

// HD = Minutes
bw_style.hd = {};

bw_style.hd.r = {
    chartOptions: monitor_style.hd,
    timeseries: [
        {
            serie: written_data_hd,
            options: {
                lineWidth: 1,
                strokeStyle: '#64B22B',
                fillStyle: 'rgba(100, 178, 43, 0.30)',
                tooltipTextFormatter: function(value) {
                    return "Upload: " + prettyNumber(value, '', 'si') + '/s';
                }
                }
            },
        {
            serie: read_data_hd,
            options: {
                lineWidth: 1,
                strokeStyle: 'rgb(132, 54, 187)',
                fillStyle: 'rgba(132, 54, 187, 0.30)',
                tooltipTextFormatter: function(value) {
                    return "Download: " + prettyNumber(Math.abs(value), '', 'si') + '/s';
                }
            }
        }
    ]
};
bw_style.hd.w = {
    chartOptions: monitor_style.hd,
    timeseries: [ {
        serie: written_data_hd,
        options: {
            lineWidth:1,
            strokeStyle:'rgb(132, 54, 187)',
            fillStyle:'rgba(132, 54, 187, 0.30)'
        }
    } ]
};

// LD = Hours
bw_style.ld = {};
bw_style.ld.r = {
    chartOptions: monitor_style.ld,
    timeseries: [
        {
            serie: written_data_ld,
            options: {
                lineWidth: 1,
                strokeStyle: '#64B22B',
                fillStyle: 'rgba(100, 178, 43, 0.30)'
                }
            },
        {
            serie: read_data_ld,
            options: {
                lineWidth: 1,
                strokeStyle: 'rgb(132, 54, 187)',
                fillStyle: 'rgba(132, 54, 187, 0.30)'
            }
        }
    ]
};
bw_style.ld.w = {
    chartOptions: monitor_style.ld,
    timeseries: [ {
        serie: written_data_ld,
        options: {
            lineWidth:1,
            strokeStyle:'rgb(132, 54, 187)',
            fillStyle:'rgba(132, 54, 187, 0.30)'
        }
    } ]
};

var monitor_bandwidth_player;

function monitor_play_bandwidth(data) {
    $('#bw_down').text("Total: " + prettyNumber(data.tr, '', 'si') + " | Currently: " + prettyNumber(Math.abs(data.r), '', 'si') + '/s');
    $('#bw_up').text("Total: " + prettyNumber(data.tw, '', 'si') + " | Currently: " + prettyNumber(Math.abs(data.w), '', 'si') + '/s');
}

$("#Glide").on("afterTransition.glide", function(event, data) {
    // Access to event data
    if (data.index === 1) {
        bandwidth_read.mouseout();
    } else if (data.index === 2) {
        bandwidth_low.mouseout();
    }
});

$(document).ready(function() {

    var client_time = new Date().getTime();

    read_data_hd.append(client_time - 5000, 0);
    written_data_hd.append(client_time - 5000, 0);

    read_data_ld.append(client_time - 5000, 0);
    written_data_ld.append(client_time - 5000, 0);

    var canvas = document.getElementById('monitor-bw-read');
    bandwidth_read.prepare(canvas, 5000);
    bandwidth_read.streamTo(canvas, 5000);
    bandwidth_read.setDisplay(bw_style.hd.r);

    var bwr_watcher = scrollMonitor.create(canvas, 100);
    bwr_watcher.enterViewport(function () {
        bandwidth_read.start();
    });
    bwr_watcher.exitViewport(function () {
        bandwidth_read.stop();
    });


    canvas = document.getElementById('monitor-bw-low');
    bandwidth_low.streamTo(canvas, 5000);
    bandwidth_low.prepare(canvas, 5000);
    bandwidth_low.setDisplay(bw_style.ld.r);

    var bww_watcher = scrollMonitor.create(canvas, 100);
    bww_watcher.enterViewport(function () {
         bandwidth_low.start();
    });
    bww_watcher.exitViewport(function () {
        bandwidth_low.stop();
    });


    monitor_bandwidth_player = new boxDataPlayer(monitor_play_bandwidth, 5000, 's');
    monitor_bandwidth_player.start();

    $("#Glide").glide({
        type: "slider",
        autoplay: false,
        keyboard: false
    });

});

var monitor_bandwidth_shows = 'hd';

function monitor_set_display(selector) {
    if (selector == monitor_bandwidth_shows) { return; }

    var monitor_charts = ['hd', 'ld'];

    if ($.inArray(selector, monitor_charts) > -1) {
        if (selector == 'hd' || selector == 'ld') {
            bandwidth_read.setDisplay(bw_style[selector].r);
            // bandwidth_written.setDisplay(bw_style[selector].w);
        }
        monitor_bandwidth_shows = selector;
    }
}
