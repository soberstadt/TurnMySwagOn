this.swagger = "off"

var twitter_options = { 
    consumerKey: 'o7zgkGZVKaTP1iZrPI7YA',
    consumerSecret: 'dT5LcbkQMjsupHJK7swl3YGJB9wyQeWV7rNpw0PVBY',
    callbackUrl: 'http://swagon.herokuapp.com/accept_twitter.txt' },
    twitter_oauth,
    twitterLocalStoreKey = "twitter_info"

this.switchClick = function () {
  if(window.clickable !== false) {
    window.clickable = false

    $(this).toggleClass("checked")

    if(window.swagger == "off") {
      window.swagger = "on"
      if((window.twitter && window.twitter.enabled) || window.facebook)
        showPostBox()
      else {
        setTimeout(function() { window.clickable = true },500)
        $('#message_box_login').removeClass('hidden_top')
      }
    }
    else {
      window.swagger = "off"
      setTimeout(function() { window.clickable = true },500)
      $('#message_box_login').addClass('hidden_top')
    }
  }
}

function showPostBox() {
  $('#message_box_post').removeClass('hidden_top')
  if(window.facebook && window.facebook.enabled) {
    $("#facebook_name").show()
    $("#facebook_name span").html(window.facebook.user_name)
  }
  else
    $("#facebook_name").hide()

  if(window.twitter && window.twitter.enabled) {
    $("#twitter_name").show()
    $("#twitter_name span").html(window.twitter.screen_name)
  }
  else
    $("#twitter_name").hide()

  $('#post_message').val("I just turned my swag on, like a boss. #SwagOn http://swag.256design.com/get")
}

function hideLoginBox () {
  $('#message_box_login').addClass('hidden_top')
  window.clickable = true
}

this.twitterClick = function () {
  hideLoginBox()
  cancelPost()

  if(window.twitter && window.twitter.enabled) {
    window.twitter.enabled = false
  }
  else if (window.twitter) {
    window.twitter.enabled = true
  }
  else {
    twitter_login()
  }
}

this.facebookClick = function () {
  hideLoginBox()
  cancelPost()

  if(window.facebook && window.facebook.enabled) {
    window.facebook.enabled = false
  }
  else if (window.facebook) {
    window.facebook.enabled = true
  }
  else {
    facebook_login()
  }
}

function twitter_login () {
  if(window.plugins && window.plugins.childBrowser) {
    var requestParams;
    
    // Set childBrowser callback to detect our oauth_callback_url
    window.plugins.childBrowser.onLocationChange = function(loc) {
      // If user hit "No, thanks" when asked to authorize access
      if (loc.indexOf("?denied") >= 0) {
        app_alert("Premission denied")
        window.plugins.childBrowser.close();
        return;
      }
      
      // The supplied oauth_callback_url for this session is being loaded
      if (loc.indexOf(twitter_options.callbackUrl) >= 0) {
        window.plugins.childBrowser.close();
        var index, verifier = '';            
        var params = loc.substr(loc.indexOf('?') + 1);
        
        params = params.split('&');
        for (var i = 0; i < params.length; i++) {
            var y = params[i].split('=');
            if(y[0] === 'oauth_verifier') {
                verifier = y[1];
            }
        }
   
        // Exchange request token for access token
        twitter_oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams,
          function(data) {
            var accessParams = {};
            var qvars_tmp = data.text.split('&');
            for (var i = 0; i < qvars_tmp.length; i++) {
              var y = qvars_tmp[i].split('=');
              accessParams[y[0]] = decodeURIComponent(y[1]);
            }
            twitter_oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
            
            // Save access token/key in localStorage
            window.twitter = {};
            window.twitter.accessTokenKey = accessParams.oauth_token;
            window.twitter.accessTokenSecret = accessParams.oauth_token_secret;
            console.log("Storing token key/secret in localStorage");
            localStorage.setItem(twitterLocalStoreKey, JSON.stringify(window.twitter));

            twitter_oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
              function(data) {
                var screen_name = JSON.parse(data.text).screen_name
                console.log("twitter screen_name: " + screen_name)
                window.twitter.enabled = true
                window.twitter.screen_name = screen_name
               },
              function(data) { 
                app_alert('Error getting twitter credentials. :('); 
                console.log("twitter Error " + data); 
              }
            );
          },
          function(data) { 
            app_alert('Error : No Authorization'); 
            console.log("twitter Error " + data); 
          }
        );
      }
    };  
    
    // Note: Consumer Key/Secret and callback url always the same for this app.        
    twitter_oauth = OAuth(twitter_options);
    twitter_oauth.get('https://api.twitter.com/oauth/request_token',
      function(data) {
        requestParams = data.text;
        console.log("twitter requestParams: " + data.text);
        window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
          { showLocationBar : false })
      },
      function(data) { 
        app_alert('Error getting twitter credentials. :('); 
        console.log("twitter Error " + data); 
      }
    );
  }
  else
    app_alert("No childBrowser!")
}

function facebook_login () {
  facebook_connection.init()
}

function app_alert (message) {
  alert(message)
}

function init_oauth () {
  window.oauth = OAuth(twitter_options)
}

function cancelPost () {
  $('#post_message').val("")
  $('#message_box_post').addClass('hidden_top')
}

function sharePost () {
  var trimmed = $('#post_message').val().replace(/^\s+|\s+$/g, '')
  $('#post_message').val(trimmed)
  
  if(trimmed.length == 0) {
    app_alert("You can't share with no swag... how about you add a message?")
    $('#post_message').focus()
    return;
  }

  if(window.twitter && window.twitter.enabled) {
    twitter_oauth.post(
      'https://api.twitter.com/1/statuses/update.json',
      { 'status' : trimmed,  // jsOAuth encodes for us
      'trim_user' : 'true' },
      function(data) {
        app_alert("Successfully shared.")
        cancelPost()
      },
      function(data) { 
        app_alert('Error posting to Twitter :('); 
      }
    ) 
  }
}

$('#swag_switch').on("mousedown", switchClick)
$('#post_cancel').click(cancelPost)
$('#post_share').click(sharePost)
$('.twitter').click(twitterClick)
$('.facebook').click(facebookClick)

// check for saved access tokens
var storedAccessData, rawData = localStorage.getItem(twitterLocalStoreKey)
if (rawData !== null) {
  storedAccessData = JSON.parse(rawData)
  twitter_options.accessTokenKey = storedAccessData.accessTokenKey
  twitter_options.accessTokenSecret = storedAccessData.accessTokenSecret
    
  twitter_oauth = OAuth(twitter_options)
  twitter_oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
    function(data) {
      var screen_name = JSON.parse(data.text).screen_name
      console.log("Success getting Twitter credentials. screen_name: " + screen_name)
      window.twitter = {
        enabled : true,
        screen_name : screen_name
      }
    },
    function(data) { 
      alert('Error with stored user data. Re-start authorization.')
      twitter_options.accessTokenKey = ''
      twitter_options.accessTokenSecret = ''
      localStorage.removeItem(twitterLocalStoreKey)
      console.log("No Twitter Authorization from localStorage data")
    }
  );
} 
delete storedAccessData
delete rawData
