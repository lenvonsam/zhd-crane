$(function() {
  $('body').removeClass('outd-query-bg')
  $('body').addClass('outd-query-bg')

  $('.out-btn').click(() => {
    window.location.href = '/'
  })
  $('.outd-query-close').click(() => {
    window.location.href = '/menu'
  })
  function initPaginate(pageCount, cntPage) {
    Page({
      num: pageCount, //页码数
      startnum: cntPage, //指定页码
      elem: $('#page1'), //指定的元素
      callback: function(n) {
        //回调函数
        console.log(n)
        currentPage = n
        console.log('pg currentPage', n)
        loadData(queryObj)
      }
    })
  }
  // 提单号
  var tdNo = ''
  var startTime = moment().format('YYYY-MM-DD')
  var endTime = moment().format('YYYY-MM-DD')
  // 当前页面
  var currentPage = 1
  // 请求参数
  var queryObj = {}
  // 行单元key
  var tdKeys = [
    'deliveryOutNo',
    'purchaseOrgName',
    // "datasAcceptcorpname",
    'productBrandName',
    'specification',
    'length',
    'prodAreaName',
    'sourceProdAreaName',
    'amount',
    'weight',
    'createUserName',
    'extractPerson',
    'carNo',
    'other',
    'auditStatus'
  ]
  $('#tdNo').focus(function(e) {
    $('.zhd-keyboard').css('display', 'none')
    globalFocusDom = '#tdNo'
    // $('.zhd-keyboard').css('top', (e.currentTarget.offsetHeight + e.currentTarget.offsetTop + 20) + 'px')
    // $('.zhd-keyboard').css('left', (e.currentTarget.offsetLeft - 20) + 'px')
    $('.zhd-keyboard').css('display', 'block')
  })
  $('#pgIpt').focus(function(e) {
    $('.zhd-keyboard').css('display', 'none')
    globalFocusDom = '#pgIpt'
    $('.zhd-keyboard').css('display', 'block')
  })
  $('#topAddBtn').click(() => {
    tdNo = $('#tdNo').val()
    console.log('tdNo', tdNo)
    if (tdNo.length == 0 && startTime.length == 0 && endTime.length == 0) {
      showMsg('请选择查询选项')
      return
    }
    if (tdNo.length == 0) delete queryObj.billCode
    $('.zhd-keyboard').css('display', 'none')
    if (tdNo.length > 0) queryObj.billCode = 'TD' + tdNo
    if (startTime.length > 0) queryObj.startDate = startTime
    if (endTime.length > 0) queryObj.endDate = endTime
    loadData(queryObj)
  })
  $('#topClearBtn').click(() => {
    $('.zhd-keyboard').css('display', 'none')
    // startTime = "";
    // endTime = "";
    // $("#timeRange").val("");
    $('#tdNo').val('')
  })
  $('#timeRange').daterangepicker(
    {
      timePicker: false,
      ranges: {
        今天: [moment(), moment()],
        // 昨天: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        最近7天: [moment().subtract(7, 'days'), moment()],
        // "Last 30 Days": [
        // "2018-12-11T03:26:53.419Z",
        // "2019-01-09T03:26:53.419Z"
        // ],
        本月: [moment().startOf('month'), moment().endOf('month')],
        上个月: [
          moment()
            .subtract(1, 'month')
            .startOf('month'),
          moment()
            .subtract(1, 'month')
            .endOf('month')
        ]
      },
      startDate: moment(),
      endDate: moment(),
      locale: {
        format: 'YYYY-MM-DD',
        separator: '至',
        applyLabel: '确认',
        cancelLabel: '清空',
        fromLabel: '开始时间',
        toLabel: '结束时间',
        customRangeLabel: '自定义',
        daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
        monthNames: [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月'
        ]
      }
    },
    function(start, end, label) {
      console.log(start.format('YYYY-MM-DD'))
      console.log(end.format('YYYY-MM-DD'))
      console.log('label:>>' + label)
      startTime = start.format('YYYY-MM-DD')
      endTime = end.format('YYYY-MM-DD')
      queryObj.startDate = startTime
      queryObj.endDate = endTime
      currentPage = 1
      loadData(queryObj)
    }
  )
  // 默认当天
  queryObj = {
    startDate: startTime,
    endDate: endTime
  }
  loadData(queryObj)
  function handlerData(data) {
    var rowStr = ''
    $('#wzBody').html('')
    data.map(itm => {
      var tdStr = ''
      tdKeys.map(k => {
        if (k == 'auditStatus') {
          if (itm[k] == '30') {
            tdStr += '<div class="td"><div class="status-btn pass"></div></div>'
          } else if (itm[k] == -1) {
            tdStr +=
              '<div class="td"><div class="status-btn giveup"></div></div>'
          } else {
            tdStr += '<div class="td"><div class="status-btn wait"></div></div>'
          }
        } else if (k == 'deliveryOutNo') {
          tdStr +=
            '<div class="td">' +
            (itm['deliveryOutNo'] == null ? '/' : itm[k]) +
            '</div>'
        } else if (k == 'createUserName' || k == 'purchaseOrgName') {
          var showStr = '/'
          if (itm[k]) showStr = itm[k]
          if (itm['employeeMobile'] && k == 'purchaseOrgName')
            showStr += '<br>' + itm['employeeMobile']
          tdStr += '<div class="td">' + showStr + '</div>'
        } else if (k === 'extractPerson') {
          tdStr += '<div class="td middle text-ellips">'
          if (itm['extractPerson'])
            tdStr +=
              (itm['extractPerson'] == 'null' ? '--' : itm['extractPerson']) +
              '<br>'
          if (itm['extractPhone'])
            tdStr +=
              (itm['extractPhone'] == 'null' ? '--' : itm['extractPhone']) +
              '<br>'
          // if (itm['datasCarnum']) tdStr += itm['datasCarnum']
          tdStr += '</div>'
        }
        // else if (k === 'productareaName') {
        //   tdStr += '<div class="td">' + itm['productareaName']
        //   if (itm['originPlace']) {
        //     tdStr += '<br>原产地: ' + itm['originPlace']
        //   }
        //   tdStr += '</div>'
        // }
        else if (k === 'other') {
          tdStr += '<div class="td">' + itm['productTextureName']
          if (itm['weightRange']) tdStr += '<br/>' + itm['weightRange']
          if (itm['toleranceRange']) tdStr += '<br/>' + itm['toleranceRange']
          // if (itm['datasCarnum']) tdStr += '<br/>' + itm['datasCarnum']
          tdStr += '</div>'
        } else {
          if (
            k === 'amount' ||
            k === 'length' ||
            k === 'weight' ||
            k === 'carNo'
          ) {
            tdStr += '<div class="td min text-ellips">' + itm[k] + '<br/></div>'
          } else {
            tdStr +=
              '<div class="td">' +
              (itm[k] == null ? '' : itm[k]) +
              '<br/></div>'
          }
        }
      })
      rowStr += '<div class="tr row center">' + tdStr + '</div>'
    })
    $('#wzBody').append(rowStr)
  }
  function loadData(body) {
    console.log('currentPage:>>', currentPage)
    var reqBody = {
      currentPage: currentPage,
      pageSize: 8
    }
    Object.keys(body).map(itm => {
      reqBody[itm] = body[itm]
    })
    request('/crane/dc/outedStorage', reqBody, 'get')
      .then(res => {
        if (res.success) {
          if (!res.data) {
            $('#wzBody').html('')
            showMsg('暂无数据')
            $('#totalPage').text('共0页')
            $('#totalWzCount').text('总数量：0')
            $('#totalWzWeight').text('总重量：0')
            return
          }
          handlerData(res.data.outBoundList.list)
          if (currentPage === 1) {
            if (Number($('#pgIpt').val()) > currentPage) {
              $('#pgIpt').val('')
            }
            initPaginate(res.data.outBoundList.pages, currentPage)
            $('#totalPage').text('共' + res.data.outBoundList.pages + '页')
          }
          $('#totalWzCount').text('总数量：' + res.data.totalCount)
          $('#totalWzWeight').text('总重量：' + res.data.totalWeight)
        } else showMsg(res.message || '网络异常')
      })
      .catch(err => {
        console.error(err)
        showMsg(err.message || '网络异常')
      })
  }
})
