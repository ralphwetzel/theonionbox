%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!


<%
    oo_factory = get('oo_factory')
    family_fp = get('family_fp')

    # // get the family entries from the onionoo details of the node
    family_details = oo_factory.details(family_fp)
    # // there are several different categories of families
    fams = ['effective_family', 'alleged_family', 'indirect_family']

    family_nodes = [] # list of fingerprints of the nodes [1:]

    # iterate through the categories
    for fam in fams:
        # get the nodes per category
        fam_det = family_details(fam)
        if fam_det is not None:
            # iterate through the nodes
            for fp in fam_det:
                # // onionoo protocol v5.0 adaptation
                family_nodes.append(fp[1:] if fp[0] is '$' else fp)
            end
        end
    end

    has_family = len(family_nodes) > 0
%>


function family_handler() {}

family_handler.prototype = new DataHandler();


family_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

family_handler.prototype.nav = function() {
    return 'General Information';
};

var family_series_options = {
    dontDropOldData: true
};

// to be prepared
var family_nodes = [
    % for index, node in enumerate(family_nodes):
        % if index > 0:
            , '{{!node}}'
        % else:
            '{{node}}'
        %end
    % end
];

var written_data_family = {};
var read_data_family = {};
var family_charts = [];
var family_canvas = [];

for (var len_nodes = family_nodes.length, k=0; k<len_nodes; ++k) {
    console.log('node: ' + family_nodes[k])
    written_data_family[family_nodes[k]] = {};
    read_data_family[family_nodes[k]] = {};
    for (var len = history_chart_keys.length, i=0; i<len; ++i) {
        if (i in history_chart_keys) {
            written_data_family[family_nodes[k]][history_chart_keys[i]] = new boxTimeSeries(history_series_options);
            read_data_family[family_nodes[k]][history_chart_keys[i]] = new boxTimeSeries(history_series_options);
        }
    }

    family_charts[family_nodes[k] + '-read'] = new boxChart(oobw_style);
    family_charts[family_nodes[k] + '-write'] = new boxChart(oobw_style);
}

var family_shows = '';

$(document).ready(function() {
    addNavBarButton('Family Performance', 'family');
    var fc_watchers = [];

    % if has_family is True:

        boxData.addHandler('oo_family', new family_handler());

        // var canvas;
        for (var len = family_nodes.length, k=0; k<len; ++k) {
            var node = family_nodes[k];

            console.log(node);

            var canvas = document.getElementById('FMLY' + node + '-read');
            family_charts[node + '-read'].prepare(canvas, 5000);

            fc_watchers[node + '-read'] = scrollMonitor.create(canvas, 100);
            fc_watchers[node + '-read'].enterViewport(family_start_redering(node + '-read'));
            fc_watchers[node + '-read'].exitViewport(family_stop_redering(node + '-read'));

            
            var canvas = document.getElementById('FMLY' + node + '-write');
            family_charts[node + '-write'].prepare(canvas, 5000);

            fc_watchers[node + '-write'] = scrollMonitor.create(canvas, 100);
            fc_watchers[node + '-write'].enterViewport(family_start_redering(node + '-write'));
            fc_watchers[node + '-write'].exitViewport(family_stop_redering(node + '-write'));
        }
    % end
});

function family_start_redering(chart_index) {
    var this_index = chart_index;
    return function() {
        console.log(this_index);
        family_charts[this_index].start();
    }
}

function family_stop_redering(chart_index) {
    var this_index = chart_index;
    return function() {
        console.log(this_index);
        family_charts[this_index].stop();
    }
}



family_handler.prototype.process = function(family_data, timedelta) {

% if has_family is True:

    // # console.log(data);

    var last_inserted_button = null;
    var new_show_key = family_shows;

    // console.log(family_data);

    var family_buttons = new Object();

    for (var len = history_chart_keys.length, i = 0; i < len; ++i) {
        family_buttons[history_chart_keys[i]] = false;
    }

    // console.log(family_buttons);

    for (var fam_len = family_nodes.length, k=0; k<fam_len; ++k) {

        var node = family_nodes[k];

        var last_key_read = '';
        var last_key_write = '';

        if (family_data[node]) {

            var data = family_data[node];

            for (var len = history_chart_keys.length, i = 0; i < len; ++i) {

                if (i in history_chart_keys) {

                    var key = history_chart_keys[i];
                    var insert_button = false;

                    if (data.read[key] && data.read[key].length > 0) {

                        var result = [];

                        if (last_key_read != '') {
                            var first_time = data.read[key][0][0];
                            var check_time = read_data_family[node][last_key_read].data[0][0];
                            var check_index = 0;

                            while (check_time < first_time) {
                                result.push(read_data_family[node][last_key_read].data[check_index]);
                                ++check_index;
                                check_time = read_data_family[node][last_key_read].data[check_index][0];
                            }
                        }

                        read_data_family[node][key].data = result.concat(data.read[key]);
                        read_data_family[node][key].resetBounds();
                        last_key_read = key;
                        insert_button = true;
                    }

                    if (data.write[key] && data.write[key].length > 0) {

                        var result = [];

                        if (last_key_write !== '') {
                            var first_time = data.write[key][0][0];
                            var check_time = written_data_family[node][last_key_write].data[0][0];
                            var check_index = 0;

                            while (check_time < first_time) {
                                result.push(written_data_family[node][last_key_write].data[check_index])
                                ++check_index;
                                check_time = written_data_family[node][last_key_write].data[check_index][0];
                            }
                        }

                        written_data_family[node][key].data = result.concat(data.write[key]);
                        written_data_family[node][key].resetBounds();
                        last_key_write = key;
                        insert_button = true;
                    }

                    if (insert_button === true) {
                        family_buttons[key] = true;
                    }
                }
            }
        }
    }

    // console.log(family_buttons);

    var last_inserted_button;

    for (var len = history_chart_keys.length, i = 0; i < len; ++i) {
        var key = history_chart_keys[i];
        if (family_buttons[key] === true) {
            if (!$('#family_' + key).length) {

                button_code = '<label id=\"family_' + key + '\"';
                button_code += ' class=\"btn btn-default box_chart_button\"';
                button_code += ' onclick=\"set_family_display(\'' + key + '\')\">';
                button_code += '<input type=\"radio\" autocomplete=\"off\">';
                button_code += history_chart_labels[i];
                button_code += '</label>';

                if (last_inserted_button && last_inserted_button.length) {
                    last_inserted_button = $(button_code).insertBefore(last_inserted_button);
                }
                else {
                    $("#family-charts").html('');
                    last_inserted_button = $(button_code).prependTo($("#family-charts"));
                    // $('#oobw_' + key).addClass('active');
                }
            }
            else {
                last_inserted_button = $('#family_' + key);
            }
            // Latest inserted key ( = first in row) will be shown!
            new_show_key = key;
        }
        else {
            if ($('#family_' + key).length) {
                $('#family_' + key).remove();
            }
        }
    }


    if (last_inserted_button && last_inserted_button.length) {
        last_inserted_button.addClass('active');
    }

    // change chart to display only if no or invalid selection
    if (family_shows === '' || family_shows !== '' && !$('#family_' + family_shows).length) {
        if (family_shows !== new_show_key) {
            set_family_display(new_show_key);
        }
    }

% end
};


function set_family_display(selector)
{
    if (selector === family_shows) { return; }

    var charts = ['d3', 'w1', 'm1', 'm3', 'y1', 'y5'];

    function get_best_data(data_family, slctor) {

        // console.log(data_family, slctor);

        var pos = charts.indexOf(slctor);
        var retval = [];

        while (pos >= 0) {
            if (data_family[charts[pos]].data.length > 0) {
                retval = data_family[charts[pos]];
                break;
            }
            --pos;
        }
        return retval;
    }


    for (var len = family_nodes.length, k=0; k<len; ++k) {

        var node = family_nodes[k];

        if ($.inArray(selector, charts) > -1) {
            s = selector;

            var style_r = {
                chartOptions: chart_style[s],
                timeseries: [ {
                    // serie: get_best_data(read_data_family[node],s),
                    serie: read_data_family[node][s],
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
                    // serie: get_best_data(written_data_family[node], s),
                    serie: written_data_family[node][s],
                    options: {
                        lineWidth:1,
                        strokeStyle:'rgb(0, 0, 153)',
                        fillStyle:'rgba(0, 0, 153, 0.30)',
                        nullTo0:true
                    }
                } ]
            };

            family_charts[node + '-read'].setDisplay(style_r);
            family_charts[node + '-write'].setDisplay(style_w);
        }

        family_shows = selector;
    }
}


% #// 'end' for 'if oo_show is True:'
% end