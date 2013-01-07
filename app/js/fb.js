// GLOBAL VARS
var facebook_options = {
  client_id : "446056115455221", // YOUR APP ID
  secret : "7d31e117dca4611cdde010d45047dafe", // YOUR APP SECRET 
  redirect_uri : "http://swagon.herokuapp.com/accept_facebook.txt", // LEAVE THIS
  type :"user_agent", // LEAVE THIS
  display : "touch", // LEAVE THIS,
  token : "fbToken" // THE KEY USED TO STORE TO LOCALSTORAGE
}

var facebook_connection = {
  init:function(success, error){
    // save callbacks to be called later
    this.login_success_cb = success
    this.login_error_cb = error

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
    console.log("loc change!")
    console.log("context right? " + (this == window.facebook_connection))
    // When the childBrowser window changes locations we check to see if that page is our success page.
    if (loc.indexOf(facebook_options.redirect_uri) == 0 || 
        loc.indexOf("https://www.facebook.com/connect/login_success.html") > -1) {
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
        // save facebook token to local storage
        localStorage.setItem(facebook_options.token, JSON.stringify(accessParams))
        // get user info
        facebook_connection.getMe({success: facebook_connection.login_success_cb, 
          error: facebook_connection.login_error_cb})
      }
      else if(facebook_connection.login_error_cb)
          facebook_connection.login_error_cb()
    }
  },

  recoverSavedToken:function(success, error) {
    if(localStorage.getItem(facebook_options.token)) {
      window.facebook = JSON.parse(localStorage.getItem(facebook_options.token))
      facebook_connection.getMe({success: success, error: error})
    }
  },

  getMe:function(options) {
    options = (options?options:{})

    var url = 'https://graph.facebook.com/me?fields=name,id&callback=?&'+
                  'access_token='+window.facebook.access_token
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(data, status){
        if(data.name && data.id) {
          window.facebook.user_name = data.name
          window.facebook.user_id = data.id
          window.facebook.enabled = true
          if(options.success)
            options.success(data, status)
        }
        else if(options.error)
            options.error(data, status)
      },
      error: function (error) {
        console.log("Facebook error: " + error.responseText)
        if(options.error)
          options.error(error)
      }
    })
  },

  share:function(url){
    // TODO: Not implemented yet
  },

  // post a facebook status
  post:function(message, success, failure) {
    var url = "https://graph.facebook.com/me/feed?access_token="+window.facebook.access_token
    $.post(url, {message: message})
        .success(success)
        .error(failure)
  }
}