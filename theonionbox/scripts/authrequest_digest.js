%# Note that this file is not a valid *.js file!
%# It is intended to be a bottlepy - style template
%# used for the scripting part of TheOnionBox!

// This code is based on the contribution from
// Jamie Perkins' "Digest Auth Request"
// https://github.com/inorganik/digest-auth-request
// adapted to suit our needs!
// e.g. no CryptoJS dependency
// instead we're using this library (attached at the bottom):

<%

    # md5 = get('md5_js_file')
    # include(md5)

    base_path = get('virtual_basepath', '') + '/'
	session_id = get('session_id')
%>



function authRequest(username, password) {

	var self = this;

    this.method = 'GET';
    this.url = '{{base_path}}' + username + '/login.html';

	this.scheme = null; // we just echo the scheme, to allow for 'Digest', 'X-Digest', 'JDigest' etc
	this.nonce = null; // server issued nonce
	this.realm = null; // server issued realm
	this.qop = null; // "quality of protection" - '' or 'auth' or 'auth-int'
	this.response = null; // hashed response to server challenge
	this.opaque = null; // hashed response to server challenge
	this.nc = 1; // nonce count - increments with each request used with the same nonce
	this.cnonce = null; // client nonce

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
				var digestHeaders;
				for(var i = 0; i < responseHeaders.length; i++) {
					if (responseHeaders[i].match(/www-authenticate/i) != null) {
						digestHeaders = responseHeaders[i];
					}
				}
				
				if (digestHeaders != null) {
					// parse auth header and get digest auth keys
					digestHeaders = digestHeaders.split(':')[1];
					digestHeaders = digestHeaders.split(',');
					self.scheme = digestHeaders[0].split(/\s/)[1];
					for (var j = 0; j < digestHeaders.length; j++) {
						var equalIndex = digestHeaders[j].indexOf('='),
							key = digestHeaders[j].substring(0, equalIndex),
							val = digestHeaders[j].substring(equalIndex + 1);
						// find realm
						if (key.match(/realm/i) != null) {
							self.realm = val;
						}
						// find nonce
						if (key.match(/nonce/i) != null) {
							self.nonce = val;
						}
						// find opaque
						if (key.match(/opaque/i) != null) {
							self.opaque = val;
						}
						// find QOP
						if (key.match(/qop/i) != null) {
							self.qop = val;
						}
					}
					// client generated keys
					self.cnonce = self.generateCnonce();
					self.nc++;
					self.makeAuthenticatedRequest();
				}
			}
			if (self.firstRequest.readyState === 4) {
                // if (!(self.firstRequest.status >= 200 && self.firstRequest.status < 400)) {
                if (self.firstRequest.status !== 401) {
                    document.location = '{{base_path}}{{session_id}}/failed.html';
                }
			}
		};
		// send
		self.firstRequest.send();

		// handle error
		self.firstRequest.onerror = function() {
			if (self.firstRequest.status !== 401) {
		        document.location = '{{base_path}}{{session_id}}/failed.html';
			}
		}
	};

	this.makeAuthenticatedRequest= function() {

		self.response = self.formulateResponse();

		self.authenticatedRequest = new self.ajaxRequest();
		self.authenticatedRequest.open(self.method, self.url, true);
		self.authenticatedRequest.timeout = self.timeout;
		var digestAuthHeader;
		if (self.qop) {
            digestAuthHeader = self.scheme+' '+
                'username="'+username+'", '+
                'realm="'+self.realm+'", '+
                'nonce="'+self.nonce+'", '+
                'uri="'+self.url+'", '+
                'response="'+self.response+'", '+
                'opaque="'+self.opaque+'", '+
                'qop='+self.qop+', '+
                'nc='+('00000000' + self.nc).slice(-8)+', '+
                'cnonce="'+self.cnonce+'"';
		}
		else {
            digestAuthHeader = self.scheme
                + ' username="'+username+'"'
                + ', realm="'+self.realm+'"'
                + ', nonce="'+self.nonce+'"'
                + ', uri="'+self.url+'"'
                + ', response="'+self.response+'"'
//                + ', opaque="'+self.opaque+'"';
		}

		self.authenticatedRequest.setRequestHeader('Authorization', digestAuthHeader);

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
			document.location = redirect_location;
		};

		// handle errors
		self.authenticatedRequest.onerror = function() {
		    document.location = '{{base_path}}{{session_id}}/failed.html';
		};

		self.authenticatedRequest.send();
	};

	// to get rid of CryptoJS
    this.formulateResponse = function() {
        var ha1_prep = username+':'+self.realm+':'+password;
		var HA1 = md5(ha1_prep);
		var ha2_prep = self.method+':'+self.url;
		var HA2 = md5(ha2_prep);
		var response;
		if (self.qop) {
            response = md5(HA1+':'+
                self.nonce+':'+
                ('00000000' + self.nc).slice(-8)+':'+
                self.cnonce+':'+
                self.qop+':'+
                HA2);
		}
		else {
            response = md5(HA1+':'+
                self.nonce+':'+
                HA2);
		}

		return response;
	};

	// generate 16 char client nonce
	this.generateCnonce = function() {
		var characters = 'abcdef0123456789';
		var token = '';
		for (var i = 0; i < 16; i++) {
			var randNum = Math.round(Math.random() * characters.length);
			token += characters.substr(randNum, 1);
		}
		return token;
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

