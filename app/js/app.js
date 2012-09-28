this.switchClick = function () {
  $(this).toggleClass("checked")
}

$('#swag_switch').on("mousedown", switchClick)