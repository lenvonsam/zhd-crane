$(function () {
  $('body').removeClass('login-bg')
  $('body').addClass('login-bg')
  var pageType = $('input[name="loginType"]').val()
  if (pageType == 1) showMsg('用户登录超时')
  $('#username').focus(function (e) {
    console.log(e)
    $('.zhd-keyboard').css('display', 'none')
    globalFocusDom = '#username'
    // $('.zhd-keyboard').css('top', (e.currentTarget.offsetHeight + e.currentTarget.offsetTop + 120) + 'px')
    // $('.zhd-keyboard').css('left', (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth + 100) + 'px')
    $('.zhd-keyboard').css('display', 'block')
  })

  $('#password').focus(function (e) {
    $('.zhd-keyboard').css('display', 'none')
    globalFocusDom = '#password'
    // $('.zhd-keyboard').css('top', (e.currentTarget.offsetHeight + e.currentTarget.offsetTop + 160) + 'px')
    // $('.zhd-keyboard').css('left', (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth + 100) + 'px')
    $('.zhd-keyboard').css('display', 'block')
  })
  $('#loginBtn').click(function () {
    let username = $('#username').val()
    let password = $('#password').val()
    $('.zhd-keyboard').css('display', 'none')
    if (username.trim().length == 0) {
      showMsg('用户名不能为空')
    } else if (password.trim().length == 0) {
      window.showMsg('密码不能为空')
    } else {
      loading('数据请求中，请耐心等待...')
      request('/login', {username: username.trim(), pwd: hexMd5(password.trim())}).then(resp => {
        console.log(resp)
        hideLoad()
        if (resp.status == 0 && resp.data != null) {
          console.log("跳转")
          window.location.href = "/menu"
        } else {
          showMsg(resp.message)
          // console.error(resp.message)
        }
      }).catch(err => {
        hideLoad()
        console.error(err)
        showMsg(err.responseText || '网络异常')
      })
    }
  })
})