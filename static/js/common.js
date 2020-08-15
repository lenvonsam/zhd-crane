var globalTimeout = null
function showMsg(msgInfo) {
  if (globalTimeout) clearTimeout(globalTimeout)
  $('body').append(`<div class="message error">${msgInfo}</div>`)
  $('.message.error').animate({ top: '15px' })
  globalTimeout = setTimeout(function() {
    $('.message.error').animate({ top: '-50px' }, 500, function() {
      $('.message.error').remove()
    })
  }, 2000)
}

// 用户点击浏览器全屏
function fullScreen() {
  var el = document.documentElement
  var rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  if (typeof rfs != 'undefined' && rfs) {
    rfs.call(el)
  }
  return
}

var kb = null
var kbDrag = false

function initKeyboardDrag() {
  kb = document.getElementsByClassName('zhd-keyboard')[0]
  kb.addEventListener('mousedown', kbBeforeDrag, true)
  kb.addEventListener('mousemove', kbOnDrag, true)
  kb.addEventListener('mouseup', kbEndDrag, true)
}

function kbEndDrag() {
  kbDrag = false
  // dragdiv.className="enddrag";
}

function kbBeforeDrag(ev) {
  if (!kbDrag) {
    kbDrag = true
    var l = kb.offsetLeft
    var t = kb.offsetTop
    offsetx = ev.clientX - l
    offsety = ev.clientY - t
  } else {
    kb.removeEventListener('mousemove', kbOnDrag)
    kbDrag = false
    return
  }
}

function kbOnDrag(ev) {
  if (!kbDrag) {
    // dragdiv.className = "enddrag";
    return
  } else {
    // dragdiv.className = "ondrag";

    kb.style.left = ev.clientX - offsetx + 'px'
    kb.style.top = ev.clientY - offsety + 'px'
  }
}

function loading(title) {
  $('.zhd-loading .content').text(title)
  $('.zhd-loading').css('display', 'block')
}

function hideLoad() {
  $('.zhd-loading').css('display', 'none')
}

function showModal(id, cb) {
  // $(id + ' .modal-btn.confirm').unbind()
  // $(id + '.modal-btn.cancel').unbind()
  // $(id + '.zhd-modal .content .title').text(title)
  $(id).css('display', 'block')
  $(id + '.zhd-modal .content').animate(
    { opacity: 1 },
    {
      step: function(num, fix) {
        $(this).css('transform', 'scale(' + num + ')')
      },
      speed: 300,
      complete: function() {
        $('.modal-btn.confirm').click(function() {
          $(id).css('display', 'none')
          cb(true)
          $(id).remove()
        })
        $('.modal-btn.cancel').click(function() {
          $(id).css('display', 'none')
          cb(false)
          $(id).remove()
          console.log('模态框已删除')
        })
      }
    }
  )
}

function showPwdModal(id, cb) {
  $(id).css('display', 'block')
  $(id + '.zhd-modal .content').animate(
    { opacity: 1 },
    {
      step: function(num, fix) {
        $(this).css('transform', 'scale(' + num + ')')
      },
      speed: 300,
      complete: function() {
        $(id + ' .modal-btn.confirm').click(function() {
          var iptName = $(id + ' #pwdName').val()
          var iptPwd = $(id + ' #pwdPwd').val()
          $(id).css('display', 'none')
          $('.zhd-keyboard').css('display', 'none')
          cb(true, iptName, iptPwd)
          $(id).remove()
        })
        $(id + ' .modal-btn.cancel').click(function() {
          $(id).css('display', 'none')
          $('.zhd-keyboard').css('display', 'none')
          cb(false)
          $(id).remove()
          console.log('模态框已删除')
        })
      }
    }
  )
}

var globalFocusDom = ''
$(function() {
  // $("body").dblclick(function(e) {
  //   e.stopPropagation();
  //   console.log("document body click");
  //   $(".zhd-keyboard").css("display", "none");
  // });
  $('.num').click(function(e) {
    e.stopPropagation()
    var idx = $(this).data('index')
    console.log(idx)
    var origin = $(globalFocusDom).val()
    if (idx == 11) {
      // 退格操作
      var backVal = ''
      if (origin.length > 0) {
        backVal = origin.substring(0, origin.length - 1)
        $(globalFocusDom).val(backVal)
      }
    } else if (idx == 12) {
      // 清除全部操作
      $(globalFocusDom).val('')
    } else if (idx == 13) {
      // 确定按钮
      $('.zhd-keyboard').css('display', 'none')
    } else {
      var newVal = `${origin}${idx}`
      $(globalFocusDom).val(newVal)
    }
    if (globalFocusDom == '#tdNo') {
      var currentVal = $(globalFocusDom).val()
      console.log('currentVal:>>' + currentVal)
      if (currentVal.length == 11) {
        $('#topAddBtn').click()
        $('.zhd-keyboard').css('display', 'none')
      }
    }
  })
  // initKeyboardDrag();
  // 屏蔽鼠标右键
  // $(document).bind('contextmenu', function(e) {
  //   console.log(e.which)
  //   return false
  // })
})
