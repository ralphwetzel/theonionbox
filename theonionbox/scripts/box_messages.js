// Dependencies:
//  jquery

function box_LogHandler(datasource, tablename, error_callback) {
    this.datasource = datasource;
    this.table = $("#"+tablename);
    this.runlevel = '';
    this.error = error_callback;
    // this.success = success;
    this.stop_flag = false;
    this.timer = null;
}

box_LogHandler.prototype.log = function(message) {

    var log_msg = "<tr class='CLIENT'><td class='box_Log_runlevel'>[THIS]</td><td nowrap class='box_Log_stamp'>"

    // log_msg = log_msg + strftime('%F %T', new Date())
    log_msg = log_msg + format_date()
    log_msg = log_msg + '</td><td>'
    log_msg = log_msg + message
    log_msg = log_msg + '</td></tr>'

    this.table.prepend(log_msg);
}

box_LogHandler.prototype.start = function() {

    var log_success = function(data) {
        if (data == '') {return;}
        this.table.prepend(data);
    }.bind(this)

    var log_puller = function () {

        var action = "action=pull_log";

        if (this.runlevel.length > 0)
        {
            action += "&json=" + this.runlevel;
        }

        var ajax_settings = {};
        ajax_settings.method = 'POST';
        ajax_settings.data = action;
        ajax_settings.success = log_success;
        ajax_settings.error = this.error_callback;

        jQuery.ajax(this.datasource, ajax_settings);

        if (this.stop_flag == false)
        {
            this.timer = setTimeout(log_puller, 1000);
        }
    }.bind(this)

    log_puller();
}

box_LogHandler.prototype.stop = function() {
    this.stop_flag = true;
    clearTimeout(this.timer);
    }

// Special Thanks goes to Rtlprmft
// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format

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

function box_LogSelector(options) {

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
}

box_LogSelector.prototype.set = function(key, value) {

    var stat;
    for (stat in this.status)
    {
        if ((key == stat) && (value == true || value == false)) { this.status[key] = value; break; }
    }
}

box_LogSelector.prototype.get = function(key) {
    var stat;
    for (stat in this.status)
    {
        if (key == stat)
        {
            return this.status[key];
        }
    }
}

box_LogSelector.prototype.json = function() {

    return JSON.stringify(this.status);

}