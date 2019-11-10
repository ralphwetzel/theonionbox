function stats_handler() {}
stats_handler.prototype = new DataHandler();
stats_handler.prototype.process = function(data, timedelta) {

};

stats_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

stats_handler.prototype.nav = function() {
    return 'Local Status';
};

$(document).ready(function() {
    addNavBarButton('Local Status', 'stats');
    boxData.addHandler('stats', new stats_handler());
});

