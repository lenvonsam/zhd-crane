$(function() {
  $('body').removeClass('menu-bg')
  $('body').addClass('menu-bg')

  $('.in-btn').click(() => {
    window.location.href = '/inStorage'
  })
  $('.out-btn').click(() => {
    window.location.href = '/'
  })
  $('.menu-close').click(() => {
    logout()
    window.location.href = '/login'
  })
  $('.out-query-btn').click(() => {
    window.location.href = '/outedQuery'
  })
})
