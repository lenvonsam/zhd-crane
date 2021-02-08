/**
 * 吊秤操作公用方法
 * 吊秤公用调用组件方法
 */

var CRANE_FUNCS = {
  // 初始化吊秤组件
  initCraneComponent: function() {
    // 初始化底部磅秤按钮
    var bottomTemp = _.template($('#weightBtns').html())
    $('#secBtns').html(
      bottomTemp({
        btns: [
          {
            img_path: '../img/A1.png',
            img_path_h: '../img/A1H.png'
          },
          {
            img_path: '../img/A2.png',
            img_path_h: '../img/A2H.png'
          },
          {
            img_path: '../img/A3.png',
            img_path_h: '../img/A3H.png'
          },
          {
            img_path: '../img/A4.png',
            img_path_h: '../img/A4H.png'
          }
        ]
      })
    )
  },
  // 加载仓库对应的操作人员
  loadWarehouseOperators: function() {
    getWarehouseName()
      .then(data => {
        console.log('data', data)
        globalConfig.crane.wnameCheckArr = []
        globalConfig.crane.wname = data.wname
        // var str = '<span>操作人员编号：</span>';
        var str = ''
        globalConfig.crane.wnameMap[data.wname].map(itm => {
          // str += '<input class="cbx-employee mr-15 ml-15" readonly type="checkbox" data-name="'+ wname + itm+'"/><span data-name="'+ itm +'" class="cbx-name">'+itm+'</span>';
          // wname
          str +=
            '<div class="employ-cbx" data-name="' + itm + '">' + itm + '</div>'
        })
        $('#topEmployee').html('')
        $('#topEmployee').append(str)
        $('.employ-cbx').click(function() {
          var name = $(this).data('name')
          var idx = Number($(this).text()) - 1
          console.log('idx:>>', idx)
          console.log($(this).hasClass('checked'))
          if (!$(this).hasClass('checked')) {
            $(this).addClass('checked')
            globalConfig.crane.wnameCheckArr.push(name)
          } else {
            $(this).removeClass('checked')
            globalConfig.crane.wnameCheckArr = wnameCheckArr.filter(
              itm => itm !== name
            )
          }
          console.log('wname arr:>>', globalConfig.crane.wnameCheckArr)
        })
      })
      .catch(err => {
        console.log(err)
      })
  },
  // 清楚选择操作人员checkbox高亮部分
  clearTopCbx: function() {
    $('.employ-cbx').each(function() {
      if ($(this).hasClass('checked')) $(this).removeClass('checked')
    })
    globalConfig.crane.wnameCheckArr = []
  },
  // 清除按钮点击事件
  bindTopClearBtnClick: function() {
    $('#topClearBtn').click(() => {
      globalConfig.crane.tdNo = ''
      hideComponentById('zhdOriginPlaceFilterPop')
      hideComponentById('zhdCarNoFilterPop')
      $('.zhd-keyboard').css('display', 'none')
      $('#tdNo').val('')
    })
  },
  // 高亮表格选中行数
  initActiveRect: function(idx) {
    if (idx == -1) {
      $('#wzBody > .active-rect').css('display', 'none')
    } else {
      $('#wzBody > .active-rect').css('top', 68 * idx + 'px')
      $('#wzBody > .active-rect').css('display', 'block')
    }
  },
  // 更新吊秤实际重量
  updateFactWeight: function(weight) {
    $('#weightInfo').text(weight)
  },
  /**
   * 根据品名、材质、规格、产地、长度相等，能合并一同绑定出库
   * @param origin 原物资
   * @param compare 对比物资
   **/
  isTheSame: function(origin, compare) {
    console.log('is the same', origin, compare)
    var orginStr =
      origin.productBrandName +
      '**' +
      origin.specification +
      '**' +
      origin.prodAreaName +
      '**' +
      origin.productTextureName +
      '**' +
      origin.length
    var compareStr =
      compare.productBrandName +
      '**' +
      compare.specification +
      '**' +
      compare.prodAreaName +
      '**' +
      compare.productTextureName +
      '**' +
      compare.length
    console.log(compareStr, orginStr)
    return orginStr == compareStr
  },
  /** 
    板材物资合并秤重规则
    productClassName 物资大类
    productBrandName 品名
    warehouseName 仓库名称
    specification1 厚度(mm)
    pecification2 宽度(mm)
  **/
  plankCompare: function(origin, compare) {
    var originStr =
      origin.specification1 +
      '**' +
      origin.specification2 +
      '**' +
      origin.warehouseName
    var compareStr =
      compare.specification1 +
      '**' +
      origin.specification2 +
      '**' +
      origin.warehouseName
    console.log('plank origin:>>', originStr, '; compare:>>', compareStr)
    return originStr == compareStr
  },
  // 绑定磅秤按钮事件
  bindCraneBtn: function(rowIndex) {
    var temp = $('#wzBody .tr')
      .eq(rowIndex)
      .find('.crane-btn')
    temp.click(function(e) {
      e.stopPropagation()
      console.log('已经绑定')
      console.log($(this).data('bidx'))
      let btnIdx = $(this).data('bidx')
      let rowIdx = $(this).data('ridx')
      $(this).unbind()
      let selectArray = []
      globalConfig.crane.linkMap[btnIdx] = selectArray
      console.log(
        'after unbind crane btn:>>',
        globalConfig.crane.linkMap[btnIdx]
      )
      $('.crane-btn[data-bidx="' + btnIdx + '"]').remove()
      CRANE_FUNCS.showMultiCranePart(false, btnIdx)
      if (selectArray.length == 0) {
        $('.weight-btn')
          .eq(btnIdx)
          .css('background-image', 'url("/img/dl.png")')
      }
    })
  },
  // 初始化单个页面的吊秤的socket
  initPageCraneSocket() {
    // websocket
    var socket = io()
    try {
      socket.on('factWeight', function(data, idx) {
        console.log(data + ';' + idx)
        globalConfig.crane.dwt[idx] = data
        // if (Number(data) >= 0)
        $('.weight-btn')
          .eq(idx)
          .find('span')
          .eq(0)
          .text(data)
      })
    } catch (e) {
      console.error('client socket error:>>', e)
    }
  },
  /**
   * 批量修改选择行对应统一提单的车牌号
   */
  batchChangeTableRowCarNo() {
    var rowObj = globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
    console.log('rowObj:>>', rowObj)
    var billCode = rowObj.businessTypeNo
    var originCarNo = rowObj.carNo
    if (originCarNo !== globalConfig.crane.globalShowCarNo) {
      for (var i = 0; i < globalConfig.crane.tableList.length; i++) {
        var temp = globalConfig.crane.tableList[i]
        if (temp.businessTypeNo === billCode) {
          temp.carNo = globalConfig.crane.globalShowCarNo
          globalConfig.crane.tableList[i] = temp
        }
      }
    }
  },
  showWzCount: function(currentBtnIdx) {
    let selectIdxArray = globalConfig.crane.linkMap[currentBtnIdx]
    let count = 0
    selectIdxArray.map(itm => {
      let selectObj = globalConfig.crane.tableList[itm]
      count += selectObj.usableAmount
    })
    if (selectIdxArray.length == 1) {
      let obj = globalConfig.crane.tableList[selectIdxArray[0]]
      count = globalConfig.crane.singleGoodsCount[obj.soleId]
    }
    $('#countIpt').val(count)
  },
  // 退到主页
  exit2MenuPage() {
    // 退出按钮
    $('.main-close').click(() => {
      // logout();
      window.location.href = '/menu'
    })
  },
  // 显示多次称重模块
  showMultiCranePart: function(show, userChooseBtnIdx) {
    var dwtCounts = globalConfig.crane.dwtCounts
    var factWeight = ''
    var topid = 'btntop' + userChooseBtnIdx
    var cbid = 'cb' + userChooseBtnIdx
    var cid = 'wbtnc' + userChooseBtnIdx
    var cntid = 'wbtCnt' + userChooseBtnIdx
    if (show) {
      $('.weight-btn-top-part')
        .eq(userChooseBtnIdx)
        .append(
          '<div style="font-size: 22px; height: 38px" class="row" id="' +
            topid +
            '"><div style="flex: 0 0 100px;">多次称重:</div><div class="cbx"><input id="' +
            cbid +
            '" type="checkbox" data-id="' +
            userChooseBtnIdx +
            '"/></div> <span class="text-center" style="flex: 0 0 70px;">次数:</span><span style="flex: 0 0 66px;" id="' +
            cntid +
            '">0次</span>  <span style="border: 1px solid white; display:inline-block; font-size: 12px; padding: 2px 5px; border-radius: 3px;" id="' +
            cid +
            '" data-id="' +
            userChooseBtnIdx +
            '">取消</span></div>'
        )
      $('#' + cbid).change(function() {
        console.log($(this).is(':checked'))
        var idx = $(this).data('id')
        console.log('cbx idx:>>', idx)
        var cked = $(this).is(':checked')
        dwtCounts[idx]['canEdit'] = cked
        if (cked) {
          $(this)
            .parent()
            .addClass('checked')
        } else {
          $(this)
            .parent()
            .removeClass('checked')
        }
      })
      $('#' + cid).click(function() {
        var btnIdx = $(this).data('id')
        console.log('btnidx:>>', btnIdx)
        if (dwtCounts[btnIdx].canEdit) {
          console.log(dwtCounts[btnIdx])
          if (
            dwtCounts[btnIdx]['records'].length > 0 &&
            dwtCounts[btnIdx]['beforeCancelCount'] < 2
          ) {
            dwtCounts[btnIdx]['records'].pop()
            dwtCounts[btnIdx]['beforeCancelCount'] =
              dwtCounts[btnIdx]['records'].length
          } else if (
            dwtCounts[btnIdx]['records'].length ==
            dwtCounts[btnIdx]['beforeCancelCount']
          ) {
            dwtCounts[btnIdx]['records'].pop()
          } else if (
            dwtCounts[btnIdx]['beforeCancelCount'] >
            dwtCounts[btnIdx]['records'].length
          ) {
            showMsg('不能多次取消')
            return
          }
          let cnt = dwtCounts[btnIdx]['records'].length
          $('#' + cntid).text(cnt + '次')
          var totalWeight = 0
          console.log('dwt records:>>', dwtCounts[userChooseBtnIdx].records)
          dwtCounts[userChooseBtnIdx].records.map(itm => {
            totalWeight += itm
          })
          factWeight = Number(totalWeight / 1000).toFixed(3)
          // 判断是否是一个物资对应多秤
          let currentSidx = globalConfig.crane.linkMap[btnIdx][0]
          let isMulti = false
          Object.keys(globalConfig.crane.linkMap).map(k => {
            let indx = globalConfig.crane.linkMap[k].findIndex(
              im => im == currentSidx
            )
            if (indx >= 0 && k != btnIdx) isMulti = true
          })
          if (isMulti) {
            otherWeight = 0
            Object.keys(globalConfig.crane.linkMap).map(k => {
              let indx = globalConfig.crane.linkMap[k].findIndex(
                im => im == currentSidx
              )
              if (indx >= 0 && k != btnIdx) {
                dwtCounts[k].records.map(c => {
                  otherWeight += Number(c)
                })
              }
            })
            factWeight = Number((totalWeight + otherWeight) / 1000).toFixed(3)
          }
          CRANE_FUNCS.updateFactWeight(factWeight)
        }
      })
    } else {
      // 减掉取消绑定的重量
      var totalWeight = 0
      dwtCounts[userChooseBtnIdx].records.map(itm => {
        totalWeight += Number(itm)
      })
      var showWeight = Number($('#weightInfo').text()) * 1000
      factWeight = Number((showWeight - totalWeight) / 1000).toFixed(3)
      CRANE_FUNCS.updateFactWeight(factWeight)
      dwtCounts[userChooseBtnIdx].canEdit = false
      dwtCounts[userChooseBtnIdx].records = []
      $('#' + cbid).unbind()
      $('#' + cid).unbind()
      $('#' + topid).remove()
    }
    globalConfig.crane.dwtCounts = dwtCounts
  }
}
