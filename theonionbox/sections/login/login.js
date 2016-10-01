function do_login(event)
{
    var overlay = document.getElementById('content');
    overlay.className += ' overlay';

    document.body.style.cursor = 'wait';

    var login_button = document.getElementById('button_login');
    login_button.disabled = true;

    var login_input = document.getElementById('login_pwd');
    login_input.disabled = true;
    var pwd = login_input.value;

    try {
        var getRequest = new authRequest('{{session_id}}', pwd);
        getRequest.request();
        return false;
    }
    catch(err) {
        document.location = 'base_path';
    }
}
