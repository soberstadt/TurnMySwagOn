this.swagger = "off"

var twitter_options = { 
    consumerKey: 'DZqGJ4FptGhFcrkhCNWJWw',
    consumerSecret: 'DxAND4An72rftPDMq6BYFV3sq9AwZi9yDuWx9rJTA',
    callbackUrl: 'http://www.256design.com/swag' };

this.switchClick = function () {
  if(window.clickable !== false) {
    window.clickable = false

    $(this).toggleClass("checked")

    if(window.swagger == "off") {
      window.swagger = "on"
      if(window.twitter || window.facebook)
        $('#message_box_post').removeClass('hidden_top')
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

function hideLoginBox () {
  $('#message_box_login').addClass('hidden_top')
  window.clickable = true
}

this.twitterClick = function () {
  hideLoginBox()

  if(window.twitter == "disabled") {
    // enable twitter
  }
  else if (window.twitter) {
    window.twitter = "disabled"
  }
  else {
    twitter_login()
  }
}

this.facebookClick = function () {
  hideLoginBox()
}

function twitter_login () {
  if(window.plugins && window.plugins.childBrowser) {
    if(window.oauth === undefined)
      init_oauth()
    oauth.get('https://api.twitter.com/oauth/request_token',
        function(data) {
          requestParams = data.text
          //$('#oauthStatus').html('<span style="color:blue;">Getting authorization...</span>')
          window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
                  { showLocationBar : false })
          // check if child browser already has listener
          if (typeof window.plugins.childBrowser.onLocationChange !== "function")
            window.plugins.childBrowser.onLocationChange = childBrowserLocChange
        },
        function(data) { 
          app_alert('Error : No Authorization')
          //$('#oauthStatus').html('<span style="color:red;">Error during authorization</span>')
        }
    )
  }
  else
    app_alert("No childBrowser!")
}

function childBrowserLocChange (newLoc) {
  console.log("childBrowser loc change: " + newLoc)

  // If user hit "No, thanks" when asked to authorize access
  if (newLoc.indexOf("?denied") >= 0 || newLoc === "http://www.256design.com/swag") {
    app_alert("Twitter Authorization Denied")
    window.plugins.childBrowser.close()
    return
  }
  // The supplied oauth_callback_url for this session is being loaded
  if (newLoc.indexOf("http://www.256design.com/swag?") >= 0) {
    // EXTRACT VERIFIER
    var data  = newLoc.split("?")[1].split("&")
    this.twitter.oauth_token = data[0].split("=")[1]
    this.twitter.oauth_verifier = data[1].split("=")[1]

    // Exchange request token for access token 
    oauth.get('https://api.twiter.com/oauth/access_token?oauth_verifier='+this.twitter.oauth_verifier+'&'+requestParams,
      function (data) {
        console.log(data)
        // SUCCESS HANDLER: EXTRACT ACCESS TOKEN KEY and SECRET
        // SAVE TOKEN KEY/SECRET in oauth obj 
        // SAVE TOKEN KEY/SECRET in localStorage
        // CALL oauth.get() TO GET USER'S screen_name 
        window.plugins.childBrowser.close()
      },
      function () {
        // FAIL HANDLER
        window.plugins.childBrowser.close()
        app_alert("Failed to obtain access token. :(")
      }
    )
  }
}

function app_alert (message) {
  alert(message)
}

function init_oauth () {
  window.oauth = OAuth(twitter_options)
}

$('#swag_switch').on("mousedown", switchClick)
$('.twitter').click(twitterClick)
$('.facebook').click(facebookClick)