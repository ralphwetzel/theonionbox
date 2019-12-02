<%
    oo_weights = get('oo_weights') if oo_weights is None else oo_weights
    oo_details = get('oo_details') if oo_details is None else oo_details

%>

var weights_series_options = {
    dontDropOldData: true
};

var consensus_weight_data_history = [];
var consensus_weight_fraction_history = [];
var exit_probability_history = [];
var middle_probability_history = [];
var guard_probability_history = [];

// var history_chart_keys = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];
// var history_chart_keys = ['3_days', '1_week', '1_month', '3_months', '1_year', '5_years'];
// var history_chart_labels = ['3 Days', '1 Week', '1 Month', '3 Months', '1 Year', '5 Years'];

var weights_chart_keys = ['y5', 'y1', 'm6', 'm3', 'm1', 'w1', 'd3'];
var weights_chart_labels = ['5 Years', '1 Year', '6 Months', '3 Months', '1 Month', '1 Week', '3 Days'];


for (var len = weights_chart_keys.length, i=0; i<len; ++i) {
    if (i in weights_chart_keys) {
        consensus_weight_data_history[weights_chart_keys[i]] = new boxTimeSeries(weights_series_options);
        consensus_weight_fraction_history[weights_chart_keys[i]] = new boxTimeSeries(weights_series_options);
        exit_probability_history[weights_chart_keys[i]] = new boxTimeSeries(weights_series_options);
        middle_probability_history[weights_chart_keys[i]] = new boxTimeSeries(weights_series_options);
        guard_probability_history[weights_chart_keys[i]] = new boxTimeSeries(weights_series_options);
    }
}

var ooweights_style = {
    millisPerPixel: 500,
    maxValueScale: 1.1,
    minValueScale: 1.1,
    // maxDataSetLength: 5000,     // TBC: is this ok for all use cases??
    interpolation: 'step',
    yMaxFormatter: function(data, precision) {
        if (!precision) {
            precision = 2;
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
        fontFamily: 'LatoLatinWebLight',
        precision: 2
        }
    };

var consensus_weight = new boxChart(ooweights_style);
var consensus_weight_fraction = new boxChart(ooweights_style);
var oo_weights_shows = '';


function cw_handler() {}
cw_handler.prototype = new DataHandler();
cw_handler.prototype.process = function(data, timedelta) {

% if oo_details.has_data():

    var to_percent = function(value) {

        if (value === null || value === 0.0) {
            return 0;
        }

        value *= 100;
        // var unfixed = -Math.floor(Math.log10(Math.abs(value)));
        return sigFigs(value, 2);
    };

    txt = "Currently: <span style='color: #EDC240'>" + 'Middle ' + to_percent(data.data.mp) + '%</span>';
    txt += " | <span style='color: #4CA74C'>" + 'Exit ' + to_percent(data.data.ep) + '%</span>';
    txt += " | <span style='color: #CB4B4B'>" + 'Guard ' + to_percent(data.data.gp) + '%</span>';
    txt += " | <span style='color: #AFD8F8'>" + 'Consensus Weight Fraction ' + to_percent(data.data.cwf) + '%</span>';
    $('#network_probabilities').html(txt);

    txt = "Currently: <span style='color: #000099'>" + 'Consensus Weight ' + data.data.cw + '</span>';
    $('#network_consensus_weight').html(txt);

% end

% if oo_weights.has_data():

    var last_inserted_button = null;
    var new_show_key = oo_weights_shows;

    var last_key_cw = '';
    var last_key_cwf = '';
    var last_key_ep = '';
    var last_key_mp = '';
    var last_key_gp = '';

    for (var len = weights_chart_keys.length, i=0; i<len; ++i) {

        if (i in weights_chart_keys) {

            var key = weights_chart_keys[i];
            var insert_button = false;

            if (data.cw[key] && data.cw[key].length > 0) {

                var result = [];

                if (last_key_cw !== '') {
                    var first_time = data.cw[key][0][0];
                    var check_time = consensus_weight_data_history[last_key_cw].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(consensus_weight_data_history[last_key_cw].data[check_index]);
                        ++check_index;
                        check_time = consensus_weight_data_history[last_key_cw].data[check_index][0];
                    }
                }

                consensus_weight_data_history[key].data = result.concat(data.cw[key]);
                consensus_weight_data_history[key].resetBounds();
                consensus_weight_data_history[key].changed = true;

                last_key_cw = key;
                insert_button = true;
            }

            if (data.cwf[key] && data.cwf[key].length > 0) {
                //console.log("cwf: " + data.cwf[key].length)

                var result = [];

                if (last_key_cwf !== '') {
                    var first_time = data.cwf[key][0][0];
                    var check_time = consensus_weight_fraction_history[last_key_cwf].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(consensus_weight_fraction_history[last_key_cwf].data[check_index]);
                        ++check_index;
                        check_time = consensus_weight_fraction_history[last_key_cwf].data[check_index][0];
                    }
                }

                consensus_weight_fraction_history[key].data = result.concat(data.cwf[key]);
                consensus_weight_fraction_history[key].resetBounds();
                consensus_weight_fraction_history[key].changed = true;
                last_key_cwf = key;
                insert_button = true;
            }

            if (data.ep[key] && data.ep[key].length > 0) {

                var result = [];

                if (last_key_ep !== '') {
                    var first_time = data.ep[key][0][0];
                    var check_time = exit_probability_history[last_key_ep].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(exit_probability_history[last_key_ep].data[check_index]);
                        ++check_index;
                        check_time = exit_probability_history[last_key_ep].data[check_index][0];
                    }
                }

                exit_probability_history[key].data = result.concat(data.ep[key]);
                exit_probability_history[key].resetBounds();
                last_key_ep = key;
                insert_button = true;
            }

            if (data.mp[key] && data.mp[key].length > 0) {

                var result = [];

                if (last_key_mp !== '') {
                    var first_time = data.mp[key][0][0];
                    var check_time = middle_probability_history[last_key_mp].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(middle_probability_history[last_key_mp].data[check_index]);
                        ++check_index;
                        check_time = middle_probability_history[last_key_mp].data[check_index][0];
                    }
                }

                middle_probability_history[key].data = result.concat(data.mp[key]);
                middle_probability_history[key].resetBounds();
                middle_probability_history[key].changed = true;
                last_key_mp = key;
                insert_button = true;
            }

            if (data.gp[key] && data.gp[key].length > 0) {

                var result = [];

                if (last_key_gp !== '') {
                    var first_time = data.gp[key][0][0];
                    var check_time = guard_probability_history[last_key_gp].data[0][0];
                    var check_index = 0;

                    while (check_time < first_time) {
                        result.push(guard_probability_history[last_key_gp].data[check_index]);
                        ++check_index;
                        check_time = guard_probability_history[last_key_gp].data[check_index][0];
                    }
                }

                guard_probability_history[key].data = result.concat(data.gp[key]);
                guard_probability_history[key].resetBounds();
                guard_probability_history[key].changed = true;
                last_key_gp = key;
                insert_button = true;
            }

            if (insert_button) {
                if (!$('#cw_' + key).length) {

                    button_code = '<label id=\"cw_' + key + '\"';
                    button_code += ' class=\"btn btn-outline-secondary box_chart_button\"';
                    button_code += ' onclick=\"set_consensus_display(\'' + key + '\')\">';
                    button_code += '<input type=\"radio\" autocomplete=\"off\">';
                    button_code += weights_chart_labels[i];
                    button_code += '</label>';

                    if (last_inserted_button && last_inserted_button.length) {
                        last_inserted_button = $(button_code).insertBefore(last_inserted_button);
                    }
                    else {
                        $("#consensus_charts").html('');
                        last_inserted_button = $(button_code).prependTo($("#consensus_charts"));
                        // $('#oobw_' + key).addClass('active');
                    }
                }
                else {
                    last_inserted_button = $('#cw_' + key);
                }
                // Latest inserted key ( = first in row) will be shown!
                new_show_key = key;
            }
            else {
                if ($('#cw_' + key).length) {
                    $('#cw_' + key).remove();
                }
            }
        }
    }

    if (last_inserted_button && last_inserted_button.length) {
        last_inserted_button.addClass('active');
    }

    if (oo_weights_shows != new_show_key) {
        set_consensus_display(new_show_key);
    }

% end
};

cw_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

cw_handler.prototype.nav = function() {
    return 'Onionoo Network Data';
};

$(document).ready(function() {

    boxData.addHandler('oo_weights', new cw_handler());

    var canvas;

    canvas = document.getElementById('chart-cw');
    consensus_weight.prepare(canvas, 5000);

    var cw_watcher = scrollMonitor.create(canvas, 100);
    cw_watcher.enterViewport(function () {
        consensus_weight.start();
    });
    cw_watcher.exitViewport(function () {
        consensus_weight.stop();
    });

    canvas = document.getElementById('chart-cwf');
    consensus_weight_fraction.prepare(canvas, 5000);

    var cwf_watcher = scrollMonitor.create(canvas, 100);
    cwf_watcher.enterViewport(function () {
        consensus_weight_fraction.start();
    });
    cwf_watcher.exitViewport(function () {
        consensus_weight_fraction.stop();
    });

});

function set_consensus_display(selector)
{
    var charts = ['d3', 'w1', 'm1', 'm3', 'm6', 'y1', 'y5'];
    if ($.inArray(selector, charts) < 0) { return False; }

    var s = selector;

    // to ensure that the correct button is always shown 'pressed'
    $('cw_' + s).addClass('active');

    if (s == oo_weights_shows) { return; }


    var style_cw = {
        chartOptions: chart_style[s],
        timeseries: [ {
            serie: consensus_weight_data_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(0, 0, 153)',
                nullTo0:false
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
                nullTo0:false
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }, {
            serie: middle_probability_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(237, 194, 64)',
                nullTo0:false
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }, {
            serie: consensus_weight_fraction_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(175, 216, 248)',
                nullTo0:false
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }, {
            serie: exit_probability_history[s],
            options: {
                lineWidth:1,
                strokeStyle:'rgb(76, 167, 76)',
                nullTo0:false
                // fillStyle:'rgba(0, 0, 153, 0.30)'
            } }
        ]
    };

    consensus_weight.setDisplay(style_cw);
    consensus_weight.options.yMaxFormatter = function(data, precision) { return parseInt(data); };

    consensus_weight_fraction.setDisplay(style_cwf);
    consensus_weight_fraction.options.yMaxFormatter = function(data, precision) {

        if (data === 0) { return "0%"; }

        // https://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function
        precision = typeof precision !== 'undefined' ? precision : 2;
        data *= 100;

        return sigFigs(data, precision) + "%";
    };
    consensus_weight_fraction.options.grid.fillStyle = '#FFFFFF';
    oo_weights_shows = selector;

    // console.log(consensus_weight);
    // console.log(consensus_weight_fraction);

}
