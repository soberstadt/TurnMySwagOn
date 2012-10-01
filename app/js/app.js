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
    oauth.get('https://api.twitter.com/oauth/request_token',
        function(data) {
          requestParams = data.text
          //$('#oauthStatus').html('<span style="color:blue;">Getting authorization...</span>')
          window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
                  { showLocationBar : false })                   
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

function app_alert (message) {
  alert(message)
}

$('#swag_switch').on("mousedown", switchClick)
$('.twitter').click(twitterClick)
$('.facebook').click(facebookClick)