function control_handler() {}
control_handler.prototype = new DataHandler();
control_handler.prototype.process = function(data, timedelta) {

};

control_handler.prototype.prepare = function() {
    // console.log("section_general: prepare");
};

control_handler.prototype.nav = function() {
    return 'Control';
};

$(document).ready(function() {
    addNavBarButton('Control Center', 'control');
    boxData.addHandler('control', new control_handler());
});

$('#abtn').click(function() {
    $('#myControlModal').modal();
});

// $("[name='my-checkboxtest']").bootstrapSwitch();

<%
    session = get('session')
    index_to_host = session['cc']
    box_cc = get('controlled_nodes')
    controlled_names = ''
    controlled_ids = ''
    for key, node in box_cc.items():
        if node['name'] is not None:

            use_name = node['name'][1:] if node['name'][0] == '#' else node['name']
            if len(controlled_names)>0:
                controlled_names += ',\n'
            end
            controlled_names += '"{}"'.format(use_name)

            if len(controlled_ids)>0:
                controlled_ids += ',\n'
            end
            controlled_ids += '"{}"'.format(index_to_host[key])

            end
        end
    end
%>


var controlled_names = [
{{!controlled_names}}
];

var controlled_ids = [
{{!controlled_ids}}
];

$('#search').keyup(function (event) {
    var e = event || window.event;
    var search_for = $(this).val();

    if (e.keyCode === 13 && search_for !== ""){
        $('#search').popover('destroy');
        do_search(search_for);
    }
});

$('#search').blur(function () {
    $('#search').popover('destroy');
});

if (!Object.keys) {
    Object.keys = function(object) {
        var keys = [];
        for (var o in object) {
            if (object.hasOwnProperty(o)) {
                keys.push(o);
            }
        }
        return keys;
    };
}

$('#search').on('input', function () {
    var search_for = $(this).val().toLowerCase();

    if (search_for !== '') {
        var out = ''; // = search_for.toLowerCase();

        // var keys = Object.keys(controlled_nodes);
        for (var len = controlled_names.length, i=0; i<len; ++i) {

            var iO = controlled_names[i].toLowerCase().indexOf(search_for);

            if (iO !== -1) {
                if (out.length > 0) {
                    out += '<br>';
                }
                out += '<a href="{{base_path}}{{session_id}}/open?node=' + controlled_ids[i] + '" target="_blank">';
                out += controlled_names[i].substr(0, iO);
                out += '<b>' + controlled_names[i].substr(iO, search_for.length) + '</b>';
                out += controlled_names[i].substr(iO + search_for.length);
                out += '</a>';
            }
        }

        if (out === '') {
            $('#search').popover('destroy');
        }
        else {
            // check if already visible
            var po = $('#search').data()['bs.popover'];

            if (po === null || po === void 0 || po.tip().hasClass('in') !== true) {
                $('#search').attr('data-content', out);
                $('#search').popover('show');
            } else {
                po.$tip.find(".popover-content").html(out);
            }
        }
    }
    else {
        $('#search').popover('destroy');
    }
});

// box_cc = get('controlled_nodes')

function do_search(search_for)
{
    // disable_form();
    $('.spnnr').css('display', 'inline-block');
    $.post("/{{session_id}}/search", { for: search_for })
        .done(function(json_data) {
            var data = JSON.parse(json_data);
            var out;
            if (data.length === 0) {
                out = "No relay or bridge matches your query.";
            }
            // else if (data.length === 1) {
            //     window.open("/{{session_id}}/s")
            // }
            else {
                out = '<div class="container-fluid">';
                for (var len = data.length, i=0; i<len; ++i) {
                    var node = data[i];
                    out += '<div class="row row-striped">';
                    out += '<div class="col-xs-6">';
                    out += '<a href="{{base_path}}{{session_id}}/open?search=' + node.i + '" target="_blank">';
                    out += node.n;
                    out += '</a>';
                    out += '</div>';
                    // out += '<td>' + node.f + '</td>';
                    if (node.t === 'r') { out += '<div class="col-xs-3">Relay</div>'; }
                    if (node.t === 'b') { out += '<div class="col-xs-3">Bridge</div>'; }
                    if (node.r === true) { out += '<div class="col-xs-3">Running</div>';}
                    out += '</div>';
                }
                out += '</div>';
            }
            $('#search').popover('destroy');
            $('#search').attr('data-content', out);
            $('#search').attr('data-trigger', 'manual');
            $('#search').popover('show');
        })
        .always(function(json_data) {
            $('.spnnr').css('display', 'None');
        })
    ;
}
