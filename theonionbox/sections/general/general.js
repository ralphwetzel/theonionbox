%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

% host = get('host')
% import psutil
% cpu_count = psutil.cpu_count()

function general_handler() {};
general_handler.prototype = new DataHandler();
general_handler.prototype.process = function(data, timedelta) {

    for (data_point in data) {
        var timestamp = data[data_point].s + timedelta;
        data[data_point].s = timestamp;

        % for count in range(cpu_count):
            proc_data_{{count}}.append(timestamp, data[data_point].c{{count}});
        % end
        mem_data.append(timestamp, data[data_point].mp);

        % if host['temp']:
            if (data[data_point].t) {
                temp_data.append(timestamp, data[data_point].t);
            }
        % end
    }

    general_plyr_cpu.append(data);
    general_plyr_mem.append(data);

    % if host['temp']:
        general_plyr_temp.append(data);
    % end

};

general_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

general_handler.prototype.nav = function() {
    return 'General Information';
};

function general_play_temp(data) {
    $('#general_temp_current').text("Currently: " + Math.round(data.t) + '°C');
}
var general_plyr_temp = new boxDataPlayer(general_play_temp, 5000, 's');

function general_play_mem(data) {
    $('#general_mem_current').text("Currently: " + Math.round(data.mp) + '%');
}
var general_plyr_mem = new boxDataPlayer(general_play_mem, 5000, 's');

function general_play_cpu(data) {
    $('#general_cpu_current').text("Currently: " + Math.round(data.c) + '%');
}
var general_plyr_cpu = new boxDataPlayer(general_play_cpu, 5000, 's');


$(document).ready(function() {
    addNavBarButton('General Information', 'host')
    boxData.addHandler('gen', new general_handler());
    general_plyr_temp.start();
    general_plyr_mem.start();
});

%# // 2: Processor & Memory Load

var proc_style = {
    millisPerPixel: 500,
    // maxValueScale: 2,
    // minValueScale: 2,
    maxDataSetLength: 1000,     // TBC: is this ok for all use cases??
    interpolation: 'step',
    maxValue: 100,
    minValue: 0,

    yMaxFormatter: function() {return ''; },
    yMinFormatter: function() {return ''; },
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
    var chart_processor_{{count}} = new boxChart(proc_style);
% end

var mem_data = new TimeSeries();
var chart_mem = new boxChart(proc_style);

% if host['temp']:
    var temp_data = new TimeSeries();
    var chart_temp = new boxChart(proc_style);
% end

$(document).ready(function() {

    % for count in range(cpu_count):
        var plc{{count}} = new boxCanvas($('#processor_load_{{count}}'));
    % end

    var meml = new boxCanvas($('#mem_load'));

    var client_time = new Date().getTime();

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

    % if host['temp']:
        var tempc = new boxCanvas($('#temp'));
        temp_data.append(client_time - 5000, 0);
        canvas = document.getElementById('temp');
        chart_temp.addTimeSeries(temp_data, {lineWidth:1,strokeStyle:'rgb(255, 0, 0)',fillStyle:'rgba(255, 0, 0, 0.15)'});
        chart_temp.streamTo(canvas, 5000);
    % end

});