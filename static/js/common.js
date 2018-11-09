let globalTimeout = null
function showMsg (msgInfo) {
  if (globalTimeout) clearTimeout(globalTimeout)
  $('body').append(`<div class="message error">${msgInfo}</div>`)
  $('.message.error').animate({top: '15px'})
  globalTimeout = setTimeout(function() {
    $('.message.error').animate({top: '-50px'}, 500, function () {
      $('.message.error').remove()
    })
  }, 2000)
}