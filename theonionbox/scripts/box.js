%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

%# // includes here!
<script type="text/javascript" src=/{{session_id}}/{{jquery_lib}}></script>
<script type="text/javascript" src=/{{session_id}}/{{bootstrap_js}}></script>

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

function chart_format_DayMonth(date)
{
    function pad2(number) { return (number < 10 ? '0' : '') + number }
    return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
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
    yMaxFormatter: function(data, precision) {
        if (!precision) {
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; },
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


var consensus_weight = new box_chart(bandwidth_style);
var consensus_weight_fraction = new box_chart(bandwidth_style);

var history_series_options = {
    dontDropOldData: true
}

var written_data_history = [];
var read_data_history = [];
var ltd_written_history = [];
var ltd_read_history = [];

var consensus_weight_data_history = [];
var consensus_weight_fraction_history = [];
var exit_probability_history = [];
var middle_probability_history = [];
var guard_probability_history = [];

var history_chart_keys = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];
var history_chart_labels = ['3 Days', '1 Week', '1 Month', '3 Months', '1 Year', '5 Years'];

for (len = history_chart_keys.length, i=0; i<len; ++i) {
    if (i in history_chart_keys) {
        written_data_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        read_data_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        ltd_written_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        ltd_read_history[history_chart_keys[i]] = new box_timeseries(history_series_options);

        consensus_weight_data_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        consensus_weight_fraction_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        exit_probability_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        middle_probability_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
        guard_probability_history[history_chart_keys[i]] = new box_timeseries(history_series_options);
    }
}


// Display Styles setzen
function pad2(number) { return (number < 10 ? '0' : '') + number }
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
            var precision = 2;
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
            var precision = 2;
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
            var precision = 2;
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
            var precision = 2;
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
            var precision = 2;
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
            var precision = 2;
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
            var precision = 2;
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
        return pad2(date.getDate()) + "." + pad2(date.getMonth() + 1) + "." ;
    },
    yMaxFormatter: function(data, precision) {
        if (!precision) {
            var precision = 2;
        }
        return (prettyNumber(data, '', 'si') + '/s');
    },
    yMinFormatter: function() { return ""; }
}


var bw_style = {};

// HD = Minutes
bw_style.hd = {};
bw_style.hd.r = {
    chartOptions: chart_style.hd,
    timeseries: [ {
        serie: read_data_hd,
        options: {
            lineWidth:1,
            strokeStyle:'#64B22B',
            fillStyle:'rgba(100, 178, 43, 0.30)'
        }
    } ]
};
bw_style.hd.w = {
    chartOptions: chart_style.hd,
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
    chartOptions: chart_style.ld,
    timeseries: [ {
        serie: read_data_ld,
        options: {
            lineWidth:1,
            strokeStyle:'#64B22B',
            fillStyle:'rgba(100, 178, 43, 0.30)'
        }
    } ]
};
bw_style.ld.w = {
    chartOptions: chart_style.ld,
    timeseries: [ {
        serie: written_data_ld,
        options: {
            lineWidth:1,
            strokeStyle:'rgb(132, 54, 187)',
            fillStyle:'rgba(132, 54, 187, 0.30)'
        }
    } ]
};

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
    bandwidth_read.streamTo(canvas, 5000);
    bandwidth_read.setDisplay(bw_style.hd.r);

    canvas = document.getElementById('smoothie-chart-written');
    bandwidth_written.streamTo(canvas, 5000);
    bandwidth_written.setDisplay(bw_style.hd.w);

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

    canvas = document.getElementById('chart-cw');
    consensus_weight.streamTo(canvas, 5000);

    canvas = document.getElementById('chart-cwf');
    consensus_weight_fraction.streamTo(canvas, 5000);

    // set_consensus_display('m1');

}


%# // page initialisation


%# // server communication & data display

var pull_timer;
var stop_timer;

var bandwidth_shows = 'hd';

var bandwidth_player;
var messages_player;

var pull_error_counter = 0;

function pull_error(jqXHR, textStatus, errorThrown)
{
    if (jqXHR.status == 404 | jqXHR.status == 500) {
        window.location.href = "/{{session_id}}/logout.html";
    }
    else if (textStatus == 'error' && jqXHR.status == 0 && jqXHR.readyState == 0) {

        pull_error_counter += 1;

        if (pull_error_counter > 2) {
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
    }
    else {
        console.log('error: ' + jqXHR.status);
    }
}

function process_livedata(json_text)
{
    var json_data = JSON.parse(json_text);
    var client_delta = 0

    pull_error_counter = 0;

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
            read_data_ld.append(data[data_point].m, data[data_point].r / 60);
            written_data_ld.append(data[data_point].m, data[data_point].w / 60);
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

    if (json_data && json_data.ltd)
    {
        update_ltd(json_data.ltd, true)
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

    var runlevel_box = LogBox.json();
    if (runlevel_box.length > 0)
    {
        action += "&box=" + runlevel_box;
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
    // ajax_settings.success = update_onionoo;
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

    // console.log(json_data.timestamp + " " + format_date(json_data.timestamp));

    var txt = '';
    if (json_data.running == true) {
        txt = 'True | since ' + format_date(json_data.last_restarted);
    } else {
        txt = 'False | Last seen ' + json_data.last_seen;
        txt += json_data.hibernating ? ' | Hibernation mode is activated.' : ''
    }
    $('#network_running').text(txt);

    var to_percent = function(value) {
        if (value == 0) {
            return 0;
        }

        value *= 100;
        var retval = value.toFixed(-Math.floor(Math.log10(Math.abs(value))) + 1);
        return retval;
    }

    txt = "Current: <span style='color: #EDC240'>" + 'Middle ' + to_percent(json_data.mp) + '%</span>'
    txt += " | <span style='color: #4CA74C'>" + 'Exit ' + to_percent(json_data.ep) + '%</span>'
    txt += " | <span style='color: #CB4B4B'>" + 'Guard ' + to_percent(json_data.gp) + '%</span>'
    txt += " | <span style='color: #AFD8F8'>" + 'Consensus Weight Fraction ' + to_percent(json_data.cwf) + '%</span>'
    $('#network_probabilities').html(txt);

    txt = "Current: <span style='color: #000099'>" + 'Consensus Weight ' + json_data.consensus_weight + '</span>'
    $('#network_consensus_weight').html(txt);

    $('#network_bandwidth').text('Advertised: ' + prettyNumber(json_data.advertised_bandwidth, '', 'si') + '/s');

    txt = 'Rate: ' + prettyNumber(json_data.bandwidth_rate, '', 'si') + '/s';
    txt += ' | Burst: ' + prettyNumber(json_data.bandwidth_burst, '', 'si') + '/s';
    txt += ' | Observed: ' + prettyNumber(json_data.observed_bandwidth, '', 'si') + '/s';
    $('#network_bandwidth_more').text(txt);

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
            $('#moreBandwidth').collapse('show');
        }
        else {
            $('#moreBandwidth').collapse('hide');
            if (!(bandwidth_shows == 'hd' | bandwidth_shows == 'ld')) {
                set_download_display('hd');
            }

        }
    }

    if (json_data && json_data.weights) {

        var json_weights = json_data.weights;

        var buttons_inserted = 0;
        var last_inserted_button = null;

        for (len = history_chart_keys.length, i=0; i<len; ++i) {

            if (i in history_chart_keys) {

                var key = history_chart_keys[i];

                // console.log(key + "?")

                if (json_weights && json_weights[key]) {

                    // console.log(key + "!")

                    var insert_button = false;

                    if (json_weights[key].cw) {
                        consensus_weight_data_history[key].data = json_weights[key].cw;
                        consensus_weight_data_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (json_weights[key].cwf) {
                        consensus_weight_fraction_history[key].data = json_weights[key].cwf;
                        consensus_weight_fraction_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (json_weights[key].ep) {
                        exit_probability_history[key].data = json_weights[key].ep;
                        exit_probability_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (json_weights[key].mp) {
                        middle_probability_history[key].data = json_weights[key].mp;
                        middle_probability_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (json_weights[key].gp) {
                        guard_probability_history[key].data = json_weights[key].gp;
                        guard_probability_history[key].resetBounds();
                        insert_button = true;
                    }

                    if (insert_button) {
                        if (!$('#cw_' + key).length) {

                            button_code = '<label id=\"cw_' + key + '\"';
                            button_code += ' class=\"btn btn-default';
                            if (consensus_shows == key) {
                                button_code += ' active';
                            }
                            button_code += ' box_chart_button\"';
                            button_code += ' onclick=\"set_consensus_display(\'' + key + '\')\">';
                            button_code += '<input type=\"radio\" autocomplete=\"off\" value=\"' + key + '\">';
                            button_code += history_chart_labels[i];
                            button_code += '</label>';

                            if (last_inserted_button && last_inserted_button.length) {
                                last_inserted_button = $(button_code).insertAfter(last_inserted_button);
                            }
                            else {
                                last_inserted_button = $(button_code).prependTo($("#consensus_charts"));
                            }
                        }
                        else {
                            last_inserted_button = $('#cw_' + key);
                        }
                    }
                    else {
                        if ($('#cw_' + key).length) {
                            $('#cw_' + key).remove();
                        }
                    }
                }
            }

            $('.cc_collapse').on('shown.bs.collapse', function () {
                $(window).trigger('resize');
                })

        }

        if (last_inserted_button && last_inserted_button.length) {
            $('.cc_collapse').collapse('show');
        }

        if (consensus_shows == '' && last_inserted_button && last_inserted_button.length) {
            last_inserted_button.click();
        } else {
            var cb = $('#cw_' + consensus_shows);
            if (!cb || !cb.length) {
                if (last_inserted_button && last_inserted_button.length) {
                    last_inserted_button.click();
                }
            } else {
                cb.click();
            }
        }

        // safety procedure!
        if (!$("#consensus_charts label.active input")) {
            for (len = history_chart_keys.length, i=len; i>0; --i) {
                btn = "cw_" + history_chart_keys[i-1];
                if ($("btn").length) {
                    $("btn").click();
                }
            }
        }

/*
        if (last_inserted_button && last_inserted_button.length) {
            $('#moreConsensus').collapse('show');
        }
        else {
            $('#moreConsensus').collapse('hide');
            if (!(bandwidth_shows == 'hd' | bandwidth_shows == 'ld')) {
                set_download_display('hd');
            }

        }
*/
        $("#oo_collapse").collapse('show');
        if (!$("#oo_network").length) {
            $("#oo_after").after($('<li id="oo_network" style="font-size: 15px;"><a href="#network">Network Status</a></li>'));
        }
    }

}


function update_ltd(json_data)
{
    for (len = history_chart_keys.length, i=0; i<len; ++i) {

        if (i in history_chart_keys) {

            var key = history_chart_keys[i];

            if (json_data && json_data[key]) {

                if (json_data[key].w) {
                    ltd_written_history[key].data = json_data[key].w
                    ltd_written_history[key].resetBounds();
                }

                if (json_data[key].r) {
                    ltd_read_history[key].data = json_data[key].w
                    ltd_read_history[key].resetBounds();
                }
            }
        }
    }
}


function log(message, timestamp, runlevel)
{
    var runlevel_translate = {
        'BOX|DEBUG': 'BOX_DEBUG',
        'BOX|INFO': 'BOX_INFO',
        'BOX|NOTICE': 'BOX',
        'BOX|WARN': 'BOX_WARN',
        'BOX|ERR': 'BOX_ERR',
    }

    if (!message) { return;}
    if (!timestamp)
        { timestamp = new Date();}
    else
        { timestamp = new Date(timestamp);}

    if (!runlevel) { runlevel = 'THIS';}

    var runlevel_class = runlevel;
    var runlevel_display = runlevel;
    if (runlevel_translate[runlevel]) {
        runlevel_class = runlevel_translate[runlevel];
    }

    if (runlevel_display == 'BOX|NOTICE') {
        runlevel_display = 'BOX';
    }

    var log_msg = "<tr class='%s'><td class='box_Log_runlevel'>[%s]</td>".$(runlevel_class, runlevel_display);
    log_msg += "<td nowrap class='box_Log_stamp'>" + format_time(timestamp) + "</td>";
    log_msg += '<td>' + message + '</td></tr>';

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

var cw;
var cwf;

$(document).ready( function(){

    var scR = new box_canvas($('#smoothie-chart-read'));
    var scW = new box_canvas($('#smoothie-chart-written'));

    % for count in range(cpu_count):
        var plc{{count}} = new box_canvas($('#processor_load_{{count}}'));
    % end

    var meml = new box_canvas($('#mem_load'));

    cw = new box_canvas($('#chart-cw'));
    cwf = new box_canvas($('#chart-cwf'));


    $('#bw_down').text("Total: " + prettyNumber({{read_bytes}}, '', 'si') + " | Current: " + prettyNumber(0, '', 'si') + '/s');
    $('#bw_up').text("Total: " + prettyNumber({{written_bytes}}, '', 'si') + " | Current: " + prettyNumber(0, '', 'si') + '/s');

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();


    // to alter the More / Less - Button for Onionoo-Charts
/*
    $('#moreBandwidth').on('hidden.bs.collapse', function () {
        $('#onionoo_more').html("More <span class='caret'></span>");
        $('#onionoo_more').attr('data-state', 'more');
    })

    $('#moreBandwidth').on('shown.bs.collapse', function () {
        $('#onionoo_more').html("Less <span class='caret caret-reversed'></span>");
        $('#onionoo_more').attr('data-state', 'less');
    })
*/

    // toggle the carets
    enable_caret('#onionoo_bw', 'Bandwidth', '#more_onionoo_bw');

    % if box_debug == True:
        enable_caret('#show_box_messages', 'Level', '#box_message_selectors');
    % end

    enable_caret('#show_consensus_charts', 'Consensus Weight', '#moreConsensus');

});


function enable_caret(element_id, element_text, collape_element_id) {

    $(collape_element_id).on('hidden.bs.collapse', function () {
        $(element_id).html("<span class='caret'></span> " + element_text);
    })

    $(collape_element_id).on('shown.bs.collapse', function () {
        $(element_id).html("<span class='caret caret-reversed'></span> " + element_text);
    })
}


// var LogList;
var LogStatus;
var LogBox;

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
    LogBox = new box_LogSelector();

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

$(".box_messages").on('click', function () {
    var key = $(this).data("severity");

    LogBox.set(key, !LogBox.get(key));
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

    var charts = ['hd', 'ld', 'd3', 'w1', 'm1', 'm3', 'y1', 'y5'];

    if ($.inArray(selector, charts) > -1) {
        if (selector == 'hd' || selector == 'ld') {
            bandwidth_read.setDisplay(bw_style[selector].r);
            bandwidth_written.setDisplay(bw_style[selector].w);
        }
        else {

            s = selector;

            var style_r = {
                chartOptions: chart_style[s],
                timeseries: [ {
                    serie: read_data_history[s],
                    options: {
                        lineWidth:1,
                        strokeStyle:'rgb(0, 0, 153)',
                        fillStyle:'rgba(0, 0, 153, 0.30)'
                    }
                }, {
                    serie: ltd_read_history[s],
                    options: {
                        lineWidth:1,
                        strokeStyle:'#64B22B',
                        // fillStyle:'rgba(0, 0, 153, 0.30)'
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
                        fillStyle:'rgba(0, 0, 153, 0.30)'
                    }
                }, {
                    serie: ltd_written_history[s],
                    options: {
                        lineWidth:1,
                        strokeStyle:'rgb(132, 54, 187)',
                        // fillStyle:'rgba(0, 0, 153, 0.30)'
                    }
                } ]
            };

            bandwidth_read.setDisplay(style_r);
            bandwidth_written.setDisplay(style_w);
        }
        bandwidth_shows = selector;
    }
}

var consensus_shows = '';
function set_consensus_display(selector)
{
    console.log('CC: ' + selector);

    var charts = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];
    if ($.inArray(selector, charts) < 0) { return False; }

    var s = selector;

    // to ensure that the correct button is always shown 'pressed'
    $('cw_' + s).addClass('active');

    if (s == consensus_shows) { return; }

    var style_cw = {
        chartOptions: chart_style[s],
        timeseries: [ {
            serie: consensus_weight_data_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(0, 0, 153)',
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            }
        } ]
    };

//        console.log(consensus_weight_fraction_history[s]);

    var style_cwf = {
        chartOptions: chart_style[s],
        timeseries: [{
            serie: guard_probability_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(203, 75, 75)',
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }, {
            serie: middle_probability_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(237, 194, 64)',
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }, {
            serie: consensus_weight_fraction_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(175, 216, 248)',
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }, {
            serie: exit_probability_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(76, 167, 76)',
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }
        ]
    };

    consensus_weight.setDisplay(style_cw);
    consensus_weight.options.yMaxFormatter = function(data, precision) { return parseInt(data); };

    consensus_weight_fraction.setDisplay(style_cwf);
    consensus_weight_fraction.options.yMaxFormatter = function(data, precision) {
        if (data == 0) { return "0 %"; }
        data *= 100;
        var retval = data.toFixed(-Math.floor(Math.log10(Math.abs(data))) + 1);
        return retval + " %";
    };
    consensus_weight_fraction.options.grid.fillStyle = '#FFFFFF',
    consensus_shows = selector;

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

function format_time(date_value)
{
    date_value = new Date(date_value);

    var out = "%02d".$(date_value.getHours());
    out += ":" + "%02d".$(date_value.getMinutes());
    out += ":" + "%02d".$(date_value.getSeconds());

    return out;
}


</script>