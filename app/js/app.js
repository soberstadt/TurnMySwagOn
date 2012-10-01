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
}

this.facebookClick = function () {
  hideLoginBox()
}

$('#swag_switch').on("mousedown", switchClick)
$('.twitter').click(twitterClick)
$('.facebook').click(facebookClick)