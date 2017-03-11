function hiddenservice_handler() {}
hiddenservice_handler.prototype = new DataHandler();
hiddenservice_handler.prototype.process = function(data, timedelta) {

};

hiddenservice_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

hiddenservice_handler.prototype.nav = function() {
    return 'Configuration';
};

$(document).ready(function() {
    addNavBarButton('HiddenService', 'hiddenservice');

    document.addEventListener("touchstart", function(){}, true);
    boxData.addHandler('config', new hiddenservice_handler());
});

