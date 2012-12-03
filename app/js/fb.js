// GLOBAL VARS
var facebook_options = {
	client_id : "446056115455221", // YOUR APP ID
	secret : "7d31e117dca4611cdde010d45047dafe", // YOUR APP SECRET 
	redirect_uri : "http://swagon.herokuapp.com/accept_facebook.txt", // LEAVE THIS
	type :"user_agent",
	display : "touch" // LEAVE THIS
}
	
var facebook_token = "fbToken"; // OUR TOKEN KEEPER

var facebook_connection = {
	init:function(){
		
		// Begin Authorization
		var authorize_url = "https://graph.facebook.com/oauth/authorize?";
		authorize_url += "client_id=" + facebook_options.client_id;
		authorize_url += "&redirect_uri=" + facebook_options.redirect_uri;
		authorize_url += "&display=" + facebook_options.display;
		authorize_url += "&scope=publish_stream,offline_access"

		var oauth2_url = "https://www.facebook.com/dialog/oauth?";
		oauth2_url += "client_id=" + facebook_options.client_id;
		oauth2_url += "&redirect_uri=" + facebook_options.redirect_uri;
		oauth2_url += "&scope=status_update"
		oauth2_url += "&response_type=token"

		// Open Child browser and ask for permissions
		window.plugins.childBrowser.onLocationChange = facebook_connection.facebookLocChanged

		window.plugins.childBrowser.showWebPage(oauth2_url, { showLocationBar : false })
	},
	facebookLocChanged:function(loc){
		console.log("loc change: " + loc)
		console.log("position: " + loc.indexOf("http://swagon.herokuapp.com/accept_facebook.txt"))
		// When the childBrowser window changes locations we check to see if that page is our success page.
		if (loc.indexOf("http://swagon.herokuapp.com/accept_facebook.txt") == 0 || loc.indexOf("https://www.facebook.com/connect/login_success.html") > -1) {
			/*var fbCode = loc.match(/code=(.*)$/)[1]
			console.log('found: ' + loc)
			console.log('request: https://graph.facebook.com/oauth/access_token?client_id='+facebook_options.client_id+'&client_secret='+facebook_options.secret+'&code='+fbCode+'&redirect_uri=http://swagon.herokuapp.com/accept_facebook.txt')

			$.ajax({
				url:'https://graph.facebook.com/oauth/access_token?client_id='+facebook_options.client_id+'&client_secret='+facebook_options.secret+'&code='+fbCode+'&redirect_uri=http://swagon.herokuapp.com/accept_facebook.txt',
				data: {},
				dataType: 'text',
				type: 'POST',
				success: function(data, status){
					
					// We store our token in a localStorage Item called facebook_token
					localStorage.setItem(facebook_token, data.split("=")[1]);
					
					console.log("Facebook success")

					window.plugins.childBrowser.close();
				},
				error: function(error) {
					var output = '';
					for (property in error) {
						output += property + ': ' + error[property]+'; ';
					}
					console.log("Facebook error: " + error.responseText)
					window.plugins.childBrowser.close();
				}
			});
*/
			window.plugins.childBrowser.close();
			
			var param_string = loc.split("#")[1]
			var accessParams = {};
      var qvars_tmp = param_string.split('&');
      for (var i = 0; i < qvars_tmp.length; i++) {
        var y = qvars_tmp[i].split('=');
        accessParams[y[0]] = decodeURIComponent(y[1]);
      }
      if(accessParams.access_token && accessParams.expires_in)
      {
      	window.facebook = accessParams
      	localStorage.setItem(facebook_token, JSON.stringify(accessParams))
      	facebook_connection.getMe()
      }
      else {
      	window.app_alert("Error connecting Facebook")
      }
		}
	},

	recoverSavedToken:function() {
		if(localStorage.getItem(facebook_token)) {
			window.facebook = JSON.parse(localStorage.getItem(facebook_token))
			facebook_connection.getMe()
		}
	},

	getMe:function() {
		var url = 'https://graph.facebook.com/me?fields=name,id&callback=?&'+
									'access_token='+window.facebook.access_token
		console.log("me request: " + url)
		$.ajax({
			url: url,
			data: {},
			dataType: 'json',
			success: function(data, status){
				console.log("data received: " + data + " " + data.name)
				if(data.name && data.id) {
					console.log()
					window.facebook.user_name = data.name
					window.facebook.user_id = data.id
					window.facebook.enabled = true
    			$('.facebook').removeClass('disabled')
				}
				else
					window.app_alert("Error getting user data!")
			},
			error: function (error) {
				var output = '';
				for (property in error) {
					output += property + ': ' + error[property]+'; ';
				}
				console.log("Facebook error: " + error.responseText)
			}
		})
	},

	share:function(url){
		
		// Create our request and open the connection
		var req = new XMLHttpRequest(); 
		req.open("POST", url, true);
		
		
		req.send(null); 
		return req;
	},
	post:function(message, success, failure) {
		var url = "https://graph.facebook.com/me/feed?access_token="+window.facebook.access_token
		$.post(url, {message: message})
				.success(success)
				.error(failure)
	},
	success:function(){
		$("#statusTXT").show();
		$("#statusBTN").show();

		// hide our info
		$("#info").hide();
		
		// reset our field
		$("#statusTXT").val('');
		
		console.log("DONE!");
		
	}
}