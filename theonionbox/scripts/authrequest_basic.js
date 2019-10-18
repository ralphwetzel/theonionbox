%# Note that this file is not a valid *.js file!
%# It is intended to be a bottlepy - style template
%# used for the scripting part of TheOnionBox!

// This code is based on the great work of
// Jamie Perkins' "Digest Auth Request"
// https://github.com/inorganik/digest-auth-request
// adapted to suit our needs!

<%
    base_path = get('virtual_basepath', '') + '/'
	session_id = get('session_id')
%>


function authRequest(username, password) {

	var self = this;

    this.method = 'GET';
    this.url = '{{base_path}}' + username + '/login.html';
	this.scheme = null; // we just echo the scheme, to allow for 'basic', 'X-basic', 'Jbasic' etc
	this.response = null; // hashed response to server challenge

	// settings
	this.timeout = 10000; // timeout

    // this might be old-fashion yet safe! Isn't it... ?
    this.ajaxRequest = function()
    {
        try { var request = new XMLHttpRequest(); }
        catch(e1)
        {
            try { request = new ActiveXObject("Msxml2.XMLHTTP"); }
            catch(e2)
            {
                try { request = new ActiveXObject ("Microsoft.XMLHTTP"); }
                catch(e3)
                {
                    request = false;
                }
            }
        }
        return request;
    };

	// start here
	this.request = function() {

        self.firstRequest = new self.ajaxRequest();
		self.firstRequest.open(self.method, self.url, true);
		self.firstRequest.timeout = self.timeout;

		self.firstRequest.onreadystatechange = function() {

			// 2: received headers,  3: loading, 4: done
			if (self.firstRequest.readyState === 2) { 

				var responseHeaders = self.firstRequest.getAllResponseHeaders();
				responseHeaders = responseHeaders.split('\n');
				// get authenticate header
				var basicHeaders;
				for(var i = 0; i < responseHeaders.length; i++) {
					if (responseHeaders[i].match(/www-authenticate/i) != null) {
						basicHeaders = responseHeaders[i];
					}
				}
				
				if (basicHeaders != null) {
					// parse auth header and get basic auth keys
					basicHeaders = basicHeaders.split(':')[1];
					basicHeaders = basicHeaders.split(',');
					self.scheme = basicHeaders[0].split(/\s/)[1];
					for (var j = 0; j < basicHeaders.length; j++) {
						var equalIndex = basicHeaders[j].indexOf('='),
							key = basicHeaders[j].substring(0, equalIndex),
							val = basicHeaders[j].substring(equalIndex + 1);
						// find realm
						if (key.match(/realm/i) != null) {
							self.realm = val;
						}
					}
					// now we can make an authenticated request
					self.makeAuthenticatedRequest();
				}
			}
			if (self.firstRequest.readyState === 4) {
                // if (!(self.firstRequest.status >= 200 && self.firstRequest.status < 400)){
                if (self.firstRequest.status !== 401) {
        		    // console.log('self.firstRequest.readyState');
                    document.location = '{{base_path}}{{session_id}}/failed.html';
                }
			}
		};

		// handle error
		self.firstRequest.onerror = function() {
			if (self.firstRequest.status !== 401) {
    		    // console.log('self.firstRequest.onerror');
		        document.location = '{{base_path}}{{session_id}}/failed.html';
			}
		};

		// send
		self.firstRequest.send();

	};

	this.makeAuthenticatedRequest = function() {

        // btoa will fail on IE<10; to be fixed when someone complains ;) !
		self.response = btoa(username+':'+password);

		self.authenticatedRequest = self.ajaxRequest();
		self.authenticatedRequest.open(self.method, self.url, true);
		self.authenticatedRequest.timeout = self.timeout;
        var basicAuthHeader = self.scheme + ' ' + self.response;

		self.authenticatedRequest.setRequestHeader('Authorization', basicAuthHeader);

		self.authenticatedRequest.onload = function() {
		    var redirect_location = '{{base_path}}{{session_id}}/failed.html';
			// success
  			if (self.authenticatedRequest.status >= 200 && self.authenticatedRequest.status < 400) {
				if (self.authenticatedRequest.responseText !== 'undefined') {
					if (self.authenticatedRequest.responseText.length > 0) {
					    var location_id = self.authenticatedRequest.responseText;
					    redirect_location = '{{base_path}}' + location_id + '/{{proceed_to}}';
					}
				}
			}
		    // console.log('self.authenticatedRequest.onload');
			document.location = redirect_location;
		};

		// handle errors
		self.authenticatedRequest.onerror = function() { 
		    // console.log('self.authenticatedRequest.onerror');
		    document.location = '{{base_path}}{{session_id}}/failed.html';
		};

		self.authenticatedRequest.send();
	};

	this.abort = function() {
		if (self.firstRequest != null) {
			if (self.firstRequest.readyState != 4) self.firstRequest.abort();
		}
		if (self.authenticatedRequest != null) {
			if (self.authenticatedRequest.readyState != 4) self.authenticatedRequest.abort();
		}
	};
};
