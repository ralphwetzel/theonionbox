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

    if (bandwidth_shows == 'hd' | bandwidth_shows == 'm1' | bandwidth_shows == 'm3') {
        return (prettyNumber(data, '', 'si') + '/s');
    }
    else if (bandwidth_shows == 'ld') {
        return (prettyNumber(data / 60, '', 'si') + '/s');
    }

    return ''
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

function chart_format_day(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number }
    return pad2(date.getDate()) + ".";
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
    // maxDataSetLength: 5000,     // TBC: is this ok for all use cases??
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

var history_series_options = {
    dontDropOldData: true
}

var written_data_history = [];
var read_data_history = [];

var history_chart_keys = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];
var history_chart_labels = ['3 Days', '1 Week', '1 Month', '3 Months', '1 Year', '5 Years'];

for (len = history_chart_keys.length, i=0; i<len; ++i) {
    if (i in history_chart_keys) {
        written_data_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        read_data_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        }
    }



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

var bandwidth_shows = 'hd';

var bandwidth_player;
var messages_player;

function pull_error(jqXHR, textStatus, errorThrown)
{
    if (jqXHR.status == 404 | jqXHR.status == 500) {
        window.location.href = "/{{session_id}}/logout.html";
    }
    else if (textStatus == 'error' && jqXHR.status == 0 && jqXHR.readyState == 0) {
        $('#network_error_warning').collapse('show');

        its_now = new Date().getTime();

        read_data_hd.append(its_now, 0);
        read_data_ld.append(its_now, 0);
        written_data_hd.append(its_now, 0);
        written_data_ld.append(its_now, 0);

    %  for count in range(cpu_count):
        proc_data_{{count}}.append(its_now, 0);
    % end

        mem_data.append(its_now, 0);

    }
    else {
        console.log('error: ' + jqXHR.status);
    }
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

    if (json_data && json_data.oo)
    {
        update_onionoo(json_data.oo, true)
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

function refresh_onionoo()
{
    var ajax_settings = {};
    ajax_settings.method = 'POST';
    var action = 'action=refresh_onionoo';
    ajax_settings.success = update_onionoo;
//    ajax_settings.error = pull_error;

    ajax_settings.data = action;

    jQuery.ajax('/{{session_id}}/data.html', ajax_settings);
}

function update_onionoo(json_data, is_json)
{
    if (is_json != true)
    {
        json_data = JSON.parse(json_data);
    }

    // $('#network_timestamp').text(format_date());
    $('#network_timestamp').text(format_date(json_data.timestamp));

    console.log(json_data.timestamp + " " + format_date(json_data.timestamp));

    var txt = json_data.running ? 'True' : 'False';
    txt += ' | since ' + format_date(json_data.last_restarted);
    $('#network_running').text(txt);

    $('#network_consensus_weight').text(json_data.consensus_weight);

    txt = 'Advertised: ' + prettyNumber(json_data.advertised_bandwidth, '', 'si') + '/s';
    txt += ' (Rate: ' + prettyNumber(json_data.bandwidth_rate, '', 'si') + '/s';
    txt += ' | Burst: ' + prettyNumber(json_data.bandwidth_burst, '', 'si') + '/s';
    txt += ' | Observed: ' + prettyNumber(json_data.observed_bandwidth, '', 'si') + '/s';
    txt += ')';
    $('#network_advertised_bandwidth').text(txt);

    $('#network_first_seen').text(json_data.first_seen);
    $('#network_last_seen').text(json_data.last_seen);

    if (json_data && json_data.bw) {

        var json_bw = json_data.bw;

        var buttons_inserted = 0;
        var last_inserted_button = null;

        for (len = history_chart_keys.length, i=0; i<len; ++i) {

            if (i in history_chart_keys) {

                var key = history_chart_keys[i];

                if (json_bw && json_bw[key]) {

                    var insert_button = false;

                    if (json_bw[key].wh) {
                        written_data_history[key].data = json_bw[key].wh;
                        written_data_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (json_bw[key].rh) {
                        read_data_history[key].data = json_bw[key].rh;
                        read_data_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (insert_button) {
                        if (!$('#' + key).length) {

                            button_code = '<label id=\"' + key + '\"';
                            button_code += ' class=\"btn btn-default box_chart_button\"';
                            button_code += ' onclick=\"set_download_display(\'' + key + '\')\">';
                            button_code += '<input type=\"checkbox\" autocomplete=\"off\">';
                            button_code += history_chart_labels[i];
                            button_code += '</label>';

                            if (last_inserted_button && last_inserted_button.length) {
                                last_inserted_button = $(button_code).insertAfter(last_inserted_button);
                            }
                            else {
                                last_inserted_button = $(button_code).prependTo($("#onionoo_charts"));
                            }
                        }
                        else {
                            last_inserted_button = $('#' + key);
                        }
                    }
                    else {
                        if ($('#' + key).length) {
                            $('#' + key).remove();
                        }
                    }
                }
            }
        }

        if (last_inserted_button && last_inserted_button.length) {
            $('#onionoo_more').removeAttr('disabled');
        }
        else {
            $('#moreBandwidth').collapse('hide');
            $('#onionoo_more').attr('disabled', 'disabled');
        }
    }

    $("#oo_collapse").collapse('show');

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

function handle_window_error(message, url, linenumber)
{
    console.log("Error: " + message);
}

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


    // to alter the More / Less - Button for Onionoo-Charts
    $('#moreBandwidth').on('hidden.bs.collapse', function () {
        $('#onionoo_more').html("More <span class='caret'></span>");
        $('#onionoo_more').attr('data-state', 'more');
    })

    $('#moreBandwidth').on('shown.bs.collapse', function () {
        $('#onionoo_more').html("Less <span class='caret caret-reversed'></span>");
        $('#onionoo_more').attr('data-state', 'less');
    })

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
    if (selector == bandwidth_shows) { return; }

    // first we ensure that the GUI looks nice:
    $( ".box_chart_button" ).each(function( index ) {
        if ($(this).attr('id') != selector) {
            $(this).removeClass("active");
            $(this).prop("checked", false);
        }
    });

    // now switch the chart displays
    if (selector == 'hd')
    {
        bandwidth_read.options.millisPerPixel = 500
        bandwidth_read.options.grid.millisPerLine = 60000
        bandwidth_written.options.millisPerPixel = 500
        bandwidth_written.options.grid.millisPerLine = 60000

        bandwidth_read.removeAllTimeSeries();
        bandwidth_written.removeAllTimeSeries();

        bandwidth_read.addTimeSeries(read_data_hd, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
        bandwidth_written.addTimeSeries(written_data_hd, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});

        bandwidth_read.options.timestampFormatter = chart_format_timestamp;
        bandwidth_written.options.timestampFormatter = chart_format_timestamp;
    }

    else if (selector == 'ld')
    {
        bandwidth_read.options.millisPerPixel = 30000
        bandwidth_read.options.grid.millisPerLine = 3600000
        bandwidth_written.options.millisPerPixel = 30000
        bandwidth_written.options.grid.millisPerLine = 3600000

        bandwidth_read.removeAllTimeSeries();
        bandwidth_written.removeAllTimeSeries();

        bandwidth_read.addTimeSeries(read_data_ld, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
        bandwidth_written.addTimeSeries(written_data_ld, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});

        bandwidth_read.options.timestampFormatter = chart_format_timestamp_LD;
        bandwidth_written.options.timestampFormatter = chart_format_timestamp_LD;
    }

    else if (selector == 'm1')
    {
        bandwidth_read.options.millisPerPixel = 3600000     // 1px/h
        bandwidth_read.options.grid.millisPerLine = 86400000
        bandwidth_written.options.millisPerPixel = 3600000
        bandwidth_written.options.grid.millisPerLine = 86400000

        bandwidth_read.removeAllTimeSeries();
        bandwidth_written.removeAllTimeSeries();

        var wh = written_data_history['m1'];
        var rh = read_data_history['m1'];

        bandwidth_read.addTimeSeries(rh, {lineWidth:1,strokeStyle:'rgb(0, 0, 153)',fillStyle:'rgba(0, 0, 153, 0.30)'});
        bandwidth_written.addTimeSeries(wh, {lineWidth:1,strokeStyle:'rgb(0, 0, 153)',fillStyle:'rgba(0, 0, 153, 0.30)'});

        bandwidth_read.options.timestampFormatter = null;
        bandwidth_written.options.timestampFormatter = null;

        bandwidth_read.options.timestampFormatter = chart_format_day;
        bandwidth_written.options.timestampFormatter = chart_format_day;

    }

    else if (selector == 'm3')
    {
        bandwidth_read.options.millisPerPixel = 3600000
        bandwidth_read.options.grid.millisPerLine = 86400000
        bandwidth_written.options.millisPerPixel = 3600000
        bandwidth_written.options.grid.millisPerLine = 86400000

        bandwidth_read.removeAllTimeSeries();
        bandwidth_written.removeAllTimeSeries();

        var wh = written_data_history['m3'];
        var rh = read_data_history['m3'];

        bandwidth_read.addTimeSeries(rh, {lineWidth:1,strokeStyle:'rgb(0, 0, 153)',fillStyle:'rgba(0, 0, 153, 0.30)'});
        bandwidth_written.addTimeSeries(wh, {lineWidth:1,strokeStyle:'rgb(0, 0, 153)',fillStyle:'rgba(0, 0, 153, 0.30)'});

        bandwidth_read.options.timestampFormatter = null;
        bandwidth_written.options.timestampFormatter = null;

        bandwidth_read.options.timestampFormatter = chart_format_day;
        bandwidth_written.options.timestampFormatter = chart_format_day;

    }

    else if (selector == 'all')
    {
        bandwidth_read.options.millisPerPixel = 14400000    // 4 hours
        bandwidth_read.options.grid.millisPerLine = 2678400000 // one month
        bandwidth_written.options.millisPerPixel = 14400000
        bandwidth_written.options.grid.millisPerLine = 2678400000

        bandwidth_read.removeAllTimeSeries();
        bandwidth_written.removeAllTimeSeries();

        bandwidth_read.addTimeSeries(read_data_history, {lineWidth:1,strokeStyle:'rgb(0, 0, 153)',fillStyle:'rgba(0, 0, 153, 0.30)'});
        bandwidth_written.addTimeSeries(written_data_history, {lineWidth:1,strokeStyle:'rgb(0, 0, 153)',fillStyle:'rgba(0, 0, 153, 0.30)'});

        bandwidth_read.options.timestampFormatter = null;
        bandwidth_written.options.timestampFormatter = null;
    }



    bandwidth_shows = selector;
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
    date_value = new Date(date_value);

    var out = "%04d".$(date_value.getFullYear());
    out += "-" + "%02d".$(date_value.getMonth() + 1);
    out += "-" + "%02d".$(date_value.getDate());
    out += " " + "%02d".$(date_value.getHours());
    out += ":" + "%02d".$(date_value.getMinutes());
    out += ":" + "%02d".$(date_value.getSeconds());

    return out;
}


</script>