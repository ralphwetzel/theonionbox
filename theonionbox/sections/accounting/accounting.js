%# // Note that this file is not a valid *.js script!
%# // It is intended to be a bottlepy - style template
%# // used for the scripting part of TheOnionBox!

function acc_handler() {}
acc_handler.prototype = new DataHandler();
acc_handler.prototype.process = function(data) {
    //console.log("section_accounting: process");
    if (!data) {
        return;
    }

    if (data.enabled === true && data.stats) {
        $(".acc_off").hide();
        $(".acc_on").show();

        if (data.stats.status == 'awake') {
            $('#acc_status').text(data.stats.status);
        }
        else {
            $('#acc_status').text('hibernating | ' + data.stats.status);
        }

        $("#acc_down").text(prettyNumber(data.stats.read_bytes, '', 'si')
                           + ' (Max: '
                           + prettyNumber(data.stats.read_limit, '', 'si')
                           + ')');

        $("#acc_up").text(prettyNumber(data.stats.written_bytes, '', 'si')
                         + ' (Max: '
                         + prettyNumber(data.stats.write_limit, '', 'si')
                         + ')');

        // ttr = time_to_reset
        // var ttr = data.stats.time_to_reset;

        var date_value = new Date(data.stats.time_until_reset * 1000);
        var ttr = "%02d".$(date_value.getUTCHours()) + ":" + "%02d".$(date_value.getUTCMinutes());
        $("#acc_interval").text(format_date(data.stats.interval_end * 1000)+ ' | in ' + ttr + ' hours');

    }
    else {
        $(".acc_off").show();
        $(".acc_on").hide();
    }
};

acc_handler.prototype.prepare = function() {
    // console.log("section_accounting: prepare");
    return;
};

acc_handler.prototype.nav = function() {
    return 'Accounting';
};

$(document).ready(function() {
    addNavBarButton('Accounting', 'accounting');
    boxData.addHandler('acc', new acc_handler());
});
