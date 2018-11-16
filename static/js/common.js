var globalTimeout = null;
function showMsg(msgInfo) {
  if (globalTimeout) clearTimeout(globalTimeout);
  $("body").append(`<div class="message error">${msgInfo}</div>`);
  $(".message.error").animate({ top: "15px" });
  globalTimeout = setTimeout(function() {
    $(".message.error").animate({ top: "-50px" }, 500, function() {
      $(".message.error").remove();
    });
  }, 2000);
}

// 用户点击浏览器全屏
function fullScreen() {
  var el = document.documentElement;
  var rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (typeof rfs != "undefined" && rfs) {
    rfs.call(el);
  }
  return;
}

var kb = null;
var kbDrag = false;

function initKeyboardDrag() {
  kb = document.getElementsByClassName("zhd-keyboard")[0];
  kb.addEventListener("mousedown", kbBeforeDrag, true);
  kb.addEventListener("mousemove", kbOnDrag, true);
  kb.addEventListener("mouseup", kbEndDrag, true);
}

function kbEndDrag() {
  kbDrag = false;
  // dragdiv.className="enddrag";
}

function kbBeforeDrag(ev) {
  if (!kbDrag) {
    kbDrag = true;
    var l = kb.offsetLeft;
    var t = kb.offsetTop;
    offsetx = ev.clientX - l;
    offsety = ev.clientY - t;
  } else {
    kb.removeEventListener("mousemove", kbOnDrag);
    kbDrag = false;
    return;
  }
}

function kbOnDrag(ev) {
  if (!kbDrag) {
    // dragdiv.className = "enddrag";
    return;
  } else {
    // dragdiv.className = "ondrag";

    kb.style.left = ev.clientX - offsetx + "px";
    kb.style.top = ev.clientY - offsety + "px";
  }
}

var globalFocusDom = "";
$(function() {
  $("body").dblclick(function(e) {
    e.stopPropagation();
    console.log("document body click");
    $(".zhd-keyboard").css("display", "none");
  });
  $(".num").click(function(e) {
    e.stopPropagation();
    var idx = $(this).data("index");
    console.log(idx);
    var origin = $(globalFocusDom).val();
    if (idx == 11) {
      // 退格操作
      var backVal = "";
      if (origin.length > 0) {
        backVal = origin.substring(0, origin.length - 1);
        $(globalFocusDom).val(backVal);
      }
    } else if (idx == 12) {
      // 清除全部操作
      $(globalFocusDom).val("");
    } else {
      var newVal = `${origin}${idx}`;
      $(globalFocusDom).val(newVal);
    }
    if (globalFocusDom == "#tdNo") {
      var currentVal = $(globalFocusDom).val();
      console.log("currentVal:>>" + currentVal);
      if (currentVal.length == 11) {
        $("#topAddBtn").click();
        $(".zhd-keyboard").css("display", "none");
      }
    }
  });
  initKeyboardDrag();
  // 屏蔽鼠标右键
  // $(document).bind('contextmenu', function(e) {
  //   console.log(e.which)
  //   return false
  // })
});
