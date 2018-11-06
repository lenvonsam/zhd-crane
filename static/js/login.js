$(function () {
  $('body').removeClass()
  $('body').addClass('login-bg')
  var pageType = $('input[name="loginType"]').val()
  if (pageType == 1) showMsg('用户登录超时')
  $('#loginBtn').click(function () {
    let username = $('#username').val()
    let password = $('#password').val()
    if (username.trim().length == 0) {
      showMsg('用户名不能为空')
    } else if (password.trim().length == 0) {
      window.showMsg('密码不能为空')
    } else {
      request('/login', {username: username.trim(), pwd: hexMd5(password.trim())}).then(resp => {
        console.log(resp)
        if (resp.status == 0 && resp.data != null) {
          console.log("跳转")
          window.location.href = "/"
        } else {
          showMsg(resp.message)
          // console.error(resp.message)
        }
      }).catch(err => {
        console.error(err)
        showMsg(err)
      })
    }
  })
})