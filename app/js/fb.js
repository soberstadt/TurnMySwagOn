// facebook_phonegap_example.js
//
// Facebook connection with Phonegap Example
//
// Author: Spencer Oberstadt
// github.com/soberstadt
// twitter.com/spencersshutter
//
// It would be cool if you give me a shout-out if this helps or anything

var facebook_connection = {
  // GLOBAL VARS
  options: {
    client_id : "446056115455221", // YOUR APP ID
    redirect_uri : "http://swagon.herokuapp.com/accept_facebook.txt", // YOUR REDIRECT URI
    token : "fbToken" // THE KEY USED TO STORE TO LOCALSTORAGE, NO NEED TO CHANGE
  },

  // initiate Facebook login
  //
  // success - The callback for success, will be called with getMe() data
  // error   - The callback for error
  //
  // Example
  //
  //    facebook_connect.init(function(data) {
  //        alert("successfully logged in as " + data.user_name)
  //      },
  //      function() {
  //        alert("error logging in! :(")
  //      }
  //    )
  init:function(success, error){
    // save callbacks to be called later
    this.login_success_cb = success
    this.login_error_cb = error

    var oauth2_url = "https://www.facebook.com/dialog/oauth?"+
          "client_id=" + this.options.client_id+
          "&redirect_uri=" + this.options.redirect_uri+
          "&scope=status_update&response_type=token"

    // Open Child browser and ask for permissions
    window.plugins.childBrowser.onLocationChange = this.facebookLocChanged
    window.plugins.childBrowser.showWebPage(oauth2_url, { showLocationBar : false })
  },

  // INTERNAL function for childbrowser's location change
  facebookLocChanged:function(loc){
    // When the childBrowser window changes locations we check to see if that 
    // page is our success page.
    if (loc.indexOf(facebook_connection.options.redirect_uri) == 0 || 
        loc.indexOf("https://www.facebook.com/connect/login_success.html") > -1) {
      window.plugins.childBrowser.close()
      
      // parse params
      var accessParams = {}
      var qvars_tmp = loc.split("#")[1].split('&')
      for (var i = 0; i < qvars_tmp.length; i++) {
        var y = qvars_tmp[i].split('=')
        accessParams[y[0]] = decodeURIComponent(y[1])
      }

      if(accessParams.access_token)
      {
        facebook_connection.user_data = accessParams
        // save Facebook token to local storage
        localStorage.setItem(facebook_connection.options.token, JSON.stringify(accessParams))
        // get user info
        facebook_connection.getMe({success: facebook_connection.login_success_cb, 
          error: facebook_connection.login_error_cb})
      }
      else if(facebook_connection.login_error_cb)
          facebook_connection.login_error_cb()
    }
  },

  // fetch saved access token
  //
  // success - The callback for success, will be called with getMe() data
  // error   - The callback for error
  recoverSavedToken:function(success, error) {
    if(localStorage.getItem(facebook_connection.options.token)) {
      facebook_connection.user_data = 
        JSON.parse(localStorage.getItem(facebook_connection.options.token))
      facebook_connection.getMe({success: success, error: error})
    }
    else if(error)
      error("No token saved in localStorage")
  },

  // ask Facebook for user name, great for checking access token
  // calls options.success or options.error callback when complete
  //
  // You must either have a access token saved to user_data.access_token or pass 
  //  one in with the token option
  //
  // OPTIONS
  //    error:    the callback after an error in the request
  //    save:     (Boolean) whether to save user data on response, defaults to
  //              true
  //    success:  the callback after successful request
  //    token:    override saved token for request
  //
  // Example
  //
  //    facebook_connection.getMe({
  //      success: function(data) {
  //        alert("success! You are " + data.name)
  //      },
  //      error: function(error) {
  //        alert("error getting data: " + error)
  //      },
  //      save: false,
  //      token: qlkq2j32lk34
  //    })
  getMe:function(options) {
    options = (options?options:{})
    if(options.token === undefined && facebook_connection.user_data)
      options.token = facebook_connection.user_data.access_token

    if(options.token) {
      var url = 'https://graph.facebook.com/me?fields=name,id&callback=?&'+
                    'access_token='+options.token
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(data, status){
          if(data.name && data.id) {
            facebook_connection.user_data.user_name = data.name
            facebook_connection.user_data.user_id = data.id
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
    }
    else if (options.error) {
      options.error("No access token provided.")
    }
  },

  share:function(url){
    // TODO: Not implemented yet
  },

  // post a Facebook status
  //
  // You must either have a access token saved to user_data.access_token or pass 
  //  one in with the token option
  //
  // OPTIONS
  //    error:    the callback after an error in the request
  //    message:  the body of the status update
  //    success:  the callback after successful request
  //    token:    override saved token for request
  //
  // Example
  //
  //    facebook_connection.post({
  //      success: function(data) {
  //        alert("successfully updated status!")
  //      },
  //      error: function(error) {
  //        alert("error updating status: " + error)
  //      },
  //      message: "Posting isn't that hard...",
  //      token: qlkq2j32lk34
  //    })
  post:function(options) {
    options = (options?options:{})
    if(options.token === undefined && facebook_connection.user_data)
      options.token = facebook_connection.user_data.access_token

    var url = "https://graph.facebook.com/me/feed?access_token="+options.token
    $.post(url, {message: options.message})
        .success(options.success)
        .error(options.failure)
  },

  // logout of Facebook
  //
  // You must be have an access token saved to user_data.access_token
  //
  // success - The callback for successful logout
  // error   - The callback for error on logout
  logout:function(success, error) {
    // Thanks to @keganzo for the url
    // http://goo.gl/xBHcj
    facebook_connection.logout_success_cb = success
    facebook_connection.logout_error_cb = error

    window.plugins.childBrowser.showWebPage("https://www.facebook.com/logout.php"+
      "?next="+facebook_connection.options.redirect_uri+
      "&access_token=" + facebook_connection.user_data.access_token)
    window.plugins.childBrowser.onLocationChange = facebook_connection.logout_loc_chage
  },

  // INTERNAL function for childBrowser's location change on logout
  logout_loc_chage:function(loc) {
    if (loc.indexOf(facebook_connection.options.redirect_uri) == 0) {
      window.plugins.childBrowser.close()
      if(facebook_connection.logout_success_cb)
        facebook_connection.logout_success_cb()
    }
    else if(loc.indexOf("facebook.com/home.php") != -1) {
      //fail!
      window.plugins.childBrowser.close()
      if(facebook_connection.logout_error_cb)
        facebook_connection.logout_error_cb()
    }
  }
}