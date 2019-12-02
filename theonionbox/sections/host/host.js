%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

% host = get('host')
% import psutil
% cpu_count = psutil.cpu_count()

function general_handler() {}

general_handler.prototype = new DataHandler();
general_handler.prototype.process = function(data, timedelta) {

    for (var data_point in data) {
        var timestamp = data[data_point].s + timedelta;
        data[data_point].s = timestamp;

        proc_data_0.append(timestamp, data[data_point].c);

        % for count in range(cpu_count):
            proc_data_{{count+1}}.append(timestamp, data[data_point].c{{count}});
        % end
        mem_data.append(timestamp, data[data_point].mp);

        % if host.temperature:
            if (data[data_point].t) {
                temp_data.append(timestamp, data[data_point].t);
            }
        % end
    }

    general_plyr_cpu.append(data);
    general_plyr_mem.append(data);

    % if host.temperature:
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
    addNavBarButton('General Information', 'host');
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

    yMaxFormatter: function(max, precision) { return parseInt(max) + "%"},
    yMinFormatter: function() {return ''; },
    enableDpiScaling: true,
    grid:
        {
        fillStyle: '#E6E6E6',
        strokeStyle: '#777777',
        millisPerLine: 60000,
        verticalSections: 4,
        borderVisible: true
        },
    labels: {
        fillStyle: '#000000',
        disabled: false,
        fontSize: 10,
        fontFamily: 'LatoLatinWebLight',
        precision: 0
        }
    };

var temp_style = {
    millisPerPixel: 500,
    // maxValueScale: 2,
    // minValueScale: 2,
    maxDataSetLength: 1000,     // TBC: is this ok for all use cases??
    interpolation: 'step',
    maxValue: 100,
    minValue: 0,

    yMaxFormatter: function(max, precision) { return parseInt(max) + "°"},
    yMinFormatter: function() {return ''; },
    enableDpiScaling: true,
    grid:
        {
        fillStyle: '#E6E6E6',
        strokeStyle: '#777777',
        millisPerLine: 60000,
        verticalSections: 4,
        borderVisible: true
        },
    labels: {
        fillStyle: '#000000',
        disabled: false,
        fontSize: 10,
        fontFamily: 'LatoLatinWebLight',
        precision: 0
        }
    };

%  for count in range(cpu_count + 1):
    var proc_data_{{count}} = new TimeSeries();
    var chart_processor_{{count}} = new boxChart(proc_style);
% end

var mem_data = new TimeSeries();
var chart_mem = new boxChart(proc_style);

% if host.temperature:
    var temp_data = new TimeSeries();
    var chart_temp = new boxChart(temp_style);
% end

$(document).ready(function() {

    var client_time = new Date().getTime();

    %  for count in range(cpu_count + 1):
        proc_data_{{count}}.append(client_time - 5000, 0);
        canvas = document.getElementById('processor_load_{{count}}');
        chart_processor_{{count}}.addTimeSeries(proc_data_{{count}}, {lineWidth:1,strokeStyle:'#64B22B',fillStyle:'rgba(100, 178, 43, 0.30)'});
        % if count > 0:
            chart_processor_{{count}}.prepare(canvas, 5000);

        % else:
            chart_processor_{{count}}.prepare(canvas, 5000);

            var cp_watcher_{{count}} = scrollMonitor.create(canvas, 100);
            cp_watcher_{{count}}.enterViewport(function () {
                chart_processor_{{count}}.start();
            });
            cp_watcher_{{count}}.exitViewport(function () {
                chart_processor_{{count}}.stop();
            });

        % end
    % end

    mem_data.append(client_time - 5000, 0);
    canvas = document.getElementById('mem_load');
    chart_mem.addTimeSeries(mem_data, {lineWidth:1,strokeStyle:'rgb(132, 54, 187)',fillStyle:'rgba(132, 54, 187, 0.30)'});
    chart_mem.prepare(canvas, 5000);

    var cm_watcher = scrollMonitor.create(canvas, 100);
    cm_watcher.enterViewport(function () {
        chart_mem.start();
    });
    cm_watcher.exitViewport(function () {
        chart_mem.stop();
    });

    % if host.temperature:
        temp_data.append(client_time - 5000, 0);
        canvas = document.getElementById('temp');
        chart_temp.addTimeSeries(temp_data, {lineWidth:1,strokeStyle:'rgb(255, 0, 0)',fillStyle:'rgba(255, 0, 0, 0.15)'});
        chart_temp.prepare(canvas, 5000);

        var ct_watcher = scrollMonitor.create(canvas, 100);
        ct_watcher.enterViewport(function () {
            chart_temp.start();
        });
        ct_watcher.exitViewport(function () {
            chart_temp.stop();
        });
    % end
});

% if cpu_count > 1:
$('#processor_load_0').click(function() {
    $('#myModal').modal();
});


$('#myModal').on('show.bs.modal', function (e) {
    %  for count in range(1, cpu_count + 1):
        chart_processor_{{count}}.start();
    % end
})

$('#myModal').on('hidden.bs.modal', function (e) {
    %  for count in range(1, cpu_count + 1):
        chart_processor_{{count}}.stop();
    % end
})


% end