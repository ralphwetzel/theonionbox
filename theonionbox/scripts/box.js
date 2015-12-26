%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

%# // includes here!
<script type="text/javascript" src=/{{session_id}}/{{jquery_lib}}></script>
<script type="text/javascript" src=/{{session_id}}/{{bootstrap_js}}></script>

%# // TODO: get rid of seperated files & include code directly into this file!
<script type="text/javascript" src="/{{session_id}}/smoothie.js"></script>
<script type="text/javascript" src="/{{session_id}}/box_chart.js"></script>
<script type="text/javascript" src="/{{session_id}}/box_messages.js"></script>
<script type="text/javascript" src="/{{session_id}}/box_player.js"></script>

%# // page script starts here!
<script>


%# // chart management
%# // 0: dedicated functions

function chart_format_bw(data, precision)
{
    if (!precision) {
        var precision = 2;
    }

    if (read_speed_HD == 1) {
        return (prettyNumber(data, '', 'si') + '/s');
    }
    else if (read_speed_HD == 0) {
        return (prettyNumber(data / 60, '', 'si') + '/s');
    }
};

function chart_format_timestamp(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number }
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
};

function chart_format_timestamp_LD(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number }
    return pad2(date.getHours());
};


function chart_format_null(data, precision)
{
    return "";
}

%# // 1: bandwidth charts

var bandwidth_style = {
    millisPerPixel: 500,
    maxValueScale: 1.1,
    minValueScale: 1.1,
    interpolation: 'step',
    yMaxFormatter: chart_format_bw,
    yMinFormatter: chart_format_null,
    timestampFormatter: chart_format_timestamp,
    enableDpiScaling: false,
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

// var client_time = new box_TimeCompensator(new Date().getTime(), {{server_time}}*1000);

var read_data_hd = new TimeSeries();
var read_data_ld = new TimeSeries();
var bandwidth_read = new box_chart(bandwidth_style);

var written_data_hd = new TimeSeries();
var written_data_ld = new TimeSeries();
var bandwidth_written = new box_chart(bandwidth_style);

%# // 2: Processor & Memory Load

var proc_style = {
    millisPerPixel: 500,
    // maxValueScale: 2,
    // minValueScale: 2,
    maxDataSetLength: 1000,     // TBC: is this ok for all use cases??
    interpolation: 'step',
    maxValue: 100,
    minValue: 0,

    yMaxFormatter: chart_format_null,
    yMinFormatter: chart_format_null,
    enableDpiScaling: false,
    grid:
        {
        fillStyle: '#E6E6E6',
        strokeStyle: '#777777',
        millisPerLine: 60000,
        verticalSections: 1,
        borderVisible: true
        }
    };

%  for count in range(cpu_count):
    var proc_data_{{count}} = new TimeSeries();
    var chart_processor_{{count}} = new box_chart(proc_style);
% end

var mem_data = new TimeSeries();
var chart_mem = new box_chart(proc_style);


%# // chart initialisation

function launch_charts()
{
    var client_time = new Date().getTime();
    var standard_delay = 1500;

    read_data_hd.append(client_time - 5000, 0);
    written_data_hd.append(client_time - 5000, 0);

    read_data_ld.append(client_time - 5000, 0);
    written_data_ld.append(client_time - 5000, 0);

    var canvas = document.getElementById('smoothie-chart-read');
    bandwidth_read.addTimeSeries(read_data_hd, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
    bandwidth_read.streamTo(canvas, 5000);

    canvas = document.getElementById('smoothie-chart-written');
    bandwidth_written.addTimeSeries(written_data_hd, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});
    bandwidth_written.streamTo(canvas, 5000);

    %  for count in range(cpu_count):
        proc_data_{{count}}.append(client_time - 5000, 0);
        canvas = document.getElementById('processor_load_{{count}}');
        chart_processor_{{count}}.addTimeSeries(proc_data_{{count}}, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
        chart_processor_{{count}}.streamTo(canvas, 5000);
    % end

    mem_data.append(client_time - 5000, 0);
    canvas = document.getElementById('mem_load');
    chart_mem.addTimeSeries(mem_data, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});
    chart_mem.streamTo(canvas, 5000);

}


%# // page initialisation


%# // server communication & data display

var pull_timer;
var stop_timer;

var read_speed_HD = 1;
var pull_speed_HD = 1;

var bandwidth_player;
var messages_player;

function pull_error()
{
    window.location.href = "/{{session_id}}/logout.html";
}

function process_livedata(json_text)
{
    var json_data = JSON.parse(json_text);
    var client_delta = 0

    if (json_data && json_data.tick)
    {
        // var client_time = new Date().getTime();
        client_delta = new Date().getTime() - json_data.tick;
    }

    if (json_data && json_data.hd)
    {
        var data = json_data.hd;
        var data_point;

        for (data_point in data)
        {
            var timestamp = data[data_point].s + client_delta;

            read_data_hd.append(timestamp, data[data_point].r);
            written_data_hd.append(timestamp, data[data_point].w);

            %# // to prepare for the playback!
            data[data_point].s = timestamp;
        }

        if (!this_is_the_first_pull_request)
        {
            bandwidth_player.append(data);
        }
    }

    if (json_data && json_data.ld)
    {
        var data = json_data.ld;
        var data_point;

        for (data_point in data)
        {
            read_data_ld.append(data[data_point].m, data[data_point].r);
            written_data_ld.append(data[data_point].m, data[data_point].w);
        }
    }

    if (json_data && json_data.cpu)
    {
        var data = json_data.cpu;
        var data_point;

        for (data_point in data)
        {
            var timestamp = data[data_point].s + client_delta;

            % for count in range(cpu_count):
                proc_data_{{count}}.append(timestamp, data[data_point].c{{count}});
            % end
            mem_data.append(timestamp, data[data_point].mp);
        }
    }

    if (json_data && json_data.log)
    {
        var data = json_data.log;
        var data_point;

        for (data_point in data)
        {
            var timestamp = data[data_point].s + client_delta;
            %# // to prepare for the playback!
            data[data_point].s = timestamp;
        }

        if (!this_is_the_first_pull_request)
        {
            messages_player.append(data);
        }
    }

    this_is_the_first_pull_request = false;

}

function pull_data()
{
    var ajax_settings = {};
    ajax_settings.method = 'POST';
    var action = 'action=pull_livedata';
    ajax_settings.success = process_livedata;
    ajax_settings.error = pull_error;

    if (this_is_the_first_pull_request)
    {
        action += "&full=1"
    }

    var runlevel = LogStatus.json();
    if (runlevel.length > 0)
    {
        action += "&runlevel=" + runlevel;
    }

    ajax_settings.data = action;

    jQuery.ajax('/{{session_id}}/data.html', ajax_settings);

    if (stop_timer == false)
    {
        pull_timer = setTimeout(pull_data, 4500);
    }
}

function play_bandwidth(data)
{
    $('#bw_down').text("Total: " + prettyNumber(data.tr, '', 'si') + " | Current: " + prettyNumber(data.r, '', 'si') + '/s');
    $('#bw_up').text("Total: " + prettyNumber(data.tw, '', 'si') + " | Current: " + prettyNumber(data.w, '', 'si') + '/s');
}


function play_messages(data)
{
    log(data.m, data.s, data.l);
}


function log(message, timestamp, runlevel)
{
    if (!message) { return;}
    if (!timestamp)
        { timestamp = new Date();}
    else
        { timestamp = new Date(timestamp);}

    if (!runlevel) { runlevel = 'THIS';}

    var log_msg = "<tr class='%s'><td class='box_Log_runlevel'>[%s]</td><td nowrap class='box_Log_stamp'>".$(runlevel, runlevel);

    // log_msg = log_msg + strftime('%F %T', new Date())
    log_msg = log_msg + format_date(timestamp);
    log_msg = log_msg + '</td><td>';
    log_msg = log_msg + message;
    log_msg = log_msg + '</td></tr>';

    $('#log_data').prepend(log_msg);

}


%# // page logic

function box_canvas(canvas_element) {
    this._canvas = canvas_element;

    //Get the canvas & context
    this._context = this._canvas.get(0).getContext('2d');
    this._container = $(this._canvas).parent();

    var respondCanvas = function(){

        // console.log(this._container);

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = this._context.canvas.width;
        tempCanvas.height = this._context.canvas.height;
        var tempContext = tempCanvas.getContext("2d");

        tempContext.drawImage(this._context.canvas, 0, 0);
        this._canvas.attr('width', $(this._container).width() ); //max width
        this._context.drawImage(tempContext.canvas, 0, 0);
    }.bind(this)

    //Run function when browser resizes
    $(window).resize(respondCanvas);

    //Initial call
    respondCanvas();
}


$(document).ready( function(){

    var scR = new box_canvas($('#smoothie-chart-read'));
    var scW = new box_canvas($('#smoothie-chart-written'));

    % for count in range(cpu_count):
        var plc{{count}} = new box_canvas($('#processor_load_{{count}}'));
    % end

    var meml = new box_canvas($('#mem_load'));

    $('#bw_down').text("Total: " + prettyNumber({{read_bytes}}, '', 'si') + " | Current: " + prettyNumber(0, '', 'si') + '/s');
    $('#bw_up').text("Total: " + prettyNumber({{written_bytes}}, '', 'si') + " | Current: " + prettyNumber(0, '', 'si') + '/s');

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

});

// var LogList;
var LogStatus;

%# // This flag is used to prevent the initial load of data to go through the data_players
%# // therefore to get rid of some javascript issues (e.g. on FF)
var this_is_the_first_pull_request = true;

$(window).load(function() {

    stop_timer = false;

    bandwidth_player = new box_DataPlayer(play_bandwidth, 5000, 's');
    bandwidth_player.start();

    messages_player = new box_DataPlayer(play_messages, 5000, 's');
    messages_player.start();

    LogStatus = new box_LogSelector();

    % preserved_events = get('preserved_events')
    % for event in reversed(preserved_events):
        log("{{event['m']}}", {{event['s']}}, "{{event['l']}}");
    % end

    log("Client Script Operation launched.");

    launch_charts();
    pull_data();
});

window.onbeforeunload = function()
{
    clearTimeout(pull_timer);
    stop_timer = true;
}

$(".message_selector").on('click', function () {
    var key = $(this).data("severity");

    LogStatus.set(key, !LogStatus.get(key));
})

function set_download_display(selector)
{
    if (selector == 'HD' && read_speed_HD == 1) { return; }
    if (selector == 'LD' && read_speed_HD == 0) { return; }

    if (selector == 'HD')
    {
        bandwidth_read.options.millisPerPixel = 500
        bandwidth_read.options.grid.millisPerLine = 60000
        bandwidth_written.options.millisPerPixel = 500
        bandwidth_written.options.grid.millisPerLine = 60000

        read_speed_HD = 1;
        bandwidth_read.removeTimeSeries(read_data_ld);
        bandwidth_read.addTimeSeries(read_data_hd, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
        bandwidth_written.removeTimeSeries(written_data_ld);
        bandwidth_written.addTimeSeries(written_data_hd, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});

        bandwidth_read.options.timestampFormatter = chart_format_timestamp;
        bandwidth_written.options.timestampFormatter = chart_format_timestamp;
    }

    else if (selector == 'LD')
    {
        bandwidth_read.options.millisPerPixel = 60000
        bandwidth_read.options.grid.millisPerLine = 3600000
        bandwidth_written.options.millisPerPixel = 60000
        bandwidth_written.options.grid.millisPerLine = 3600000

        read_speed_HD = 0;
        bandwidth_read.removeTimeSeries(read_data_hd);
        bandwidth_read.addTimeSeries(read_data_ld, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
        bandwidth_written.removeTimeSeries(written_data_hd);
        bandwidth_written.addTimeSeries(written_data_ld, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});

        bandwidth_read.options.timestampFormatter = chart_format_timestamp_LD;
        bandwidth_written.options.timestampFormatter = chart_format_timestamp_LD;
    }
}


%# // helper functions

function prettyNumber(pBytes, pCalc, pUnits, separator) {

    // Thank's to 'Brennan T' on
    // http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript

    if (!separator)
    {
        separator = ' ';
    }

    // Handle some special cases
    if(pBytes == 0) return '0 Bytes';
    if(pBytes == 1) return '1 Byte';
    if(pBytes == -1) return '-1 Byte';

    var bytes = Math.abs(pBytes)

    // Attention: arm calculates according IEC, yet displays 'si' - Abbreviations
    // Therefore we have to enable this wrong behaviour here!

    if(pCalc && pCalc.toLowerCase() && pCalc.toLowerCase() == 'si') {
        // SI units use the Metric representation based on 10^3 as a order of magnitude
        var orderOfMagnitude = Math.pow(10, 3);
    } else {
        // IEC units use 2^10 as an order of magnitude
        var orderOfMagnitude = Math.pow(2, 10);
    }

    if(pUnits && pUnits.toLowerCase() && pUnits.toLowerCase() == 'si') {
        // SI units use the Metric representation based on 10^3 as a order of magnitude
        var abbreviations = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    } else {
        // IEC units use 2^10 as an order of magnitude
        var abbreviations = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    }

    var i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));
    var result = (bytes / Math.pow(orderOfMagnitude, i));

    // This will get the sign right
    if(pBytes < 0) {
        result *= -1;
    }

    // This bit here is purely for show. it drops the precision on numbers greater than 100 before the units.
    // it also always shows the full number of bytes if bytes is the unit.
    if(result >= 99.995 || i==0) {
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
        var exp  = p2 ? parseInt(p2.substr(1)) : undefined;
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
}

String.prototype.$ = function() {
    return String.form(this, Array.prototype.slice.call(arguments));
}

function format_date(date_value)
{
    if (!date_value) {
        date_value = new Date();
        }

    var out = "%04d".$(date_value.getFullYear());
    out += "-" + "%02d".$(date_value.getMonth() + 1);
    out += "-" + "%02d".$(date_value.getDate());
    out += " " + "%02d".$(date_value.getHours());
    out += ":" + "%02d".$(date_value.getMinutes());
    out += ":" + "%02d".$(date_value.getSeconds());

    return out;
}


</script>