$(function() {
  $('body').removeClass()
  $('body').addClass('main-bg')

  // 初始化底部磅秤按钮
  var datas = {
    btns: [{
      img_path: '../img/A1.png',
      img_path_h: '../img/A1H.png'
    }, {
      img_path: '../img/A2.png',
      img_path_h: '../img/A2H.png',
    }, {
      img_path: '../img/A3.png',
      img_path_h: '../img/A3H.png',
    }, {
      img_path: '../img/A4.png',
      img_path_h: '../img/A4H.png',
    }]
  }
  var craneNames = ['A1', 'A2', 'A3', 'A4']
  // 磅秤数组下标和物资数组下标相对应
  var linkMap = {
    0: -1,
    1: -1,
    2: -1,
    3: -1
  }
  // 吊秤重量
  let w1 = 0
  let w2 = 0
  let w3 = 0
  let w4 = 0

  var factWeight = ''
  var dwt = [w1, w2, w3, w4]
  var bottomTemp = _.template($('#weightBtns').html())
  $('#secBtns').html(bottomTemp(datas))
  $('.weight-btn').click(function() {
    let selectObj = tableList[selectRowIndex]
    console.log(selectObj)
    let cnt = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
    if ((selectObj.goodsMetering == '理计' && selectObj.dataAwedit == 0) || selectObj.mtype == 0) {
      showMsg('无需关联吊秤可以直接出库')
      return
    }
    console.log('click me')
    let btnIdx = Number($(this).data('index'))
    console.log('btnRowIndx:>> ' + linkMap[btnIdx])
    let idx = (Object.keys(linkMap).map(itm => linkMap[itm])).findIndex(it => it == selectRowIndex)
    if (idx >= 0 && linkMap[btnIdx] > -1) {
      // alert('此物资已关联设备')
      console.log('此物资已关联设备')
      selectRowIndex = linkMap[btnIdx]
      initActiveRect(selectRowIndex)
      showWzCount()
      factWeight = dwt[btnIdx]
      updateFactWeight(factWeight)
      return
    }
    if (linkMap[btnIdx] == -1 && selectRowIndex >= 0 && idx < 0) {
      let result = window.confirm('你确定要关联此设备吗?')
      if (result) {
        $(this).next().css('display', 'block')
        linkMap[btnIdx] = selectRowIndex
        $('#wzBody .tr').eq(selectRowIndex).find('.td').eq(9).html("")
        $('#wzBody .tr').eq(selectRowIndex).find('.td').eq(9).html('<div class="crane-btn column"><span>' + craneNames[btnIdx] + '</span></div>')
        showWzCount()
        factWeight = dwt[btnIdx]
        updateFactWeight(factWeight)
        console.log($(this))
        $(this).css('background-image', 'url(/img/gl.png)')
      }
    } else {
      console.log('currentidx:>>' + selectRowIndex)
      console.log('btnidx:>>' + btnIdx)
      if (selectRowIndex == -1) {
        showMsg('请选择关联设备的物资')
      } else if (selectRowIndex != linkMap[btnIdx]) {
        (linkMap[btnIdx] == -1) ? showMsg('该物资已被关联到其他设备'): showMsg('此设备已关联其他物资')
      }
    }
  })

  // websocket
  var socket = io()
  socket.on('factWeight', function(data, idx) {
    console.log(data + ';' + idx)
    console.log(typeof data)
    dwt[idx] = data
    if (Number(data) > 0) $('.weight-btn').eq(idx).find('span').eq(0).text(data)
    // const linkDetailIndex = linkMap[idx]
    // if (linkDetailIndex == selectRowIndex && selectRowIndex >= 0) {
    //   updateFactWeight(data)
    // }
  })
  // 提单号
  var tdNo = ''
  // 物资列表
  var tableTemp = _.template($('#tbodyPart').html())
  var selectRowIndex = -1
  var tableList = []
  var trKeys = ['sbillBillcode', 'partsnameName', 'goodsSpec', 'goodsProperty1', 'productareaName', 'goodsMaterial', 'goodsMetering', 'goodsProperty4', 'goodsProperty5']
  $('#topAddBtn').click(() => {
    tdNo = $('#tdNo').val()
    request('/outWaitStorageQuery', {
      sbillBillcode: 'TD' + tdNo
    }).then(res => {
      console.log(res)
      if (res.status == 0) {
        // showMsg('用户过期')
        if (tableList.length == 0) {
          tableList = res.data.data
          updateTableData(tableList)
        } else {
          let otherSelectRowObj = {}
          let currentTD = tableList[selectRowIndex]['sbillBillbatch']
          console.log('currentTD:>>' + currentTD)
          Object.keys(linkMap).map(itm => {
            if (linkMap[itm] >= 0) {
              otherSelectRowObj[tableList[linkMap[itm]]['sbillBillbatch']] = itm
            }
          })
          console.log(otherSelectRowObj)
          selectRowIndex = -1
          res.data.data.map(itm => {
            let idx = tableList.findIndex(item => item.sbillBillbatch == itm.sbillBillbatch)
            if (idx < 0) {
              tableList.push(itm)
            }
          })
          updateTableData(tableList)
          selectRowIndex = tableList.findIndex(itm => itm.sbillBillbatch == currentTD)
          console.log('update row index:>>' + selectRowIndex)
          Object.keys(otherSelectRowObj).map(k => {
            let idx = tableList.findIndex(itm => itm.sbillBillbatch == k)
            let btnIdx = otherSelectRowObj[k]
            linkMap[btnIdx] = idx
            $('#wzBody .tr').eq(idx).find('.td').eq(9).html("")
            $('#wzBody .tr').eq(idx).find('.td').eq(9).html('<div class="crane-btn column"><span>' + craneNames[btnIdx] + '</span></div>')
          })
          initActiveRect(selectRowIndex)
        }
        console.log(tableList)
      } else if (resp.status == -2) {
        window.location.href = "/login?type=1"
      } else {
        showMsg(resp.message)
      }
    }).catch(err => {
      console.error(err)
      showMsg(err)
    })
  })
  $('#topClearBtn').click(() => {
    tdNo = ''
    $('#tdNo').val(tdNo)
  })

  initActiveRect(selectRowIndex)

  // 物资重量数量输入
  var countVal = $('#countIpt').val()
  console.log(typeof $('#countIpt').val())
  $('#countMinus').click(() => {
    countVal = Number($('#countIpt').val())
    if (countVal == '' || isNaN(Number(countVal))) {
      countVal = 0
    } else {
      countVal = Number(countVal)
      countVal--
      if (countVal < 0) countVal = 0
    }
    $('#countIpt').val(countVal)
  })
  $('#countAdd').click(() => {
    countVal = Number($('#countIpt').val())
    if (countVal == '' || isNaN(Number(countVal))) {
      countVal = 1
    } else {
      countVal++
    }
    $('#countIpt').val(countVal)
  })
  // 显示物资重量
  $('#weightInfo').text('')

  $('#weightInfoWrap').click(() => {
    let w = $('#weightInfo').text()
    let cnt = $('#countIpt').val()
    if (Number(w) <= 0) {
      showMsg('重量必须大于0')
      return
    }
    let currentObj = tableList[selectRowIndex]
    let currentTd = currentObj.sbillBillcode
    request('/lockTd', {
      tdNo: currentTd
    }).then(resp => {
      console.log(resp)
      if (resp.status == 0) {
        console.log('锁库成功')
        request('/outStorage', {
          oconsignBillcode: currentObj.oconsignBillcode,
          oconsignBillbatch: currentObj.oconsignBillbatch,
          goodsNum: cnt,
          goodsWeight: w
        }).then(res => {
          console.log(res)
          if (res.status == 0) {
            outStorageSuccess(currentObj)
          } else if (res.status == -2) {
            showMsg('账户已禁用')
            request('/unlockTd', {
              tdNo: currentTd
            })
          } else {
            showMsg(res.message || '网络异常')
            request('/unlockTd', {
              tdNo: currentTd
            })
          }
        }).catch(e => {
          console.log(e)
          request('/unlockTd', {
            tdNo: currentTd
          })
          showMsg(e)
        })
      } else if (resp.status == -2) {
        showMsg('账户已禁用')
      } else {
        showMsg(resp.message || '网络异常')
      }
    }).catch(err => {
      console.log(err)
      showMsg(err)
    })

    // 出库成功，自动删除明细
    // let originCount = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
    // let currentCount = $('#countIpt').val()
    // if (currentCount < originCount) {
    // }
    // request()
  })

  // 退出按钮
  $('.main-close').click(() => {
    logout()
    window.location.href = "/login"
  })


  // 计重
  // $('#calcWeight').click(() => {
  //   alert('集中')
  // })
  // 确认
  // $('#confirmAction').click(() => {
  //   alert('确认')
  // })
  // 取消
  // $('#cancelAction').click(() => {
  //   alert('取消')
  // })
  // 提交
  // $('#submitAction').click(() => {
  //   alert('提交')
  // })
  function outStorageSuccess(currentObj) {
    let uniqueCode = currentObj.sbillBillbatch
    let weightBtnIdx = (Object.keys(linkMap).map(itm => linkMap[itm])).findIndex(itm => itm == selectRowIndex)
    let otherSelectRowObj = {}
    Object.keys(linkMap).map(itm => {
      if (itm != weightBtnIdx && linkMap[itm] >= 0) {
        otherSelectRowObj[tableList[linkMap[itm]]['sbillBillbatch']] = itm
      }
    })
    console.log('weightBtnIdx:>>>' + weightBtnIdx)
    tableList = tableList.filter(itm => itm.sbillBillbatch != uniqueCode)
    selectRowIndex = -1
    updateTableData(tableList)
    Object.keys(otherSelectRowObj).map(k => {
      let idx = tableList.findIndex(itm => itm.sbillBillbatch == k)
      let btnIdx = otherSelectRowObj[k]
      $('#wzBody .tr').eq(idx).find('.td').eq(9).html("")
      $('#wzBody .tr').eq(idx).find('.td').eq(9).html('<div class="crane-btn column"><span>' + craneNames[btnIdx] + '</span></div>')
    })

    linkMap[weightBtnIdx] = -1
    initActiveRect(selectRowIndex)
    $('#countIpt').val(countVal)
    $('.weight-btn').eq(weightBtnIdx).css('background-image', 'url(/img/dl.png)')
    $('#weightInfo').text('')
    dwt[weightBtnIdx] = 0
    $('.weight-btn').eq(weightBtnIdx).find('span').eq(0).text(dwt[weightBtnIdx])
    showMsg('该物资已出库成功')
  }

  function updateTableData(data) {
    $('#wzBody .tr').remove()
    $('#wzBody').append(tableTemp({
      data,
      keys: trKeys
    }))
    $('#wzBody .tr').click(function() {
      var rowIdx = $(this).data('rowindex')
      selectRowIndex = Number(rowIdx)
      console.log('selectRowIndex:>>' + selectRowIndex)
      initActiveRect(selectRowIndex)
      // 判断是否可以直接出库
      let selectObj = tableList[selectRowIndex]
      console.log(selectObj)
      let cnt = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
      if ((selectObj.goodsMetering == '理计' && selectObj.dataAwedit == 0) || selectObj.mtype == 0) {
        console.log('enter')
        $('#countIpt').val(cnt)
        let weight = formatWeight(Number(cnt * selectObj.goodsProperty1 * selectObj.goodsProperty2))
        if (selectObj.mtype == 0) weight = selectObj.goodsWeight
        $('#weightInfo').text(weight)
      } else {
        $('#countIpt').val(cnt)
        $('#weightInfo').text('')
      }
    })
  }

  function showWzCount() {
    let selectObj = tableList[selectRowIndex]
    count = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
    $('#countIpt').val(count)
  }
})

function formatWeight(val) {
  let w = Number(val)
  if (isNaN(w)) {
    return '0'
  } else {
    let str = w.toString()
    let dotStr = str.substring(str.indexOf('.'))
    if (dotStr.length > 4) {
      let lastNum = Number(str.substring(str.indexOf('.') + 4, str.indexOf('.') + 5))
      let preNum = Number(str.substring(0, str.indexOf('.') + 4))
      if (lastNum >= 5) preNum += 0.001
      return preNum.toFixed(3)
    } else {
      return str
    }
  }
}

function initActiveRect(idx) {
  if (idx == -1) {
    $('#wzBody > .active-rect').css('display', 'none')
  } else {
    $('#wzBody > .active-rect').css('top', (68 * idx) + 'px')
    $('#wzBody > .active-rect').css('display', 'block')
  }
}

function updateFactWeight(weight) {
  $('#weightInfo').text(weight)
}