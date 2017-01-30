function config_handler() {}
config_handler.prototype = new DataHandler();
config_handler.prototype.process = function(data, timedelta) {

};

config_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

config_handler.prototype.nav = function() {
    return 'Configuration';
};

$(document).ready(function() {
    addNavBarButton('Configuration', 'config');

    document.addEventListener("touchstart", function(){}, true);
    boxData.addHandler('config', new config_handler());
});

