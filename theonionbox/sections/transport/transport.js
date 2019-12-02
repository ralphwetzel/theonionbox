function transport_handler() {}
transport_handler.prototype = new DataHandler();
transport_handler.prototype.process = function(data, timedelta) {

    $('#transport-or').text(data['or']);
    $('#transport-circ').text(data['circ']);
    $('#transport-stream').text(data['stream']);

};

transport_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

transport_handler.prototype.nav = function() {
    return 'Transportation Status';
};

$(document).ready(function() {
    addNavBarButton('Transportation Status', 'transport');
    boxData.addHandler('transport', new transport_handler());
});

