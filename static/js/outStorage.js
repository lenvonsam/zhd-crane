$(function() {
  // 强制选择车牌号
  var forceSelectCarNo = false
  $('body').removeClass('main-bg')
  $('body').addClass('main-bg')
  // 获取登录者对应的仓库名称
  CRANE_FUNCS.loadWarehouseOperators()
  // 初始化单个页面的吊秤的socket
  CRANE_FUNCS.initPageCraneSocket()
  // 初始底部吊秤
  CRANE_FUNCS.initCraneComponent()
  // 推到主页
  CRANE_FUNCS.exit2MenuPage()
  /**
   * 添加车牌选择组件
   * @author samy
   * @date 2020/05/26
   */
  // 下拉框保存的车牌号
  var carNoForTd = []
  // 当强制选择车牌时保存原有的车牌号
  var originCarNoForId = []
  $('#carnoIptWrap').click(function(e) {
    hideComponentById('zhdOriginPlaceFilterPop')
    if (globalConfig.crane.selectRowIndex < 0) {
      showMsg('请选择物资')
      return
    }
    const cntSelectObj =
      globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
    if (carNoForTd.length === 0 && cntSelectObj.carNo.length > 0) {
      showMsg('此车牌号为手动输入，无需下拉')
      return
    }
    if (carNoForTd.length === 0) {
      showMsg('请输入TD号')
      return
    }
    console.log(e)
    hideComponentById('zhdCarNo')
    $('#zhdCarNoFilterPop .list').html('')
    for (var i = 0; i < carNoForTd.length; i++) {
      if (globalConfig.crane.globalShowCarNo == carNoForTd[i]) {
        $('#zhdCarNoFilterPop .list').append(
          '<div class="item row"><div class="cbx flex align-center"><img src="/img/cbxd.png"/></div><div class="col">' +
            carNoForTd[i] +
            '</div></div>'
        )
      } else {
        $('#zhdCarNoFilterPop .list').append(
          '<div class="item row"><div class="cbx flex align-center"><img src="/img/cbx.png"/></div><div class="col">' +
            carNoForTd[i] +
            '</div></div>'
        )
      }
    }
    $('#zhdCarNoFilterPop .list .item').click(function() {
      var val = $(this)
        .find('.col')
        .eq(0)
        .text()
      globalConfig.crane.globalShowCarNo = val
      console.log('globalCarNo:>>' + globalConfig.crane.globalShowCarNo)
      $('#tdCarNo').val(globalConfig.crane.globalShowCarNo)
      $('#zhdCarNoFilterPop').css('display', 'none')
      if (forceSelectCarNo) {
        for (var i = 0; i < globalConfig.crane.tableList.length; i++) {
          var item = globalConfig.crane.tableList[i]
          if (item.businessTypeNo === 'TD' + tdNo) {
            item.carNo = globalConfig.crane.globalShowCarNo
            globalConfig.crane.tableList[i] = item
          }
        }
        carNoForTd = originCarNoForId
        forceSelectCarNo = false
      } else {
        CRANE_FUNCS.batchChangeTableRowCarNo()
      }
    })
    $('#zhdCarNoFilterPop').css('top', '100px')
    $('#zhdCarNoFilterPop').css('left', e.currentTarget.offsetLeft + 'px')
    var displayStr = $('#zhdCarNoFilterPop').css('display')
    if (displayStr === 'none') {
      $('#zhdCarNoFilterPop').css('display', 'flex')
    } else {
      $('#zhdCarNoFilterPop').css('display', 'none')
    }
  })
  // 行原产地下来 originAreaWrap
  $('#originAreaWrap').click(function(e) {
    if (globalConfig.crane.selectRowIndex < 0) {
      showMsg('请选择物资')
      return
    }
    hideComponentById('zhdCarNoFilterPop')
    hideComponentById('zhdCarNo')
    $('#zhdOriginPlaceFilterPop .list').html('')
    for (var i = 0; i < globalOriginPlaceArr.length; i++) {
      if (globalOriginPlace == globalOriginPlaceArr[i]['supplierOrgName']) {
        $('#zhdOriginPlaceFilterPop .list').append(
          '<div class="item row"><div class="cbx flex align-center"><img src="/img/cbxd.png"/></div><div class="col" data-index="' +
            globalOriginPlaceArr[i]['supplierOrgId'] +
            '">' +
            globalOriginPlaceArr[i]['supplierOrgName'] +
            '</div></div>'
        )
      } else {
        $('#zhdOriginPlaceFilterPop .list').append(
          '<div class="item row"><div class="cbx flex align-center"><img src="/img/cbx.png"/></div><div class="col" data-index="' +
            globalOriginPlaceArr[i]['supplierOrgId'] +
            '">' +
            globalOriginPlaceArr[i]['supplierOrgName'] +
            '</div></div>'
        )
      }
    }
    $('#zhdOriginPlaceFilterPop .list .item').click(function() {
      var val = $(this)
        .find('.col')
        .eq(0)
        .text()
      var idx = $(this)
        .find('.col')
        .eq(0)
        .data('index')
      console.log('idx:>>>>', idx)
      globalOriginPlace = val
      globalOriginPlaceId = idx
      console.log('globalOriginPlace:>>' + globalOriginPlace)
      $('#originAreaIpt').val(globalOriginPlace)
      $('#zhdOriginPlaceFilterPop').css('display', 'none')
      const currentObj =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      currentObj.originPlace = globalOriginPlace
      currentObj.originPlaceId = idx
    })
    $('#zhdOriginPlaceFilterPop').css('top', '100px')
    $('#zhdOriginPlaceFilterPop').css(
      'left',
      e.currentTarget.offsetLeft - 90 + 'px'
    )
    var displayStr = $('#zhdOriginPlaceFilterPop').css('display')
    if (displayStr === 'none') {
      $('#zhdOriginPlaceFilterPop').css('display', 'flex')
    } else {
      $('#zhdOriginPlaceFilterPop').css('display', 'none')
    }
  })
  var userChooseBtnIdx = -1
  // modal template
  var modalTemp = _.template($('#zhdModal').html())

  $('.weight-btn').click(function() {
    var factWeight = ''
    if (globalConfig.crane.selectRowIndex == -1) {
      showMsg('请先选择物资')
      return
    }
    let selectObj =
      globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
    console.log('selectObj:>>', selectObj)
    let cnt = selectObj.usableAmount
    if (selectObj.quantityType == '01' || selectObj.mtype == 0) {
      showMsg('无需关联吊秤可以直接出库')
      return
    }
    let btnIdx = Number($(this).data('index'))
    console.log('btnidx:>>', btnIdx)
    console.log('btnRowIndx:>> ', globalConfig.crane.linkMap[btnIdx])
    console.log(
      'globalConfig.crane.dwt weight:>>',
      globalConfig.crane.dwt[btnIdx]
    )
    let idx = globalConfig.crane.linkMap[btnIdx].findIndex(
      itm => itm == globalConfig.crane.selectRowIndex
    )
    if (idx >= 0) {
      console.log('此物资已关联设备')
      CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)
      CRANE_FUNCS.showWzCount(btnIdx)
      // 判断是否是一个物资绑多个秤
      let isMulti = false
      console.log('globalConfig.crane.linkMap', globalConfig.crane.linkMap)
      Object.keys(globalConfig.crane.linkMap).map(k => {
        let indx = globalConfig.crane.linkMap[k].findIndex(
          im => im == globalConfig.crane.selectRowIndex
        )
        if (indx >= 0 && k != btnIdx) isMulti = true
      })
      // var originWeight = Number($('#weightInfo').text()) * 1000
      // console.log('ismulti:>>>', isMulti, ';originwt:>>', originWeight)
      factWeight = Number(globalConfig.crane.dwt[btnIdx] / 1000).toFixed(3)
      CRANE_FUNCS.updateFactWeight(factWeight)
      userChooseBtnIdx = btnIdx
      console.log('isMuti:>>', isMulti)
      if (
        // isMulti &&
        globalConfig.crane.dwtCounts[userChooseBtnIdx].canEdit
      ) {
        if (Number(globalConfig.crane.dwt[btnIdx]) > 0)
          globalConfig.crane.dwtCounts[userChooseBtnIdx].records.push(
            Number(globalConfig.crane.dwt[btnIdx])
          )
        globalConfig.crane.dwtCounts[userChooseBtnIdx].beforeCancelCount =
          globalConfig.crane.dwtCounts[userChooseBtnIdx].records.length
        $('#wbtCnt' + userChooseBtnIdx).text(
          globalConfig.crane.dwtCounts[userChooseBtnIdx].records.length + '次'
        )
        var totalWeight = 0
        console.log(
          'globalConfig.crane.dwt records:>>',
          globalConfig.crane.dwtCounts[userChooseBtnIdx].records
        )
        globalConfig.crane.dwtCounts[userChooseBtnIdx].records.map(itm => {
          totalWeight += Number(itm)
        })
        factWeight = Number(totalWeight / 1000).toFixed(3)
        if (isMulti) {
          otherWeight = 0
          Object.keys(globalConfig.crane.linkMap).map(im => {
            let ix = globalConfig.crane.linkMap[im].findIndex(
              item => item == globalConfig.crane.selectRowIndex
            )
            if (ix >= 0 && im != userChooseBtnIdx) {
              globalConfig.crane.dwtCounts[im].records.map(w => {
                otherWeight += Number(w)
              })
            }
          })
          console.log('otherweight:>>', otherWeight)
          console.log('totalweight:', totalWeight)
          factWeight = Number((otherWeight + totalWeight) / 1000).toFixed(3)
        }
        CRANE_FUNCS.updateFactWeight(factWeight)
      } else {
        globalConfig.crane.dwtCounts[userChooseBtnIdx].records = []
        globalConfig.crane.dwtCounts[userChooseBtnIdx].beforeCancelCount = 0
        $('#wbtCnt' + userChooseBtnIdx).text(
          globalConfig.crane.dwtCounts[userChooseBtnIdx].records.length + '次'
        )
      }
      return
    }
    // 判断时候相同物资明细
    if (globalConfig.crane.linkMap[btnIdx].length > 0) {
      console.log('selectrowindex:>>>', globalConfig.crane.selectRowIndex)
      console.log('orign idx:>>', globalConfig.crane.linkMap[btnIdx][0])
      let origin =
        globalConfig.crane.tableList[globalConfig.crane.linkMap[btnIdx][0]]
      // 判断是否是单个物资多秤的情况
      let idx = globalConfig.crane.tableList.findIndex(
        itm => itm.soleId == origin.soleId
      )
      let compare =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      console.log('origin obj', origin, origin.soleId)
      console.log('compare obj', compare, compare.soleId)
      if (origin.productClassName == '板材') {
        if (
          origin.warehouseName == '板材定开' ||
          origin.warehouseName == '开平厂'
        ) {
          if (!CRANE_FUNCS.plankCompare(origin, compare)) {
            showMsg('此物资不能不与之前物资合并一起称重')
            return
          }
        } else {
          showMsg('之前物资不是板材定开库的物资，不能合并一起称重')
          return
        }
      } else {
        if (!CRANE_FUNCS.isTheSame(origin, compare)) {
          showMsg('此物资不能与之前的物资合并一起称重')
          return
        }
      }
    }
    // 判断
    if (globalConfig.crane.selectRowIndex >= 0) {
      // 判断是新增绑定物资还是在原有绑定基础上新增物资
      // 默认是新增绑定
      var canMoreToMoreCrane = false
      var otherIdx = -1
      Object.keys(globalConfig.crane.linkMap).map(itm => {
        if (itm != btnIdx) {
          let idx = globalConfig.crane.linkMap[itm].findIndex(
            item => item == globalConfig.crane.selectRowIndex
          )
          if (idx > -1) {
            otherIdx = idx
          }
        }
      })
      if (!(otherIdx == -1 && globalConfig.crane.linkMap[btnIdx].length == 0))
        canMoreToMoreCrane = true
      $('body').append(
        modalTemp({
          modalId: 'linkDevice',
          modalTitle: '您确定要关联此设备吗?'
        })
      )
      showModal('#linkDevice', function(result) {
        if (result) {
          console.log('canMoreToMoreCrane:>>', canMoreToMoreCrane)
          globalConfig.crane.linkMap[btnIdx].push(
            globalConfig.crane.selectRowIndex
          )
          var choosedArr = globalConfig.crane.linkMap[btnIdx]
          var moreCraneIdxs = []
          var moreCraneSelectIdxs = []
          Object.keys(globalConfig.crane.linkMap).map(k => {
            choosedArr.map(subk => {
              var arr = globalConfig.crane.linkMap[k]
              var idx = arr.findIndex(itm => itm == subk)
              if (idx > -1) {
                let subidx = moreCraneIdxs.findIndex(im => im == k)
                if (subidx == -1) moreCraneIdxs.push(k)
                moreCraneSelectIdxs = moreCraneSelectIdxs.concat(
                  moreCraneSelectIdxs,
                  arr
                )
                // console.log('idx:>>', idx, 'arr:>>', arr, 'moreCraneIdxs', moreCraneSelectIdxs)
              }
            })
          })
          // 去重复
          moreCraneSelectIdxs = Array.from(new Set(moreCraneSelectIdxs))
          console.log('去重复后 moreCraneSelect:', moreCraneSelectIdxs)
          $('.weight-btn')
            .eq(btnIdx)
            .next()
            .css('display', 'block')
          // 多个物资绑多个秤
          if (canMoreToMoreCrane) {
            console.log(
              'globalConfig.crane.selectRowIndex:>>',
              globalConfig.crane.selectRowIndex,
              '; btnidx:>>',
              btnIdx
            )
            // 选出多个设备
            moreCraneSelectIdxs.map(itm => {
              $('#wzBody .tr')
                .eq(itm)
                .find('.td')
                .eq(9)
                .html('')
              var rowStr = ''
              moreCraneIdxs.map(item => {
                globalConfig.crane.linkMap[item] = moreCraneSelectIdxs
                rowStr +=
                  '<div class="crane-btn column" data-bidx="' +
                  item +
                  '" data-ridx="' +
                  itm +
                  '"><span>' +
                  globalConfig.crane.craneNames[item] +
                  '</span></div>'
              })
              $('#wzBody .tr')
                .eq(itm)
                .find('.td')
                .eq(9)
                .html(rowStr)
              CRANE_FUNCS.bindCraneBtn(itm)
            })
          } else {
            $('#wzBody .tr')
              .eq(globalConfig.crane.selectRowIndex)
              .find('.td')
              .eq(9)
              .html('')
            $('#wzBody .tr')
              .eq(globalConfig.crane.selectRowIndex)
              .find('.td')
              .eq(9)
              .html(
                '<div class="crane-btn column" data-bidx="' +
                  btnIdx +
                  '" data-ridx="' +
                  globalConfig.crane.selectRowIndex +
                  '"><span>' +
                  globalConfig.crane.craneNames[btnIdx] +
                  '</span></div>'
              )
            CRANE_FUNCS.bindCraneBtn(globalConfig.crane.selectRowIndex)
          }
          CRANE_FUNCS.showWzCount(btnIdx)
          if (canMoreToMoreCrane) {
            factWeight = Number(globalConfig.crane.dwt[btnIdx] / 1000).toFixed(
              3
            )
            CRANE_FUNCS.updateFactWeight(factWeight)
          }
          console.log('hander link btn:>>', globalConfig.crane.linkMap[btnIdx])
          userChooseBtnIdx = btnIdx
          $('.weight-btn')
            .eq(btnIdx)
            .css('background-image', 'url(/img/gl.png)')
          CRANE_FUNCS.showMultiCranePart(false, userChooseBtnIdx)
          CRANE_FUNCS.showMultiCranePart(true, userChooseBtnIdx)
          if (canMoreToMoreCrane) {
            // 增加多次称重模块
            // 默认勾选上
            $('#cb' + userChooseBtnIdx).attr('checked', 'checked')
            $('#cb' + userChooseBtnIdx)
              .parent()
              .addClass('checked')
            globalConfig.crane.dwtCounts[userChooseBtnIdx].canEdit = true
            // 将其他也勾选上
            Object.keys(globalConfig.crane.linkMap).map(itm => {
              let ix = globalConfig.crane.linkMap[itm].findIndex(
                im => im == globalConfig.crane.selectRowIndex
              )
              if (ix >= 0 && itm != userChooseBtnIdx) {
                $('#cb' + itm).attr('checked', 'checked')
                $('#cb' + itm)
                  .parent()
                  .addClass('checked')
                globalConfig.crane.dwtCounts[itm].canEdit = true
              }
            })
          }
        }
      })
    } else {
      console.error('进入未处理的判断')
    }
  })

  /**
   * 初始化提单车牌号
   * @param object fisrtObj
   */
  function initDetailCarNo(fisrtObj) {
    const singleDataCarNum = fisrtObj.carNo || ''
    if (singleDataCarNum.trim().length === 0) {
      forceSelectCarNo = true
      showMsg('该TD没有车牌号，请联系物流部')
      hideComponentById('zhdCarNoFilterPop')
    } else {
      var carnoArr = singleDataCarNum.split(',')
      if (carnoArr.length > 1) {
        forceSelectCarNo = false
        for (var i = 0; i < carnoArr.length; i++) {
          var idx = carNoForTd.findIndex(itm => itm === carnoArr[i])
          if (idx < 0) {
            forceSelectCarNo = true
            carNoForTd.push(carnoArr[i])
          }
        }
        if (forceSelectCarNo) {
          originCarNoForId = carNoForTd
          carNoForTd = carnoArr
          showMsg('车牌号有多个，请选择一个')
          hideComponentById('zhdCarNoFilterPop')
          $('#carnoIptWrap').click()
        } else {
          var tempCarNo = carnoArr[0]
          globalConfig.crane.globalShowCarNo = tempCarNo
          $('#tdCarNo').val(globalConfig.crane.globalShowCarNo)
        }
      } else {
        $('#tdCarNo').val(carnoArr[0])
        globalConfig.crane.globalShowCarNo = carnoArr[0]
        var index = carNoForTd.findIndex(
          itm => itm === globalConfig.crane.globalShowCarNo
        )
        if (index < 0) {
          carNoForTd.push(carnoArr[0])
        }
      }
    }
  }

  // 提单号
  var tdNo = ''
  // 物资列表
  var tableTemp = _.template($('#tbodyPart').html())
  $('#tdNo').focus(function(e) {
    console.log('forceSelectCarNo:>>', forceSelectCarNo)
    if (forceSelectCarNo) return
    $('.zhd-keyboard').css('display', 'none')
    $('#zhdCarNoFilterPop').css('display', 'none')
    globalFocusDom = '#tdNo'
    $('.zhd-keyboard').css('display', 'block')
  })
  var canBtnClick = true
  $('#topAddBtn').click(e => {
    e.stopPropagation()
    globalConfig.crane.selectRowIndex = -1
    CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)
    console.log('forceSelectCarNo:>>' + forceSelectCarNo)
    if (forceSelectCarNo) return
    hideComponentById('zhdOriginPlaceFilterPop')
    $('#zhdCarNoFilterPop').css('display', 'none')
    $('#zhdCarNo').css('display', 'none')
    tdNo = $('#tdNo').val()
    if (tdNo.length == 0) {
      showMsg('请输入提单号')
      return
    }
    $('.zhd-keyboard').css('display', 'none')
    globalOriginPlace = ''
    globalOriginPlaceId = ''
    globalOriginPlaceArr = []
    $('#originAreaIpt').val(globalOriginPlace)
    if (canBtnClick) {
      canBtnClick = false
      request(
        'crane/dc/outStorage',
        {
          businessTypeNo: 'TD' + tdNo
        },
        'get'
      )
        .then(res => {
          canBtnClick = true
          console.log(res)
          if (res.success) {
            // showMsg('用户过期')
            if (!res.data) {
              showMsg('此提单号查无物资明细')
              return
            }
            /**
             * 显示车牌号
             * 一个自动显示，一个以上需要手动选择
             * @author samy
             * @date 2020/05/26
             * FIXME
             * */
            if (res.data.length > 0) {
              initDetailCarNo(res.data[0])
            }
            if (globalConfig.crane.tableList.length == 0) {
              globalConfig.crane.tableList = res.data
              updateTableData(globalConfig.crane.tableList)
            } else {
              // 重新渲染之前选择的物资
              let currentTD = ''
              if (globalConfig.crane.selectRowIndex >= 0)
                currentTD =
                  globalConfig.crane.tableList[
                    globalConfig.crane.selectRowIndex
                  ]['soleId']
              var chooseItems = {}
              console.log(
                'globalConfig.crane.linkMap:>>',
                globalConfig.crane.linkMap
              )
              Object.keys(globalConfig.crane.linkMap).map(itm => {
                if (globalConfig.crane.linkMap[itm].length > 0) {
                  globalConfig.crane.linkMap[itm].map(item => {
                    let keys = Object.keys(chooseItems)
                    let indx = keys.findIndex(
                      im => im == globalConfig.crane.tableList[item]['soleId']
                    )
                    if (indx >= 0) {
                      chooseItems[
                        globalConfig.crane.tableList[item]['soleId']
                      ] =
                        itm +
                        ';' +
                        chooseItems[
                          globalConfig.crane.tableList[item]['soleId']
                        ]
                    } else {
                      chooseItems[
                        globalConfig.crane.tableList[item]['soleId']
                      ] = itm
                    }
                  })
                }
              })
              $('.crane-btn').unbind()
              res.data.map(itm => {
                let idx = globalConfig.crane.tableList.findIndex(
                  item => item.soleId == itm.soleId
                )
                if (idx < 0) {
                  globalConfig.crane.tableList.push(itm)
                } else {
                  /**
                   * 修复车牌号第一次查询返回没有值的问题
                   * @time 2020-10-09
                   * @author samy
                   */
                  var originItem = globalConfig.crane.tableList[idx]
                  if (!originItem.carNo) {
                    globalConfig.crane.tableList[idx] = itm
                  }
                }
              })
              updateTableData(globalConfig.crane.tableList)
              if (currentTD.length != '') {
                globalConfig.crane.selectRowIndex = globalConfig.crane.tableList.findIndex(
                  itm => itm.soleId == currentTD
                )
                CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)
              }
              resetLinkmap()
              console.log('chooseItems:>>>', chooseItems)
              Object.keys(chooseItems).map(k => {
                let idx = globalConfig.crane.tableList.findIndex(
                  itm => itm.soleId == k
                )
                let btnIdx = chooseItems[k]
                console.log('btnIdx:>>', btnIdx)
                console.log('; indx:>>>', btnIdx.toString().indexOf(';'))
                if (btnIdx.toString().indexOf(';') > 0) {
                  // 一个物资多秤
                  let arr = btnIdx.toString().split(';')
                  console.log('arr:>>', arr)
                  arr.map((it, indx) => {
                    globalConfig.crane.linkMap[Number(it)].push(idx)
                    if (indx == 0) {
                      $('#wzBody .tr')
                        .eq(idx)
                        .find('.td')
                        .eq(9)
                        .html('')
                      $('#wzBody .tr')
                        .eq(idx)
                        .find('.td')
                        .eq(9)
                        .html(
                          '<div class="crane-btn column" data-bidx="' +
                            it +
                            '" data-ridx="' +
                            idx +
                            '"><span>' +
                            globalConfig.crane.craneNames[it] +
                            '</span></div>'
                        )
                    } else {
                      $('#wzBody .tr')
                        .eq(idx)
                        .find('.td')
                        .eq(9)
                        .prepend(
                          '<div class="crane-btn column" data-bidx="' +
                            it +
                            '" data-ridx="' +
                            idx +
                            '"><span>' +
                            globalConfig.crane.craneNames[it] +
                            '</span></div>'
                        )
                    }
                  })
                } else {
                  globalConfig.crane.linkMap[btnIdx].push(idx)
                  $('#wzBody .tr')
                    .eq(idx)
                    .find('.td')
                    .eq(9)
                    .html('')
                  $('#wzBody .tr')
                    .eq(idx)
                    .find('.td')
                    .eq(9)
                    .html(
                      '<div class="crane-btn column" data-bidx="' +
                        btnIdx +
                        '" data-ridx="' +
                        idx +
                        '"><span>' +
                        globalConfig.crane.craneNames[btnIdx] +
                        '</span></div>'
                    )
                }
                CRANE_FUNCS.bindCraneBtn(idx)
              })
            }
            console.log(globalConfig.crane.tableList)
          } else if (res.status == -2) {
            window.location.href = '/login?type=1'
          } else {
            showMsg(res.message)
          }
        })
        .catch(err => {
          canBtnClick = true
          console.error(err)
          showMsg(err)
        })
    }
  })
  CRANE_FUNCS.bindTopClearBtnClick()
  CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)

  // 物资重量数量输入
  function canInput() {
    var btnIndex = -1
    Object.keys(globalConfig.crane.linkMap).map(itm => {
      let idx = globalConfig.crane.linkMap[itm].findIndex(
        item => item == globalConfig.crane.selectRowIndex
      )
      if (idx >= 0) btnIndex = itm
    })
    console.log('currentSelect idx:>>', globalConfig.crane.selectRowIndex)
    console.log('currentBtnIdx:>>', btnIndex)
    let selectObj =
      globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
    /**
     * 所有理计物资可以修改数量
     * @author samy
     * @date 2019/07/29
     * @content 需求来源 曹工和线下确认理计物资可以修改数量并能自动计算重量
     * */
    if (selectObj.mtype == 0) {
      return '整卷开平不能修改数量'
    } else if (selectObj.quantityType == '01') {
      return 'ok'
    } else if (btnIndex == -1) {
      return '请先选中关联设备的物资'
    } else if (globalConfig.crane.linkMap[btnIndex].length == 1) {
      if (globalConfig.crane.dwtCounts[btnIndex].canEdit) {
        return '多次称重不能修改数量'
      } else {
        return 'ok'
      }
    } else {
      return '多个物资不能更改数量'
    }
  }
  $('#countIpt').focus(function(e) {
    console.log('count ipt focus')
    $('.zhd-keyboard').css('display', 'none')
    if (canInput() != 'ok') return
    console.log(e)
    globalFocusDom = '#countIpt'
    $('.zhd-keyboard').css('display', 'block')
  })
  // 数量减号事件
  $('#countMinus').click(() => {
    $('.zhd-keyboard').css('display', 'none')
    var iptResult = canInput()
    if (iptResult != 'ok') {
      showMsg(iptResult)
      return
    }
    globalConfig.crane.countVal = Number($('#countIpt').val())
    if (
      globalConfig.crane.countVal == '' ||
      isNaN(Number(globalConfig.crane.countVal))
    ) {
      globalConfig.crane.countVal = 0
    } else {
      globalConfig.crane.countVal = Number(globalConfig.crane.countVal)
      globalConfig.crane.countVal--
      if (globalConfig.crane.countVal <= 0) globalConfig.crane.countVal = 1
    }
    var selectObj =
      globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
    // 判断理计物资不能超过出库最大值
    // if (selectObj.quantityType == '01') {
    //   let maxCount = selectObj.usableAmount
    //   if (globalConfig.crane.countVal > maxCount) {
    //     showMsg('不能超过可出库数量')
    //     globalConfig.crane.countVal = maxCount
    //     $('#countIpt').val(globalConfig.crane.countVal)
    //   }
    // }
    var idx = Object.keys(globalConfig.crane.singleGoodsCount).findIndex(
      itm => itm == selectObj.soleId
    )
    if (idx >= 0)
      globalConfig.crane.singleGoodsCount[selectObj.soleId] = Number(
        globalConfig.crane.countVal
      )
    if (selectObj.quantityType == '01' || selectObj.mtype == 0) {
      let weight = formatWeight(
        Number(
          globalConfig.crane.countVal * selectObj.length * selectObj.meterWeight
        )
      )
      if (selectObj.mtype == 0) weight = selectObj.goodsWeight
      $('#weightInfo').text(weight)
    }
    $('#countIpt').val(globalConfig.crane.countVal)
  })
  // 数量加号事件
  $('#countAdd').click(() => {
    $('.zhd-keyboard').css('display', 'none')
    var iptResult = canInput()
    if (iptResult != 'ok') {
      showMsg(iptResult)
      return
    }
    globalConfig.crane.countVal = Number($('#countIpt').val())
    if (
      globalConfig.crane.countVal == '' ||
      isNaN(Number(globalConfig.crane.countVal))
    ) {
      globalConfig.crane.countVal = 1
    } else {
      globalConfig.crane.countVal++
    }
    var selectObj =
      globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
    // if (selectObj.quantityType == '01') {
    let maxCount = selectObj.usableAmount
    if (globalConfig.crane.countVal > maxCount) {
      showMsg('不能超过可出库数量')
      globalConfig.crane.countVal = maxCount
      $('#countIpt').val(globalConfig.crane.countVal)
    }
    // }
    var idx = Object.keys(globalConfig.crane.singleGoodsCount).findIndex(
      itm => itm == selectObj.soleId
    )
    if (idx >= 0)
      globalConfig.crane.singleGoodsCount[selectObj.soleId] = Number(
        globalConfig.crane.countVal
      )
    if (selectObj.quantityType == '01' || selectObj.mtype == 0) {
      let weight = formatWeight(
        Number(
          globalConfig.crane.countVal * selectObj.length * selectObj.meterWeight
        )
      )
      if (selectObj.mtype == 0) weight = selectObj.goodsWeight
      $('#weightInfo').text(weight)
    }
    $('#countIpt').val(globalConfig.crane.countVal)
  })
  // 显示物资重量
  $('#weightInfo').text('')

  /**
   * 特殊吊秤重量微调操作
   * FIXME: 需要增加埋点
   */
  $('#weightWrapAdd').click(function(e) {
    e.stopPropagation()
    var val = $('#weightInfo').text()
    val = Number(val) + 0.005
    $('#weightInfo').text(val.toFixed(3))
  })

  function scpOutStorageSuccess(isBang, craneBtnIdxs) {
    console.log(totalPlankArr)
    if (!isBang) {
      // 处理理计物资出库
      const currentObj =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      const uniqueCode = currentObj.soleId
      globalConfig.crane.tableList = globalConfig.crane.tableList.filter(
        itm => itm.soleId != uniqueCode
      )
    } else {
      const uniqueCodes = totalPlankArr.map(itm => itm.soleId)
      globalConfig.crane.tableList = globalConfig.crane.tableList.filter(
        itm => !uniqueCodes.includes(itm.soleId)
      )
      // 清理磅秤数据
      // FIXME: 处理多个秤，选择秤正常的情况
      if (userChooseBtnIdx > -1) {
        globalConfig.crane.dwt[userChooseBtnIdx] = 0
        globalConfig.crane.linkMap[userChooseBtnIdx] = []
        $('.weight-btn')
          .eq(userChooseBtnIdx)
          .css('background-image', 'url(/img/dl.png)')
        $('.weight-btn')
          .eq(userChooseBtnIdx)
          .find('span')
          .eq(0)
          .text('0')
        CRANE_FUNCS.showMultiCranePart(false, userChooseBtnIdx)
        userChooseBtnIdx = -1
      }
    }
    CRANE_FUNCS.updateFactWeight(0)
    updateTableData(globalConfig.crane.tableList)
    // 初始化操作员操作
    CRANE_FUNCS.clearTopCbx()
    // 清除车牌号
    $('#tdCarNo').val('')
    globalConfig.crane.globalShowCarNo = ''
    // 清除原产地
    globalOriginPlace = ''
    $('#originAreaIpt').val(globalOriginPlace)
    // 清除高亮条
    globalConfig.crane.selectRowIndex = -1
    CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)
    // 提出出库成功
    showMsg('该物资已出库成功')
  }

  /**
   * 新项目磅计批量出库
   * @author samy
   * @date 2021/01/14
   * @param w 重量
   * @param cnt 数量
   * @param type 出库物资类型 01 理计 02 磅计
   */
  function scpBangOutStorage(w, cnt, type = '02') {
    // 每吨重量
    const perWeight = Number(w) / Number(cnt)
    const reqBody = {
      carNo: globalConfig.crane.globalShowCarNo,
      deliveryPlanIdDTOList: []
    }
    let operatorNo = ''
    if (globalConfig.crane.wnameCheckArr.length > 0)
      operatorNo = globalConfig.crane.wnameCheckArr.join(',')
    totalPlankArr.map((itm, idx) => {
      itm.sourceProdAreaName = itm.originPlace
      itm.sourceProdAreaId = itm.originPlaceId
      itm.operatorNo = operatorNo
      itm.equipment = userChooseBtnIdx >= 0 ? `A${userChooseBtnIdx + 1}` : '-1'
      reqBody.material = itm.productTextureName
      reqBody.carNo = itm.carNo
      reqBody.standard = itm.specification
      reqBody.supply = itm.prodAreaName
      reqBody.length = itm.length
      reqBody.weightRange = itm.weightRange
      reqBody.toleranceRange = itm.toleranceRange
      if (itm.usableAmount >= cnt) {
        itm.count = cnt
        itm.weight = w
      } else {
        if (idx < totalPlankArr.length - 1) {
          itm.count = itm.usableAmount
          itm.weight = getFixWeight(Number(perWeight * itm.count).toFixed(4))
        } else {
          itm.count = itm.usableAmount
          if (type === '01') {
            itm.weight = w
          } else {
            itm.weight =
              w -
              arraySum(reqBody.deliveryPlanIdDTOList.map(item => item.weight))
          }
        }
      }
      reqBody.deliveryPlanIdDTOList.push(itm)
    })
    console.log('reqBody:>>', reqBody)
    console.log(JSON.stringify(reqBody))
    let isBang = true
    // FIXME:|| currentObj.mtype == 0  整卷开平
    if (type == '01') {
      isBang = false
    }
    const multiCraneIdx = []
    if (userChooseBtnIdx >= 0 && isBang) {
      // 如果有多次清空数据
      // 是否是一个物资多秤
      let selectidx = globalConfig.crane.linkMap[userChooseBtnIdx][0]
      console.log('selectidx', selectidx)
      if (selectidx == undefined) selectidx = globalConfig.crane.selectRowIndex
      const otherStockArray = []
      multiCraneIdx.push(userChooseBtnIdx)
      Object.keys(globalConfig.crane.linkMap).map(k => {
        let ix = globalConfig.crane.linkMap[k].findIndex(im => im == selectidx)
        if (ix >= 0 && k != userChooseBtnIdx) {
          multiCraneIdx.push(k)
          if (globalConfig.crane.dwtCounts[k].records.length > 0) {
            otherStockArray.push(
              globalConfig.crane.dwtCounts[k].records.join(';')
            )
          }
          if (globalConfig.crane.linkMap[k].length == 1) {
            globalConfig.crane.dwtCounts[k].canEdit = false
            globalConfig.crane.dwtCounts[k].records = []
            globalConfig.crane.dwtCounts[k].beforeCancelCount = 0
            $('#cb' + k).unbind()
            $('#wbtnc' + k).unbind()
            $('#btntop' + k).remove()
            globalConfig.crane.dwt[k] = 0
            $('.weight-btn')
              .eq(k)
              .find('span')
              .eq(0)
              .text(globalConfig.crane.dwt[k])
            $('.weight-btn')
              .eq(k)
              .css('background-image', 'url("/img/dl.png")')
          }
        }
      })
      if (globalConfig.crane.dwtCounts[userChooseBtnIdx].records.length > 0) {
        reqBody.stocks = globalConfig.crane.dwtCounts[
          userChooseBtnIdx
        ].records.join(';')
      }
      if (otherStockArray.length > 0) {
        reqBody.stocks = reqBody.stocks + '|' + otherStockArray.join('|')
      }
      reqBody.multiOutRecords = reqBody.stocks ? reqBody.stocks : ''
      reqBody.craneIndex = multiCraneIdx.join(';')
      if (globalConfig.crane.linkMap[userChooseBtnIdx].length == 1) {
        globalConfig.crane.dwtCounts[userChooseBtnIdx].canEdit = false
        globalConfig.crane.dwtCounts[userChooseBtnIdx].records = []
        $('#cb' + userChooseBtnIdx).unbind()
        $('#wbtnc' + userChooseBtnIdx).unbind()
        $('#btntop' + userChooseBtnIdx).remove()
      }
    } else {
      // 理计出库记录
      reqBody.craneIndex = '-1'
    }
    loading('出库中，请耐心等待...')
    console.log('reqBody:>>', reqBody)
    // return
    request('crane/dc/outStorage', reqBody, 'post').then(res => {
      console.log('new storage res', res)
      if (res.success && res.data.unqualifiedList.length === 0) {
        hideLoad()
        showMsg('出库成功')
        scpOutStorageSuccess(isBang, multiCraneIdx)
      } else {
        if (res.success && res.data.unqualifiedList.length > 0) {
          // 待审核
          hideLoad()
          // 中此条物资需要审核确认\n 出库重量:${weight}\n 出库数量:${cnt}
          const errMsg = res.data.unqualifiedList
            .map(
              itm =>
                `提单号:${itm.sourceBillNo}中${itm.productBrandName}需要审核确认,出库重量:${itm.realWeight},出库数量:${itm.amount}`
            )
            .join('\n')
          $('body').append(
            modalTemp({
              modalId: 'modalErr',
              modalTitle: errMsg
            })
          )
          showModal('#modalErr', function(result) {
            if (result) {
              loading('出库中，请耐心等待...')
              reqBody.affirm = 1
              request('crane/dc/outStorage', reqBody, 'post')
                .then(resp => {
                  hideLoad()
                  if (resp.success) {
                    // showMsg('用户审核成功, 准备做出库操作')
                    scpOutStorageSuccess(isBang, multiCraneIdx)
                  } else {
                    showMsg(
                      '审核失败' +
                        (resp.message ? ';具体原因' + resp.message : '')
                    )
                  }
                })
                .catch(err => {
                  hideLoad()
                  showMsg(
                    '审核失败' + (err.message ? ',具体原因' + err.message : '')
                  )
                })
            } else {
              console.log('用户取消')
            }
          })
        } else {
          hideLoad()
          showMsg('出库异常' + res.message)
        }
      }
    })
  }

  $('#weightInfoWrap').click(() => {
    let w = $('#weightInfo').text()
    let cnt = $('#countIpt').val()
    if (globalConfig.crane.selectRowIndex > -1) {
      var selectObj =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      // 判断理计物资不能超过出库最大值
      if (selectObj.quantityType == '01') {
        let maxCount = selectObj.usableAmount
        if (cnt > maxCount) {
          cnt = maxCount
          $('#countIpt').val(cnt)
        }
      }
    }
    console.log(cnt)
    console.log('currentUserChooseBtn', userChooseBtnIdx)
    if (Number(w) <= 0) {
      showMsg('重量必须大于0')
      return
    }
    if (globalConfig.crane.wnameCheckArr.length === 0) {
      showMsg('请选择操作人员')
      return
    }
    if (userChooseBtnIdx == -1) {
      if (globalConfig.crane.selectRowIndex == -1) {
        showMsg('请选择出库的物资')
        return
      }
      var selectObj =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      if (selectObj.quantityType == '01' || selectObj.mtype == 0) {
        // 重新计算重量 FIXME 米重
        let weight = formatWeight(
          Number(cnt * selectObj.length * selectObj.meterWeight)
        )
        if (selectObj.mtype == 0) weight = selectObj.goodsWeight
        $('#weightInfo').text(weight)
        w = weight
      } else {
        showMsg('请选择出库的磅秤')
        return
      }
    }
    totalPlankArr = []
    // 批量出库
    if (userChooseBtnIdx > -1) {
      let detailIdx = globalConfig.crane.linkMap[userChooseBtnIdx]
      detailIdx.map(itm => {
        totalPlankArr.push(globalConfig.crane.tableList[itm])
      })
      // 判断是否所有明细都选择了原产地
      const originPlaceFilterArr = totalPlankArr.filter(
        itm => itm.originPlace == null || itm.originPlace == ''
      )
      if (originPlaceFilterArr.length > 0) {
        showMsg('有物资未选择原产地，无法出库')
        return
      }
      // 批量出库
      console.log('totalPlankArr:>>', totalPlankArr)
      // bangOutStorage(detailIdx, w, cnt)
      scpBangOutStorage(w, cnt)
    } else {
      let currentObj =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      if (currentObj.originPlace == null || currentObj.originPlace == '') {
        showMsg('该物资未选择原产地，无法出库')
        return
      }
      totalPlankArr.push(currentObj)
      delete globalConfig.crane.singleGoodsCount[currentObj.soleId]
      const wt = formatWeight(currentObj.length * cnt * currentObj.meterWeight)
      scpBangOutStorage(Number(wt), cnt, '01')
    }
  })

  // 总重量板子组
  let totalPlankArr = []

  function resetLinkmap() {
    globalConfig.crane.linkMap = {
      0: [],
      1: [],
      2: [],
      3: []
    }
  }

  /**
   *
   * 获取选择行原产地的信息
   *
   * @param partName 品名
   * @param spec 规格
   * @author samy
   * @date 2020/07/27
   */
  // 原产地
  var globalOriginPlace = ''
  // 原来产地ID
  var globalOriginPlaceId = ''
  // 下拉原产地数组
  var globalOriginPlaceArr = []
  function getRowOriginPlace(skuId) {
    request(`crane/dc/goods/${skuId}/originPlaces`, {}, 'get')
      .then(res => {
        console.log('resp:>>', res)
        if (res.success) {
          globalOriginPlaceArr = res.data
        } else {
          globalOriginPlaceArr = []
          globalOriginPlace = ''
          $('#originAreaIpt').val(globalOriginPlace)
          showMsg(data.message)
        }
      })
      .catch(err => {
        console.error('origin place error:>>', err)
        globalOriginPlaceArr = []
        globalOriginPlace = ''
        $('#originAreaIpt').val(globalOriginPlace)
        showMsg(err.message || '网络异常')
      })
  }

  function updateTableData(data) {
    $('#wzBody .tr td:first-child').unbind()
    $('#wzBody .tr').remove()
    $('#wzBody .highlight-rect').remove()
    $('#wzBody').append(
      tableTemp({
        data,
        keys: globalConfig.crane.trKeys
      })
    )
    $('#wzBody .tr').click(function() {
      if (forceSelectCarNo) return
      var rowIdx = $(this).data('rowindex')
      globalConfig.crane.selectRowIndex = Number(rowIdx)
      console.log(
        'globalConfig.crane.selectRowIndex:>>' +
          globalConfig.crane.selectRowIndex
      )
      CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)
      // 判断是否可以直接出库
      let selectObj =
        globalConfig.crane.tableList[globalConfig.crane.selectRowIndex]
      console.log(selectObj)
      // 获取本行原产地信息
      hideComponentById('zhdOriginPlaceFilterPop')
      if (selectObj.sourceProdAreaName) {
        globalOriginPlace = selectObj.sourceProdAreaName
        globalOriginPlaceId = selectObj.sourceProdAreaId
      } else {
        globalOriginPlace = ''
        globalOriginPlaceId = ''
      }
      $('#originAreaIpt').val(globalOriginPlace)
      getRowOriginPlace(selectObj.skuId)
      // 添加显示提单的车牌号
      if (selectObj.carNo.indexOf(',') > 0) {
        selectObj.carNo = globalConfig.crane.globalShowCarNo
      }
      globalConfig.crane.globalShowCarNo = selectObj.carNo
      $('#tdCarNo').val(globalConfig.crane.globalShowCarNo)
      let td = selectObj.soleId
      let cnt = selectObj.usableAmount
      // mtype是代表整卷开平  quantityType 01 理计 02 磅计
      if (selectObj.quantityType == '01' || selectObj.mtype == 0) {
        let weight = formatWeight(
          Number(cnt * selectObj.length * selectObj.meterWeight)
        )
        if (selectObj.mtype == 0) weight = selectObj.goodsWeight
        $('#weightInfo').text(weight)
        $('#countIpt').val(cnt)
      } else {
        userChooseBtnIdx = -1
        let idx = Object.keys(globalConfig.crane.singleGoodsCount).findIndex(
          itm => itm == td
        )
        if (idx < 0) {
          globalConfig.crane.singleGoodsCount[td] = cnt
        } else {
          cnt = globalConfig.crane.singleGoodsCount[td]
        }
        $('#weightInfo').text('')
        // 是否是一个物资绑多个秤
        let arr = []
        Object.keys(globalConfig.crane.linkMap).map(k => {
          let i = globalConfig.crane.linkMap[k].findIndex(
            itm => itm == globalConfig.crane.selectRowIndex
          )
          if (i >= 0) arr.push(k)
        })
        var total = 0
        if (arr.length > 0) {
          arr.map(itm => {
            globalConfig.crane.dwtCounts[itm].records.map(im => {
              total += Number(im)
            })
          })
          $('#weightInfo').text(Number(total / 1000).toFixed(3))
        }
        $('#countIpt').val(cnt)
      }
    })
    $('#wzBody .tr .td:first-child').click(function(e) {
      e.stopPropagation()
      console.log('click td :>>>' + $(this).data('idx'))
      let rowidx = $(this).data('idx')
      // let result = window.confirm('您确定要删除此物资吗?')
      $('body').append(
        modalTemp({
          modalId: 'modalDel',
          modalTitle: '您确定要删除此物资吗？'
        })
      )
      showModal('#modalDel', function(result) {
        if (result) {
          let currentTD = globalConfig.crane.tableList[rowidx]['soleId']
          let btnIndx = -1
          let otherSelectRowObj = {}
          console.log('currentTD:>>' + currentTD)
          // 选择的多对多
          Object.keys(globalConfig.crane.linkMap).map(k => {
            globalConfig.crane.linkMap[k] = globalConfig.crane.linkMap[
              k
            ].filter(itm => itm != rowidx)
          })
          Object.keys(globalConfig.crane.linkMap).map(k => {
            if (globalConfig.crane.linkMap[k].length > 0) {
              globalConfig.crane.linkMap[k].map(idx => {
                let keys = Object.keys(otherSelectRowObj)
                let indx = keys.findIndex(
                  im => im == globalConfig.crane.tableList[idx]['soleId']
                )
                if (indx >= 0) {
                  // 一对多
                  otherSelectRowObj[
                    globalConfig.crane.tableList[idx]['soleId']
                  ] =
                    k +
                    ';' +
                    otherSelectRowObj[
                      globalConfig.crane.tableList[idx]['soleId']
                    ]
                } else {
                  otherSelectRowObj[
                    globalConfig.crane.tableList[idx]['soleId']
                  ] = k
                }
              })
            }
          })
          globalConfig.crane.selectRowIndex = -1
          $('.crane-btn').unbind()
          delete globalConfig.crane.singleGoodsCount[currentTD]
          globalConfig.crane.tableList = globalConfig.crane.tableList.filter(
            itm => itm['soleId'] != currentTD
          )
          updateTableData(globalConfig.crane.tableList)
          resetLinkmap()
          // 清空底部按钮
          Object.keys(globalConfig.crane.linkMap).map(k => {
            $('.weight-btn')
              .eq(k)
              .css('background-image', 'url(/img/dl.png)')
            CRANE_FUNCS.showMultiCranePart(false, k)
          })
          Object.keys(otherSelectRowObj).map(k => {
            let idx = globalConfig.crane.tableList.findIndex(
              itm => itm.soleId == k
            )
            let btnIdx = otherSelectRowObj[k]
            if (btnIdx.indexOf(';') > 0) {
              let arr = btnIdx.split(';')
              arr.map((im, indx) => {
                globalConfig.crane.linkMap[Number(im)].push(idx)
                if (indx == 0) {
                  $('#wzBody .tr')
                    .eq(idx)
                    .find('.td')
                    .eq(9)
                    .html('')
                  $('#wzBody .tr')
                    .eq(idx)
                    .find('.td')
                    .eq(9)
                    .html(
                      '<div class="crane-btn column" data-bidx="' +
                        im +
                        '" data-ridx="' +
                        idx +
                        '"><span>' +
                        globalConfig.crane.craneNames[im] +
                        '</span></div>'
                    )
                } else {
                  $('#wzBody .tr')
                    .eq(idx)
                    .find('.td')
                    .eq(9)
                    .prepend(
                      '<div class="crane-btn column" data-bidx="' +
                        im +
                        '" data-ridx="' +
                        idx +
                        '"><span>' +
                        globalConfig.crane.craneNames[im] +
                        '</span></div>'
                    )
                }
              })
            } else {
              globalConfig.crane.linkMap[Number(btnIdx)].push(idx)
              $('#wzBody .tr')
                .eq(idx)
                .find('.td')
                .eq(9)
                .html('')
              $('#wzBody .tr')
                .eq(idx)
                .find('.td')
                .eq(9)
                .html(
                  '<div class="crane-btn column" data-bidx="' +
                    btnIdx +
                    '" data-ridx="' +
                    idx +
                    '"><span>' +
                    globalConfig.crane.craneNames[btnIdx] +
                    '</span></div>'
                )
            }
            CRANE_FUNCS.bindCraneBtn(idx)
          })
          console.log(
            'del globalConfig.crane.linkMap btnidx',
            btnIndx,
            globalConfig.crane.linkMap[btnIndx]
          )
          Object.keys(globalConfig.crane.linkMap).map(k => {
            $('.weight-btn')
              .eq(k)
              .css(
                'background-image',
                globalConfig.crane.linkMap[k].length > 0
                  ? 'url(/img/gl.png)'
                  : 'url(/img/dl.png)'
              )
            CRANE_FUNCS.showMultiCranePart(
              globalConfig.crane.linkMap[k].length > 0,
              k
            )
          })
          CRANE_FUNCS.initActiveRect(globalConfig.crane.selectRowIndex)
        }
      })
    })
  }
})
