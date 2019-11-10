%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

var msgStatus;
var messages_player;

var last_message;

function msg_handler() {}
msg_handler.prototype = new DataHandler();
msg_handler.prototype.process = function(data, timedelta) {

    // console.log("section_message: process");

    for (var data_point in data)
    {
        var timestamp = data[data_point].s + timedelta;
        %# // to prepare for the playback!
        data[data_point].s = timestamp;
    }

    messages_player.append(data);
};

msg_handler.prototype.prepare = function() {

    var retval = msgStatus.json(true);
    if (retval !== '') {
        return 'runlevel=' + retval;
    }
    return;
};

function msg_status_handler() {}
msg_status_handler.prototype = new DataHandler();
msg_status_handler.prototype.process = function(data, timedelta) {

    for (var level in data) {
        var status = data[level];
        var btn = $(".message_selector[data-severity='" + level.toUpperCase() + "']");
        if (status === true && btn.hasClass('active') === false) {
            btn.addClass('active');
        } else if (status === false && btn.hasClass('active') === true) {
            btn.removeClass('active');
        }
        msgStatus.set(level, status);
    }
};


$(document).ready(function() {
    addNavBarButton('Messages', 'messages');

    messages_player = new boxDataPlayer(msg_play, 5000, 's');
    messages_player.start();

    msgStatus = new boxLogSelector();

    % preserved_events = get('preserved_events', None)
    % if preserved_events is not None:
    %   for event in preserved_events:
            log("{{!event['m']}}", {{event['s']}}, "{{event['l']}}", "{{event['t']}}");
    %   end
    % end

    boxData.addHandler('msg', new msg_handler());
    boxData.addHandler('msg_status', new msg_status_handler());
});

function msg_play(data)
{
    log(data.m, data.s, data.l, data.t, data.c);
}

$(".message_selector").on('click', function () {
    var key = $(this).data("severity");

    msgStatus.set(key, !msgStatus.get(key));
});

function boxLogSelector(options) {

    this.status = {'DEBUG': false, 'INFO': false, 'NOTICE': true, 'WARN': true, 'ERROR': true};

    if (options) {
        if (options.debug) {
            this.status.DEBUG = options.debug;
        }
        if (options.info) {
            this.status.INFO = options.info;
        }
        if (options.NOTICE) {
            this.status.NOTICE = options.notice;
        }
        if (options.warn) {
            this.status.WARN = options.warn;
        }
        if (options.error) {
            this.status.ERROR = options.error;
        }
    }

    this.has_changed = true;
}

boxLogSelector.prototype.set = function(key, value) {

    var stat;
    for (stat in this.status)
    {
        if ((key == stat) && (value === true || value === false)) {
            if (this.status[key] != value) {
                this.status[key] = value;
                this.has_changed = true;
            }
            break;
        }
    }
};

boxLogSelector.prototype.get = function(key) {
    var stat;
    for (stat in this.status)
    {
        if (key == stat)
        {
            return this.status[key];
        }
    }
};

boxLogSelector.prototype.json = function(if_changed) {

    var retval = JSON.stringify(this.status);

    if (if_changed && !this.has_changed) {
            retval = '';
    }

    this.has_changed = false;
    return retval;
};

function log(message, timestamp, runlevel, tag, times) {
    var cnsle = $('#msg');
    cnsle.trigger('msg:log', [message, timestamp, runlevel, tag, times]);
}

$('#msg').on('msg:log', function (event, message, timestamp, runlevel, tag, times) {

    var runlevel_translate = {
        'D': 'DEBUG',
        'I': 'INFO',
        'N': 'NOTICE',
        'W': 'WARN',
        'E': 'ERROR'
    };

    if (!message) {
        return;
    }
    if (!timestamp) {
        timestamp = new Date();
    }
    else {
        timestamp = new Date(timestamp);
    }

    if (!runlevel) {
        runlevel = 'THIS';
    }

    if (runlevel_translate[runlevel]) {
        runlevel = runlevel_translate[runlevel];
    }

    if (tag == 'b') {
        if (runlevel == 'NOTICE') {
            runlevel = 'BOX';
        }
        else {
            message = 'BOX | ' + message;
        }
    }

    if (!times) {
        times = 0;
    }

    var runlevel_display = runlevel;

    if (last_message) {
        if (last_message.rl === runlevel && last_message.message === message) {
            $('#log_data').find('tr:first').remove();
            times += last_message.times
        }
    }

    var log_msg = "<tr class='%s'><td class='box_Log_runlevel'>[%s]</td>".$(runlevel, runlevel_display);
    log_msg += "<td nowrap class='box_Log_stamp'>" + format_time(timestamp) + "</td>";
    log_msg += '<td>' + message;
    if (times > 1) {
        log_msg += ' (' + times + ' times)';
    }
    log_msg += '</td></tr>';

    $('#log_data').prepend(log_msg);

    last_message = {
        rl: runlevel,
        message: message,
        times: times
    }

});

