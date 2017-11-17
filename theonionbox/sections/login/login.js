<%
    sc = get('section_config')
    login_params = sc['login'] if 'login' in sc else {}

    base_path = get('virtual_basepath', '') + '/'
    session_id = get('session_id')

%>

function do_login(event)
{
    if (expiration_timeout) {
        clearTimeout(expiration_timeout);
    }

    disable_form();
    $('.spnnr').css('display', 'inline-block');
    document.body.style.cursor = 'wait';

    var login_input = document.getElementById('login_pwd');
    var pwd = login_input.value;

    try {
        var getRequest = new authRequest('{{session_id}}', pwd);
        getRequest.request();
        return false;
    }
    catch(err) {
        document.location = '{{base_path}}{{session_id}}/';
    }
}

function disable_form()
{
    var overlay = document.getElementById('login_form');
    overlay.className += ' overlay';

    var login_button = document.getElementById('button_login');
    login_button.disabled = true;

    var login_input = document.getElementById('login_pwd');
    login_input.disabled = true;
}

var expiration_timeout;

$(document).ready(function() {
    expiration_timeout = setTimeout(function() {
        disable_form();
        $('#info_expired').show();
    }, {{login_params.get('timeout', 30000)}})
});
