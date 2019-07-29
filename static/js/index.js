$(function() {
  // 仓库名称
  var wname = '';
  // 正式仓库名对应的操作员编码
  var wnameMap = {
    '01': ['01', '02', '03', '04', '05', '06', '07'],
    '03': ['01', '02', '03', '04', '05'],
    '05': ['01', '02', '03', '04', '05', '06'],
    '06': ['01', '02', '03', '04', '05', '06', '07'],
    '07': ['01', '02', '03', '04', '05'],
    '10': ['01', '02', '03', '04', '05', '06', '07'],
    '11': ['01', '02', '03', '04'],
    '12': ['01', '02', '03', '04', '05', '06', '07']
  };
  // 测试仓库名对应的操作员编码
  // var wnameMap = {
  //   '01': ['01', '02', '03', '04', '05', '06', '07'],
  //   '02': ['01', '02', '03', '04', '05'],
  //   '03': ['01', '02', '03', '04', '05', '06'],
  //   '04': ['01', '02', '03', '04', '05', '06', '07'],
  //   '05': ['01', '02', '03', '04', '05'],
  //   '06': ['01', '02', '03', '04'],
  //   '07': ['01', '02', '03', '04'],
  //   '08': ['01', '02', '03', '04', '05', '06', '07']
  // };
  // 选择操作员
  var wnameCheckArr = []
  $("body").removeClass("main-bg");
  $("body").addClass("main-bg");
  // 获取登录者对应的仓库名称
  getWarehouseName().then(data => {
    console.log('data', data)
    wname = data.wname;
    // var str = '<span>操作人员编号：</span>';
    var str = '';
    wnameMap[wname].map(itm => {
      // str += '<input class="cbx-employee mr-15 ml-15" readonly type="checkbox" data-name="'+ wname + itm+'"/><span data-name="'+ itm +'" class="cbx-name">'+itm+'</span>';
      str += '<div class="employ-cbx" data-name="'+ wname + itm +'">'+itm+'</div>';
    });
    $('#topEmployee').html('')
    $('#topEmployee').append(str)
    $('.employ-cbx').click(function() {
      var name = $(this).data('name');
      var idx = Number($(this).text()) - 1;
      console.log('idx:>>', idx)
      console.log($(this).hasClass('checked'))
      if (!$(this).hasClass('checked')) {
        $(this).addClass('checked')
        wnameCheckArr.push(name);
      } else {
        $(this).removeClass('checked')
        wnameCheckArr = wnameCheckArr.filter(itm => itm !== name)
      }

      // var cbxcheck = $('.cbx-employee').eq(idx).is(":checked");
      // $('.cbx-employee').eq(idx).prop('checked', !cbxcheck);
      // console.log('cbxcheck:>>', cbxcheck);
      // if (!cbxcheck) {
      //   wnameCheckArr.push(wname + name);
      // } else {
      //   wnameCheckArr = wnameCheckArr.filter(itm => itm !== (wname + name));
      // }
      console.log('wname arr:>>', wnameCheckArr)
    });
    // $('.cbx-employee').change(function() {
    //   var name = $(this).data('name');
    //   var check = $(this).is(":checked");
    //   console.log('cbx:>>', check);
    //   if (check) {
    //     var idx = wnameCheckArr.findIndex(itm => itm === name);
    //     if (idx < 0) {
    //       wnameCheckArr.push(name)
    //     }
    //   } else {
    //     wnameCheckArr = wnameCheckArr.filter(itm => itm !== name);
    //   }
    //   console.log('wname arr:>>', wnameCheckArr)
    // });
  }).catch(err => {
    console.log(err)
  })

  function clearTopCbx() {
    $('.employ-cbx').each(function() {
      if ($(this).hasClass('checked'))
        $(this).removeClass('checked')
    })
    wnameCheckArr = []
  }

  
  // 初始化底部磅秤按钮
  var datas = {
    btns: [
      {
        img_path: "../img/A1.png",
        img_path_h: "../img/A1H.png"
      },
      {
        img_path: "../img/A2.png",
        img_path_h: "../img/A2H.png"
      },
      {
        img_path: "../img/A3.png",
        img_path_h: "../img/A3H.png"
      },
      {
        img_path: "../img/A4.png",
        img_path_h: "../img/A4H.png"
      }
    ]
  };
  var craneNames = ["A1", "A2", "A3", "A4"];
  // 磅秤数组下标和物资数组下标相对应
  var linkMap = {
    0: [],
    1: [],
    2: [],
    3: []
  };
  // 吊秤重量
  let w1 = 0;
  let w2 = 0;
  let w3 = 0;
  let w4 = 0;

  // 单个出库物资记录数量
  var singleGoodsCount = {};
  // 单个磅计物资出库是否可改数量以及分批称重数量
  // 单个物资对应对个秤
  // var singleMutliCrane = {};
  var dwtCounts = {
    0: {
      canEdit: false,
      // 取消前的次数
      beforeCancelCount: 0,
      records: []
    },
    1: {
      canEdit: false,
      beforeCancelCount: 0,
      records: []
    },
    2: {
      canEdit: false,
      beforeCancelCount: 0,
      records: []
    },
    3: {
      canEdit: false,
      beforeCancelCount: 0,
      records: []
    }
  };
  var factWeight = "";
  var userChooseBtnIdx = -1;
  var dwt = [w1, w2, w3, w4];
  var bottomTemp = _.template($("#weightBtns").html());
  $("#secBtns").html(bottomTemp(datas));
  // modal template
  var modalTemp = _.template($("#zhdModal").html());
  // 根据品名、材质、规格、产地相等，能合并一同绑定出库
  function isTheSame(origin, compare) {
    console.log("is the same", origin, compare);
    var orginStr =
      origin.partsnameName +
      "**" +
      origin.goodsSpec +
      "**" +
      origin.productareaName +
      "**" +
      origin.goodsMaterial +
      "**" +
      origin.goodsProperty1;
    var compareStr =
      compare.partsnameName +
      "**" +
      compare.goodsSpec +
      "**" +
      compare.productareaName +
      "**" +
      compare.goodsMaterial +
      "**" +
      compare.goodsProperty1;
    console.log(compareStr, orginStr);
    return orginStr == compareStr;
  }
  // 板材物资合并秤重规则
  // pntreeName 物资大类
  // partsnameName 品名
  // warehouseName 仓库名称
  // goodsSpec1 厚度(mm)
  // goodsSpec2 宽度(mm)
  function plankCompare(origin, compare) {
    var originStr =
      origin.goodsSpec1 +
      "**" +
      origin.goodsSpec2 +
      "**" +
      origin.warehouseName;
    var compareStr =
      compare.goodsSpec1 +
      "**" +
      origin.goodsSpec2 +
      "**" +
      origin.warehouseName;
    console.log("plank origin:>>", originStr, "; compare:>>", compareStr);
    return originStr == compareStr;
  }

  $(".weight-btn").click(function() {
    if (selectRowIndex == -1) {
      showMsg("请先选择物资");
      return;
    }
    plankWeightArr = [];
    let selectObj = tableList[selectRowIndex];
    console.log("selectObj:>>", selectObj);
    let cnt = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum);
    if (selectObj.goodsMetering == "理计" || selectObj.mtype == 0) {
      showMsg("无需关联吊秤可以直接出库");
      return;
    }
    let btnIdx = Number($(this).data("index"));
    console.log("btnidx:>>", btnIdx);
    console.log("btnRowIndx:>> ", linkMap[btnIdx]);
    console.log("dwt weight:>>", dwt[btnIdx]);
    let idx = linkMap[btnIdx].findIndex(itm => itm == selectRowIndex);
    if (idx >= 0) {
      console.log("此物资已关联设备");
      initActiveRect(selectRowIndex);
      showWzCount(btnIdx);
      // 判断是否是一个物资绑多个秤
      let isMulti = false;
      console.log("linkMap", linkMap);
      Object.keys(linkMap).map(k => {
        let indx = linkMap[k].findIndex(im => im == selectRowIndex);
        if (indx >= 0 && k != btnIdx) isMulti = true;
      });
      // var originWeight = Number($('#weightInfo').text()) * 1000
      // console.log('ismulti:>>>', isMulti, ';originwt:>>', originWeight)
      factWeight = Number(dwt[btnIdx] / 1000).toFixed(3);
      updateFactWeight(factWeight);
      userChooseBtnIdx = btnIdx;
      console.log('isMuti:>>', isMulti)
      if (
        // isMulti &&
        dwtCounts[userChooseBtnIdx].canEdit
      ) {
        if (Number(dwt[btnIdx]) > 0)
          dwtCounts[userChooseBtnIdx].records.push(Number(dwt[btnIdx]));
        dwtCounts[userChooseBtnIdx].beforeCancelCount =
          dwtCounts[userChooseBtnIdx].records.length;
        $("#wbtCnt" + userChooseBtnIdx).text(
          dwtCounts[userChooseBtnIdx].records.length + "次"
        );
        var totalWeight = 0;
        console.log("dwt records:>>", dwtCounts[userChooseBtnIdx].records);
        dwtCounts[userChooseBtnIdx].records.map(itm => {
          totalWeight += Number(itm);
        });
        factWeight = Number(totalWeight / 1000).toFixed(3);
        if (isMulti) {
          otherWeight = 0;
          Object.keys(linkMap).map(im => {
            let ix = linkMap[im].findIndex(item => item == selectRowIndex);
            if (ix >= 0 && im != userChooseBtnIdx) {
              dwtCounts[im].records.map(w => {
                otherWeight += Number(w);
              });
            }
          });
          console.log("otherweight:>>", otherWeight);
          console.log("totalweight:", totalWeight);
          factWeight = Number((otherWeight + totalWeight) / 1000).toFixed(3);
        }
        updateFactWeight(factWeight);
      } else {
        dwtCounts[userChooseBtnIdx].records = []
        dwtCounts[userChooseBtnIdx].beforeCancelCount = 0
        $("#wbtCnt" + userChooseBtnIdx).text(
          dwtCounts[userChooseBtnIdx].records.length + "次"
        );
      }
      return;
    }
    // 判断时候相同物资明细
    if (linkMap[btnIdx].length > 0) {
      console.log("selectrowindex:>>>", selectRowIndex);
      console.log("orign idx:>>", linkMap[btnIdx][0]);
      let origin = tableList[linkMap[btnIdx][0]];
      // 判断是否是单个物资多秤的情况
      let idx = tableList.findIndex(
        itm => itm.sbillBillbatch == origin.sbillBillbatch
      );
      let compare = tableList[selectRowIndex];
      console.log("origin obj", origin, origin.sbillBillbatch);
      console.log("compare obj", compare, compare.sbillBillbatch);
      if (origin.pntreeName == "板材") {
        if (origin.warehouseName == "板材定开" || origin.warehouseName == "开平厂") {
          if (!plankCompare(origin, compare)) {
            showMsg("此物资不能不与之前物资合并一起称重");
            return;
          }
        } else {
          showMsg("之前物资不是板材定开库的物资，不能合并一起称重");
          return;
        }
      } else {
        if (!isTheSame(origin, compare)) {
          showMsg("此物资不能与之前的物资合并一起称重");
          return;
        }
      }
    }
    // 判断
    if (selectRowIndex >= 0) {
      // 判断是新增绑定物资还是在原有绑定基础上新增物资
      // 默认是新增绑定
      var canMoreToMoreCrane = false
      var otherIdx = -1
      Object.keys(linkMap).map(itm => {
        if (itm != btnIdx) {
          let idx = linkMap[itm].findIndex(item => item == selectRowIndex)
          if (idx > -1) {
            otherIdx = idx
          }
        }
      })
      if (!(otherIdx == -1 && linkMap[btnIdx].length == 0)) canMoreToMoreCrane = true
      $("body").append(
        modalTemp({
          modalId: "linkDevice",
          modalTitle: "您确定要关联此设备吗?"
        })
      );
      showModal("#linkDevice", function(result) {
        if (result) {
          console.log('canMoreToMoreCrane:>>', canMoreToMoreCrane)
          linkMap[btnIdx].push(selectRowIndex);
          var choosedArr = linkMap[btnIdx]
          var moreCraneIdxs = []
          var moreCraneSelectIdxs = []
          Object.keys(linkMap).map(k => {
            choosedArr.map(subk => {
              var arr = linkMap[k]
              var idx = arr.findIndex(itm => itm == subk)
              if (idx > -1) {
                let subidx = moreCraneIdxs.findIndex(im => im == k)
                if (subidx == -1) moreCraneIdxs.push(k)
                moreCraneSelectIdxs = moreCraneSelectIdxs.concat(moreCraneSelectIdxs, arr)
                // console.log('idx:>>', idx, 'arr:>>', arr, 'moreCraneIdxs', moreCraneSelectIdxs)
              }
            })
          })
          // 去重复
          moreCraneSelectIdxs = Array.from(new Set(moreCraneSelectIdxs))
          console.log('去重复后 moreCraneSelect:', moreCraneSelectIdxs)
          $(".weight-btn")
            .eq(btnIdx)
            .next()
            .css("display", "block");
          // 多个物资绑多个秤
          if (canMoreToMoreCrane) {
            console.log(
              "selectRowIndex:>>",
              selectRowIndex,
              "; btnidx:>>",
              btnIdx
            );
            // 选出多个设备
            moreCraneSelectIdxs.map(itm => {
              $("#wzBody .tr")
              .eq(itm)
              .find(".td")
              .eq(9)
              .html("");
              var rowStr = '';
              moreCraneIdxs.map(item => {
                linkMap[item] = moreCraneSelectIdxs
                rowStr += '<div class="crane-btn column" data-bidx="'+item+'" data-ridx="'+itm+'"><span>'+craneNames[item]+'</span></div>'
              })
            $("#wzBody .tr")
              .eq(itm)
              .find(".td")
              .eq(9)
              .html(rowStr);                
              bindCraneBtn(itm);
            })
          } else {
            $("#wzBody .tr")
              .eq(selectRowIndex)
              .find(".td")
              .eq(9)
              .html("");
            $("#wzBody .tr")
              .eq(selectRowIndex)
              .find(".td")
              .eq(9)
              .html(
                '<div class="crane-btn column" data-bidx="' +
                  btnIdx +
                  '" data-ridx="' +
                  selectRowIndex +
                  '"><span>' +
                  craneNames[btnIdx] +
                  "</span></div>"
              );
            bindCraneBtn(selectRowIndex);
          }
          showWzCount(btnIdx);
          if (canMoreToMoreCrane) {
            factWeight = Number(dwt[btnIdx] / 1000).toFixed(3);
            updateFactWeight(factWeight);
          }
          console.log("hander link btn:>>", linkMap[btnIdx]);
          userChooseBtnIdx = btnIdx;
          $(".weight-btn")
            .eq(btnIdx)
            .css("background-image", "url(/img/gl.png)");
            showMultiCranePart(false, userChooseBtnIdx);
            showMultiCranePart(true, userChooseBtnIdx);
          if (canMoreToMoreCrane) {
            // 增加多次称重模块
              // 默认勾选上
              $("#cb" + userChooseBtnIdx).attr("checked", "checked");
              $("#cb" + userChooseBtnIdx)
                .parent()
                .addClass("checked");
              dwtCounts[userChooseBtnIdx].canEdit = true;
              // 将其他也勾选上
              Object.keys(linkMap).map(itm => {
                let ix = linkMap[itm].findIndex(im => im == selectRowIndex);
                if (ix >= 0 && itm != userChooseBtnIdx) {
                  $("#cb" + itm).attr("checked", "checked");
                  $("#cb" + itm)
                    .parent()
                    .addClass("checked");
                  dwtCounts[itm].canEdit = true;
                }
              });
          } 
        }
      });
    } else {
      console.error("进入未处理的判断");
    }
  });

  // 显示多次称重模块
  function showMultiCranePart(show, userChooseBtnIdx) {
    var topid = "btntop" + userChooseBtnIdx;
    var cbid = "cb" + userChooseBtnIdx;
    var cid = "wbtnc" + userChooseBtnIdx;
    var cntid = "wbtCnt" + userChooseBtnIdx;
    if (show) {
      $(".weight-btn-top-part")
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
        );
      $("#" + cbid).change(function() {
        console.log($(this).is(":checked"));
        var idx = $(this).data("id");
        console.log("cbx idx:>>", idx);
        var cked = $(this).is(":checked");
        dwtCounts[idx]["canEdit"] = cked;
        if (cked) {
          $(this)
            .parent()
            .addClass("checked");
        } else {
          $(this)
            .parent()
            .removeClass("checked");
        }
      });
      $("#" + cid).click(function() {
        var btnIdx = $(this).data("id");
        console.log("btnidx:>>", btnIdx);
        if (dwtCounts[btnIdx].canEdit) {
          console.log(dwtCounts[btnIdx]);
          if (
            dwtCounts[btnIdx]["records"].length > 0 &&
            dwtCounts[btnIdx]["beforeCancelCount"] < 2
          ) {
            dwtCounts[btnIdx]["records"].pop();
            dwtCounts[btnIdx]["beforeCancelCount"] =
              dwtCounts[btnIdx]["records"].length;
          } else if (
            dwtCounts[btnIdx]["records"].length ==
            dwtCounts[btnIdx]["beforeCancelCount"]
          ) {
            dwtCounts[btnIdx]["records"].pop();
          } else if (
            dwtCounts[btnIdx]["beforeCancelCount"] >
            dwtCounts[btnIdx]["records"].length
          ) {
            showMsg("不能多次取消");
            return;
          }
          let cnt = dwtCounts[btnIdx]["records"].length;
          $("#" + cntid).text(cnt + "次");
          var totalWeight = 0;
          console.log("dwt records:>>", dwtCounts[userChooseBtnIdx].records);
          dwtCounts[userChooseBtnIdx].records.map(itm => {
            totalWeight += itm;
          });
          factWeight = Number(totalWeight / 1000).toFixed(3);
          // 判断是否是一个物资对应多秤
          let currentSidx = linkMap[btnIdx][0];
          let isMulti = false;
          Object.keys(linkMap).map(k => {
            let indx = linkMap[k].findIndex(im => im == currentSidx);
            if (indx >= 0 && k != btnIdx) isMulti = true;
          });
          if (isMulti) {
            otherWeight = 0;
            Object.keys(linkMap).map(k => {
              let indx = linkMap[k].findIndex(im => im == currentSidx);
              if (indx >= 0 && k != btnIdx) {
                dwtCounts[k].records.map(c => {
                  otherWeight += Number(c);
                });
              }
            });
            factWeight = Number((totalWeight + otherWeight) / 1000).toFixed(3);
          }
          updateFactWeight(factWeight);
        }
      });
    } else {
      // 减掉取消绑定的重量
      var totalWeight = 0;
      dwtCounts[userChooseBtnIdx].records.map(itm => {
        totalWeight += Number(itm);
      });
      var showWeight = Number($("#weightInfo").text()) * 1000;
      factWeight = Number((showWeight - totalWeight) / 1000).toFixed(3);
      updateFactWeight(factWeight);
      dwtCounts[userChooseBtnIdx].canEdit = false;
      dwtCounts[userChooseBtnIdx].records = [];
      $("#" + cbid).unbind();
      $("#" + cid).unbind();
      $("#" + topid).remove();
    }
  }

  // websocket
  var socket = io();
  try {
    socket.on("factWeight", function(data, idx) {
      console.log(data + ";" + idx);
      dwt[idx] = data;
      // if (Number(data) >= 0)
      $(".weight-btn")
        .eq(idx)
        .find("span")
        .eq(0)
        .text(data);
    });
  } catch (e) {
    console.error("client socket error:>>", e);
  }
  // 提单号
  var tdNo = "";
  // 物资列表
  var tableTemp = _.template($("#tbodyPart").html());
  var selectRowIndex = -1;
  var tableList = [];
  var trKeys = [
    "sbillBillcode",
    "partsnameName",
    "goodsSpec",
    "goodsProperty1",
    "productareaName",
    "goodsMaterial",
    "goodCount",
    // 公差 goodsProperty5 重量 goodsProperty4
    "goodsProperty5",
    // 其他 车牌号 
    "other"
  ];
  $("#tdNo").focus(function(e) {
    $(".zhd-keyboard").css("display", "none");
    globalFocusDom = "#tdNo";
    // $('.zhd-keyboard').css('top', (e.currentTarget.offsetHeight + e.currentTarget.offsetTop + 20) + 'px')
    // $('.zhd-keyboard').css('left', (e.currentTarget.offsetLeft - 20) + 'px')
    $(".zhd-keyboard").css("display", "block");
  });

  $("#topAddBtn").click(() => {
    tdNo = $("#tdNo").val();
    if (tdNo.length == 0) {
      showMsg("请输入提单号");
      return;
    }
    $(".zhd-keyboard").css("display", "none");
    request("/outWaitStorageQuery", {
      sbillBillcode: tdNo
    })
      .then(res => {
        console.log(res);
        if (res.status == 0) {
          // showMsg('用户过期')
          if (!res.data.data) {
            showMsg("此提单号查无物资明细");
            return;
          }
          // if (res.data.data.length > 0) {
          //   var firstObj = res.data.data[0]
          //   if (firstObj.wsFlag == 1) {
          //     showMsg('系统暂不支持型云提单出库')
          //     return
          //   }
          // }
          if (tableList.length == 0) {
            tableList = res.data.data;
            updateTableData(tableList);
          } else {
            // 重新渲染之前选择的物资
            let currentTD = "";
            if (selectRowIndex >= 0)
              currentTD = tableList[selectRowIndex]["sbillBillbatch"];
            var chooseItems = {};
            console.log("linkMap:>>", linkMap);
            Object.keys(linkMap).map(itm => {
              if (linkMap[itm].length > 0) {
                linkMap[itm].map(item => {
                  let keys = Object.keys(chooseItems);
                  let indx = keys.findIndex(
                    im => im == tableList[item]["sbillBillbatch"]
                  );
                  if (indx >= 0) {
                    chooseItems[tableList[item]["sbillBillbatch"]] =
                      itm +
                      ";" +
                      chooseItems[tableList[item]["sbillBillbatch"]];
                  } else {
                    chooseItems[tableList[item]["sbillBillbatch"]] = itm;
                  }
                });
              }
            });
            $(".crane-btn").unbind();
            res.data.data.map(itm => {
              let idx = tableList.findIndex(
                item => item.sbillBillbatch == itm.sbillBillbatch
              );
              if (idx < 0) tableList.push(itm);
            });
            updateTableData(tableList);
            if (currentTD.length != "") {
              selectRowIndex = tableList.findIndex(
                itm => itm.sbillBillbatch == currentTD
              );
              initActiveRect(selectRowIndex);
            }
            resetLinkmap();
            console.log("chooseItems:>>>", chooseItems);
            Object.keys(chooseItems).map(k => {
              let idx = tableList.findIndex(itm => itm.sbillBillbatch == k);
              let btnIdx = chooseItems[k];
              console.log("btnIdx:>>", btnIdx);
              console.log("; indx:>>>", btnIdx.toString().indexOf(";"));
              if (btnIdx.toString().indexOf(";") > 0) {
                // 一个物资多秤
                let arr = btnIdx.toString().split(";");
                console.log("arr:>>", arr);
                arr.map((it, indx) => {
                  linkMap[Number(it)].push(idx);
                  if (indx == 0) {
                    $("#wzBody .tr")
                      .eq(idx)
                      .find(".td")
                      .eq(9)
                      .html("");
                    $("#wzBody .tr")
                      .eq(idx)
                      .find(".td")
                      .eq(9)
                      .html(
                        '<div class="crane-btn column" data-bidx="' +
                          it +
                          '" data-ridx="' +
                          idx +
                          '"><span>' +
                          craneNames[it] +
                          "</span></div>"
                      );
                  } else {
                    $("#wzBody .tr")
                      .eq(idx)
                      .find(".td")
                      .eq(9)
                      .prepend(
                        '<div class="crane-btn column" data-bidx="' +
                          it +
                          '" data-ridx="' +
                          idx +
                          '"><span>' +
                          craneNames[it] +
                          "</span></div>"
                      );
                  }
                });
              } else {
                linkMap[btnIdx].push(idx);
                $("#wzBody .tr")
                  .eq(idx)
                  .find(".td")
                  .eq(9)
                  .html("");
                $("#wzBody .tr")
                  .eq(idx)
                  .find(".td")
                  .eq(9)
                  .html(
                    '<div class="crane-btn column" data-bidx="' +
                      btnIdx +
                      '" data-ridx="' +
                      idx +
                      '"><span>' +
                      craneNames[btnIdx] +
                      "</span></div>"
                  );
              }
              bindCraneBtn(idx);
            });
          }
          console.log(tableList);
        } else if (resp.status == -2) {
          window.location.href = "/login?type=1";
        } else {
          showMsg(resp.message);
        }
      })
      .catch(err => {
        console.error(err);
        showMsg(err);
      });
  });
  $("#topClearBtn").click(() => {
    tdNo = "";
    $(".zhd-keyboard").css("display", "none");
    $("#tdNo").val(tdNo);
  });

  initActiveRect(selectRowIndex);

  // 物资重量数量输入
  var countVal = $("#countIpt").val();
  function canInput() {
    var btnIndex = -1;
    Object.keys(linkMap).map(itm => {
      let idx = linkMap[itm].findIndex(item => item == selectRowIndex);
      if (idx >= 0) btnIndex = itm;
    });
    console.log("currentSelect idx:>>", selectRowIndex);
    console.log("currentBtnIdx:>>", btnIndex);
    let selectObj = tableList[selectRowIndex];
    /**
     * 所有理计物资可以修改数量 
     * @author samy
     * @date 2019/07/29
     * @content 需求来源 曹工和线下确认理计物资可以修改数量并能自动计算重量
     * */
    // if ((selectObj.goodsMetering == "理计" && Number(selectObj.pickType) != 1) || selectObj.mtype == 0) {
    //   return "理计不能修改数量";
    // } else if (selectObj.goodsMetering == "理计" && Number(selectObj.pickType) == 1) {
    //   return "ok";
    // } 
    if (selectObj.mtype == 0) {
      return '整卷开平不能修改数量';
    } else if (selectObj.goodsMetering == '理计') {
      return 'ok';
    }  else if (btnIndex == -1) {
      return "请先选中关联设备的物资";
    } else if (linkMap[btnIndex].length == 1) {
      if (dwtCounts[btnIndex].canEdit) {
        return "多次称重不能修改重量";
      } else {
        return "ok";
      }
    } else {
      return "多个物资不能更改数量";
    }
  }
  $("#countIpt").focus(function(e) {
    console.log("count ipt focus");
    $(".zhd-keyboard").css("display", "none");
    if (canInput() != "ok") return;
    console.log(e);
    globalFocusDom = "#countIpt";
    // $('.zhd-keyboard').css('left', (e.currentTarget.offsetLeft - 20) + 'px')
    // $('.zhd-keyboard').css('top', (e.currentTarget.offsetHeight + e.currentTarget.offsetTop - 10) + 'px')
    $(".zhd-keyboard").css("display", "block");
  });
  $("#countMinus").click(() => {
    $(".zhd-keyboard").css("display", "none");
    var iptResult = canInput();
    if (iptResult != "ok") {
      showMsg(iptResult);
      return;
    }
    countVal = Number($("#countIpt").val());
    if (countVal == "" || isNaN(Number(countVal))) {
      countVal = 0;
    } else {
      countVal = Number(countVal);
      countVal--;
      if (countVal < 0) countVal = 0;
    }
    var selectObj = tableList[selectRowIndex];
    // 判断理计物资不能超过出库最大值
    if (selectObj.goodsMetering == "理计") {
      let maxCount = 0;
      if (Number(selectObj.pickType) == 1) {
        // 凭证物资
        maxCount = selectObj.detailOkNnum;
      } else {
        maxCount = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
      }
      if (countVal > maxCount) {
        showMsg('不能超过可出库数量')
        countVal = maxCount
        $('#countIpt').val(countVal)
      }
    }
    var idx = Object.keys(singleGoodsCount).findIndex(
      itm => itm == selectObj.sbillBillbatch
    );
    if (idx >= 0) singleGoodsCount[selectObj.sbillBillbatch] = Number(countVal);
    if (selectObj.goodsMetering == "理计" || selectObj.mtype == 0) {
      let weight = floorWeight(
        Number(countVal * selectObj.goodsProperty1 * selectObj.goodsProperty2)
      );
      if (selectObj.mtype == 0) weight = selectObj.goodsWeight;
      $("#weightInfo").text(weight);
    }
    $("#countIpt").val(countVal);
  });
  $("#countAdd").click(() => {
    $(".zhd-keyboard").css("display", "none");
    var iptResult = canInput();
    if (iptResult != "ok") {
      showMsg(iptResult);
      return;
    }
    countVal = Number($("#countIpt").val());
    if (countVal == "" || isNaN(Number(countVal))) {
      countVal = 1;
    } else {
      countVal++;
    }
    var selectObj = tableList[selectRowIndex];
    if (selectObj.goodsMetering == "理计") {
      let maxCount = 0;
      if (Number(selectObj.pickType) == 1) {
        // 凭证物资
        maxCount = selectObj.detailOkNnum;
      } else {
        maxCount = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
      }
      if (countVal > maxCount) {
        showMsg('不能超过可出库数量')
        countVal = maxCount
        $('#countIpt').val(countVal)
      }
    }
    var idx = Object.keys(singleGoodsCount).findIndex(
      itm => itm == selectObj.sbillBillbatch
    );
    if (idx >= 0) singleGoodsCount[selectObj.sbillBillbatch] = Number(countVal);
    if (selectObj.goodsMetering == "理计" || selectObj.mtype == 0) {
      let weight = floorWeight(
        Number(countVal * selectObj.goodsProperty1 * selectObj.goodsProperty2)
      );
      if (selectObj.mtype == 0) weight = selectObj.goodsWeight;
      $("#weightInfo").text(weight);
    }
    $("#countIpt").val(countVal);
  });
  // 显示物资重量
  $("#weightInfo").text("");

  // 单个出库
  function singleOutStorage(
    currentObj,
    currentTd,
    cnt,
    weight,
    idx,
    max,
    bottomIdx = -1
  ) {
    return new Promise((resolve, reject) => {
      if (idx == 0) loading("批量出库中，请耐心等待...");
      // if (idx == max) userChooseBtnIdx = -1;
      request("/lockTd", {
        tdNo: currentTd
      })
        .then(resp => {
          console.log(resp);
          var body = {
            oconsignBillcode: currentObj.oconsignBillcode,
            oconsignBillbatch: currentObj.oconsignBillbatch,
            goodsNum: cnt,
            goodsWeight: weight,
            pickType: currentObj.pickType
          };
          // 
          if (wnameCheckArr.length > 0) body.delivers = wnameCheckArr.join(',')
          console.log("bottomidx:>>", bottomIdx);
          // 操作记录
          var optBody = {
            outNo: currentObj.oconsignBillcode,
            outBatchNo: currentObj.oconsignBillbatch,
            tdNo: currentObj.sbillBillcode,
            goodNo: currentObj.sbillBillbatch,
            goodName: currentObj.partsnameName,
            standard: currentObj.goodsSpec,
            material: currentObj.goodsMaterial,
            supply: currentObj.productareaName,
            length: currentObj.goodsProperty1,
            weight: weight,
            count: cnt
          };
          if (wnameCheckArr.length > 0) optBody.delivers = wnameCheckArr.join(',')
          if (currentObj.goodsProperty5)
            optBody.toleranceRange = currentObj.goodsProperty5;
          if (currentObj.goodsProperty4)
            optBody.weightRange = currentObj.goodsProperty4;
          let isBang = true;
          if (currentObj.goodsMetering == "理计" || currentObj.mtype == 0) {
            isBang = false;
          }
          if (bottomIdx >= 0 && isBang) {
            // 如果有多次清空数据
            // 是否是一个物资多秤
            let selectidx = linkMap[bottomIdx][0];
            console.log("selectidx", selectidx);
            if (selectidx == undefined) selectidx = selectRowIndex;
            let otherStockArray = [];
            let multiCraneIdx = [];
            multiCraneIdx.push(bottomIdx);
            Object.keys(linkMap).map(k => {
              let ix = linkMap[k].findIndex(im => im == selectidx);
              if (ix >= 0 && k != bottomIdx) {
                multiCraneIdx.push(k);
                if (dwtCounts[k].records.length > 0) {
                  otherStockArray.push(dwtCounts[k].records.join(";"));
                }
                if (linkMap[k].length == 1) {
                dwtCounts[k].canEdit = false;
                dwtCounts[k].records = [];
                dwtCounts[k].beforeCancelCount = 0;
                $("#cb" + k).unbind();
                $("#wbtnc" + k).unbind();
                $("#btntop" + k).remove();
                dwt[k] = 0;
                $(".weight-btn")
                  .eq(k)
                  .find("span")
                  .eq(0)
                  .text(dwt[k]);
                $(".weight-btn")
                  .eq(k)
                  .css("background-image", 'url("/img/dl.png")');
                }
              }
            });
            if (dwtCounts[bottomIdx].records.length > 0) {
              body.stocks = dwtCounts[bottomIdx].records.join(";");
            }
            if (otherStockArray.length > 0) {
              body.stocks = body.stocks + "|" + otherStockArray.join("|");
            }
            optBody.multiOutRecords = body.stocks;
            optBody.craneIndex = multiCraneIdx.join(";");
            if (linkMap[bottomIdx].length == 1) {
            dwtCounts[bottomIdx].canEdit = false;
            dwtCounts[bottomIdx].records = [];
            $("#cb" + bottomIdx).unbind();
            $("#wbtnc" + bottomIdx).unbind();
            $("#btntop" + bottomIdx).remove();
            }
          } else {
            // 理计出库记录
            optBody.craneIndex = "-1";
          }
          optBody.pickType = currentObj.pickType
          // 添加凭证出库逻辑 2019年07月24日
          if (Number(currentObj.pickType) === 1) {
            body.picktokenBillcode = currentObj.picktokenBillcode
            body.picktokenBillbatch = currentObj.picktokenBillbatch
            body.datasCarnum = currentObj.datasCarnum
            body.datasDriver = currentObj.datasDriver
            body.datasIdentitynum = currentObj.datasIdentitynum
            // 行为记录
            optBody.picktokenBillcode = currentObj.picktokenBillcode
            optBody.picktokenBillbatch = currentObj.picktokenBillbatch
            optBody.datasCarnum = currentObj.datasCarnum
            optBody.datasDriver = currentObj.datasDriver
            optBody.datasIdentitynum = currentObj.datasIdentitynum
          }
          var optID = 0;
          request("/save/crane/operator", optBody).then(res => {
            if (res.status === 0) {
              optID = res.code
            }
          });
          if (resp.status == 0) {
            console.log("锁库成功");
            request("/outStorage", body)
              .then(res => {
                console.log(res);
                if (res.status != 0) {
                  clearTopCbx()
                }
                if (res.status == 0) {
                  if (res.message.startsWith("[待审核]")) {
                    // var result = window.confirm(`此条物资需要审核确认\n 出库重量:${w}\n 出库数量:${cnt}`)
                    if (optID > 0) {
                      request("/update/crane/operator", {
                        id: optID,
                        status: 3
                      });
                    }
                    hideLoad();
                    $("body").append(
                      modalTemp({
                        modalId: "modal" + currentObj.oconsignBillbatch,
                        modalTitle: `提单号:${
                          currentObj.sbillBillcode
                        }中此条物资需要审核确认\n 出库重量:${weight}\n 出库数量:${cnt}`
                      })
                    );
                    showModal("#modal" + currentObj.oconsignBillbatch, function(
                      result
                    ) {
                      if (result) {
                        var outstorageNo = res.message.split("|")[1];
                        request("/outStorageAudit", {
                          billCode: outstorageNo,
                          status: 1,
                          remark: "吊秤审核"
                        })
                          .then(rp => {
                            if (rp.status == 0) {
                              if (optID > 0) {
                                request("/update/crane/operator", {
                                  id: optID,
                                  status: 4
                                });
                              }
                              outStorageSuccess(currentObj, false, function() {
                                console.log(
                                  "吊秤审核成功",
                                  userChooseBtnIdx,
                                  linkMap[userChooseBtnIdx]
                                );
                                userChooseBtnIdx == -1
                                  ? reject()
                                  : resolve({
                                      currentIdx: 0,
                                      arr: linkMap[userChooseBtnIdx]
                                    });
                              });
                            } else {
                              if (optID > 0) {
                                request("/update/crane/operator", {
                                  id: optID,
                                  status: 5,
                                  errMsg: rp.message || "物资审核失败"
                                });
                              }
                              showMsg(rp.message);
                              request("/unlockTd", {
                                tdNo: currentTd
                              });
                              userChooseBtnIdx == -1
                                ? reject()
                                : resolve({
                                    currentIdx: idx + 1,
                                    arr: linkMap[userChooseBtnIdx]
                                  });
                            }
                          })
                          .catch(e => {
                            console.log(e);
                            request("/unlockTd", {
                              tdNo: currentTd
                            });
                            if (idx == max) hideLoad();
                            showMsg(e);
                            userChooseBtnIdx == -1
                              ? reject()
                              : resolve({
                                  currentIdx: idx + 1,
                                  arr: linkMap[userChooseBtnIdx]
                                });
                          });
                      } else {
                        if (idx == max) hideLoad();
                        if (optID > 0) {
                          request("/update/crane/operator", {
                            id: optID,
                            status: 6
                          });
                        }
                        outStorageSuccess(currentObj, true);
                        reject();
                      }
                    });
                  } else {
                    if (idx == max) hideLoad();
                    if (optID > 0) {
                      request("/update/crane/operator", {
                        id: optID,
                        status: 1
                      });
                    }
                    outStorageSuccess(currentObj, false, function() {
                      userChooseBtnIdx == -1
                        ? reject()
                        : resolve({
                            currentIdx: 0,
                            arr: linkMap[userChooseBtnIdx]
                          });
                    });
                  }
                } else if (res.status == -2) {
                  if (idx == max) hideLoad();
                  showMsg("账户已禁用");
                  request("/unlockTd", {
                    tdNo: currentTd
                  });
                  reject();
                } else {
                  if (idx == max) hideLoad();
                  if (optID > 0) {
                    request("/update/crane/operator", {
                      id: optID,
                      status: 2,
                      errMsg: res.message || "物资出库失败"
                    });
                  }
                  showMsg(res.message || "网络异常");
                  request("/unlockTd", {
                    tdNo: currentTd
                  });
                  userChooseBtnIdx == -1
                    ? reject()
                    : resolve({
                        currentIdx: idx + 1,
                        arr: linkMap[userChooseBtnIdx]
                      });
                  // resolve(idx + 1, linkMap[userChooseBtnIdx]);
                }
              })
              .catch(e => {
                console.log(e);
                if (idx == max) hideLoad();
                showMsg(e.message || "网络异常");
                request("/unlockTd", {
                  tdNo: currentTd
                });
                // showMsg(e);
                userChooseBtnIdx == -1
                  ? reject()
                  : resolve({
                      currentIdx: idx + 1,
                      arr: linkMap[userChooseBtnIdx]
                    });
                // resolve(idx + 1, linkMap[userChooseBtnIdx]);
              });
          } else if (resp.status == -2) {
            if (idx == max) hideLoad();
            showMsg("账户已禁用");
            reject();
          } else {
            if (idx == max) hideLoad();
            showMsg(resp.message || "网络异常");
            userChooseBtnIdx == -1
              ? reject()
              : resolve({
                  currentIdx: idx + 1,
                  arr: linkMap[userChooseBtnIdx]
                });
            // resolve(idx + 1, linkMap[userChooseBtnIdx]);
          }
        })
        .catch(err => {
          console.log(err);
          if (idx == max) hideLoad();
          showMsg(err);
          userChooseBtnIdx == -1
            ? reject()
            : resolve({ currentIdx: idx + 1, arr: linkMap[userChooseBtnIdx] });
          // resolve(idx + 1, linkMap[userChooseBtnIdx]);
        });
    });
  }

  function getCraneWeight(val) {
    // debugger
    if (val.indexOf(".") < 0) {
      return val;
    } else {
      var dotStr = val.substring(val.indexOf(".") + 1);
      if (dotStr.length == 1) {
        return val.substring(0, val.indexOf(".") + 1) + dotStr + "05";
      } else if (dotStr.length == 2) {
        return val.substring(0, val.indexOf(".") + 1) + dotStr + "5";
      } else {
        return (
          val.substring(0, val.indexOf(".") + 1) + dotStr.substring(0, 2) + "5"
        );
      }
    }
  }

  function getFixWeight(val) {
    console.log("single weight:>>", val);
    let newVal = Math.round(Number(val) * 10000) + "";
    console.log("newval:>>", newVal);
    let prefix = "0";
    if (newVal.length > 2) {
      prefix = newVal.substring(0, newVal.length - 2);
    }
    let num = newVal.substring(newVal.length - 2, newVal.length - 1);
    let lastNum = newVal.substring(newVal.length - 1, newVal.length);
    console.log("取值:>>>", num, ";", lastNum);
    if (Number(lastNum) > 0 && Number(num) < 9) {
      return Number(Number(prefix + "" + (Number(num) + 1)) / 1000).toFixed(3);
    } else {
      console.log("不存在");
      if (lastNum > 0) {
        return Number(
          (Number(newVal.substring(0, newVal.length - 1)) + 1) / 1000
        ).toFixed(3);
      } else {
        return Number(
          Number(newVal.substring(0, newVal.length - 1)) / 1000
        ).toFixed(3);
      }
    }
  }

  $("#weightWrapAdd").click(function(e) {
    e.stopPropagation();
    var val = $("#weightInfo").text();
    val = Number(val) + 0.005;
    $("#weightInfo").text(val.toFixed(3));
  });

  $("#weightInfoWrap").click(() => {
    let w = $("#weightInfo").text();
    let cnt = $("#countIpt").val();
    if (selectRowIndex > -1) {
      var selectObj = tableList[selectRowIndex];
      // 判断理计物资不能超过出库最大值
      if (selectObj.goodsMetering == "理计") {
        let maxCount = 0;
        if (Number(selectObj.pickType) == 1) {
          // 凭证物资
          maxCount = selectObj.detailOkNnum;
        } else {
          maxCount = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum)
        }
        if (cnt > maxCount) {
          cnt = maxCount
          $('#countIpt').val(countVal)
        }
      }
    }
    console.log(cnt);
    console.log("currentUserChooseBtn", userChooseBtnIdx);
    if (Number(w) <= 0) {
      showMsg("重量必须大于0");
      return;
    }
    if (wnameCheckArr.length === 0) {
      showMsg('请选择操作人员');
      return;
    }
    if (userChooseBtnIdx == -1) {
      if (selectRowIndex == -1) {
        showMsg("请选择出库的物资");
        return;
      }
      var selectObj = tableList[selectRowIndex];
      if (selectObj.goodsMetering == "理计" || selectObj.mtype == 0) {
        // 重新计算重量
        let weight = floorWeight(
          Number(cnt * selectObj.goodsProperty1 * selectObj.goodsProperty2)
        );
        if (selectObj.mtype == 0) weight = selectObj.goodsWeight;
        $("#weightInfo").text(weight);
        w = weight
      } else {
        showMsg("请选择出库的磅秤");
        return;
      }
    }
    totalPlankArr = []
    // 批量出库
    if (userChooseBtnIdx > -1) {
      let detailIdx = linkMap[userChooseBtnIdx];
      detailIdx.map(itm => {
        totalPlankArr.push(tableList[itm])
      })
      // FIXME 出库
      if (detailIdx.length > 1) {
        let arr = detailIdx.map(itm => tableList[itm]);
        let ct = tableList[selectRowIndex];
        let idx = arr.findIndex(itm => itm.sbillBillbatch == ct.sbillBillbatch);
        console.log(idx);
        if (idx >= 0) {
          console.log("batch outstorage");
          batchWeight(0, detailIdx, w, cnt);
        } else {
          let currentObj = tableList[selectRowIndex];
          let currentTd = currentObj.sbillBillcode;
          delete singleGoodsCount[currentObj.sbillBillbatch];
          singleOutStorage(
            currentObj,
            currentTd,
            cnt,
            w,
            0,
            0,
            userChooseBtnIdx
          );
        }
      } else {
        console.log("single bang outstorage");
        let currentObj = tableList[detailIdx[0]];
        if (detailIdx.length == 0) currentObj = tableList[selectRowIndex];
        let selectObj = tableList[selectRowIndex];
        if (selectObj.sbillBillbatch != currentObj.sbillBillbatch)
          currentObj = tableList[selectRowIndex];
        let currentTd = currentObj.sbillBillcode;
        delete singleGoodsCount[selectObj.sbillBillbatch];
        singleOutStorage(currentObj, currentTd, cnt, w, 0, 0, userChooseBtnIdx);
      }
    } else {
      let currentObj = tableList[selectRowIndex];
      let currentTd = currentObj.sbillBillcode;
      delete singleGoodsCount[currentObj.sbillBillbatch];
      singleOutStorage(currentObj, currentTd, cnt, w, 0, 0, userChooseBtnIdx);
    }
  });
  let plankWeightArr = [];
  // 总重量板子组
  let totalPlankArr = [];
  function batchWeight(idx, detailArray, w, cnt) {
    let currentObj = tableList[detailArray[idx]];
    let currentTd = currentObj.sbillBillcode;
    let currentCnt = Number(
      currentObj.goodsNum - currentObj.oconsignDetailOknum
    );
    console.log('detailArray:>>', detailArray)
    console.log('totalplankarr:>>', totalPlankArr)
    console.log('total w:>>', w)
    // debugger
    // if (idx == 0) plankWeightArr = []
    let currentWeight = getFixWeight(
      Number((Number(w) / Number(cnt)) * currentCnt).toFixed(4)
    );
    let tempWeight = 0;
    let tempWstr = "";
    if (currentObj.pntreeName == "板材" && idx < detailArray.length - 1) {
      // if (currentObj.partsnameName == "花纹板") {
      //   tempWeight =
      //     (((Number(currentObj.goodsSpec1) + 0.3) * 7.85) / 1000) *
      //     (Number(currentObj.goodsSpec2) / 1000) *
      //     Number(currentObj.goodsProperty1) *
      //     currentCnt;
      //   tempWstr = tempWeight.toFixed(4);
      //   currentWeight = getFixWeight(tempWstr);
      //   console.log('currentWeight:>>', currentWeight)
      //   currentWeight = getCraneWeight(currentWeight)
      //   console.log('crane weight:>>', currentWeight)
      //   plankWeightArr.push(currentWeight);
      // } else {
      //   tempWeight =
      //     ((Number(currentObj.goodsSpec1) * 7.85) / 1000) *
      //     (Number(currentObj.goodsSpec2) / 1000) *
      //     Number(currentObj.goodsProperty1) *
      //     currentCnt;
      //   tempWstr = tempWeight.toFixed(4);
      //   currentWeight = getFixWeight(tempWstr);
      //   console.log('currentWeight:>>', currentWeight)
      //   currentWeight = getCraneWeight(currentWeight)
      //   console.log('crane weight:>>', currentWeight)
      //   plankWeightArr.push(currentWeight);
      // }
      // 最新算法 长度 * 数量 * (重量 / 总数量)
      let totalMeters = 0;
      totalPlankArr.map(tempObj => {
        totalMeters += Number((tempObj.goodsNum - tempObj.oconsignDetailOknum) * tempObj.goodsProperty1)
      })
      tempWeight = (Number((currentObj.goodsNum - currentObj.oconsignDetailOknum) * currentObj.goodsProperty1) / totalMeters) * w
      tempWstr = tempWeight.toFixed(4)
      currentWeight = getFixWeight(tempWstr)
      plankWeightArr.push(currentWeight)
    } else if (
      currentObj.pntreeName == "板材" &&
      idx == detailArray.length - 1
    ) {
      let t = 0;
      if (plankWeightArr.length > 0) {
        plankWeightArr.map(itm => {
          t += Number(itm);
        });
      }
      tempWeight = Number(w) - t;
      // if (tempWeight < 0) tempWeight = 0.001;
      if (tempWeight < 0) tempWeight = 0.0;
      currentWeight = tempWeight.toFixed(3);
    } else if (
      currentObj.pntreeName != "板材" &&
      idx < detailArray.length - 1
    ) {
      console.log('currentWeight:>>', currentWeight)
      currentWeight = getCraneWeight(currentWeight)
      console.log('crane weight:>>', currentWeight)
      plankWeightArr.push(currentWeight);
    } else if (
      currentObj.pntreeName != "板材" &&
      idx == detailArray.length - 1
    ) {
      console.log("不是板材到最后", plankWeightArr);
      let t = 0;
      if (plankWeightArr.length > 0) {
        plankWeightArr.map(itm => {
          t += Number(itm);
        });
      }
      tempWeight = Number(w) - t;
      if (tempWeight < 0) tempWeight = 0.0;
      currentWeight = tempWeight.toFixed(3);
    }
    console.log(
      "outstorage idx:>>",
      idx,
      ";plankWeightArr:>>",
      plankWeightArr,
      ";currentWeight:>>",
      currentWeight
    );
    delete singleGoodsCount[currentObj.sbillBillbatch];
    singleOutStorage(
      currentObj,
      currentTd,
      currentCnt,
      currentWeight,
      idx,
      detailArray.length - 1,
      userChooseBtnIdx
    ).then(
      res => {
        console.log("currentIndx:>>", res);
        if (res.currentIdx < res.arr.length && userChooseBtnIdx > -1)
          batchWeight(res.currentIdx, res.arr, w, cnt);
      },
      () => {
        clearTopCbx()
        console.error("暂停");
        console.log("userChooseIdx::", userChooseBtnIdx);
        console.log("linkMap:>>", linkMap[userChooseBtnIdx]);
        let keys = Object.keys(linkMap).filter(itm => itm != userChooseBtnIdx)
        // FIXME 判断是不是多物资多秤
        // 取消吊秤按钮
        console.log('other keys:>>', keys)
        let firstSelect = linkMap[userChooseBtnIdx][0]
        console.log('firstSelect:>>', firstSelect)
        linkMap[userChooseBtnIdx].map(itm => {
          var craneBtn = $("#wzBody .tr")
            .eq(itm)
            .find(".td")
            .eq(9)
            .find(".crane-btn");
          craneBtn.unbind();
          craneBtn.remove();
        });
        showMultiCranePart(false, userChooseBtnIdx);
        $('#btntop' + userChooseBtnIdx).remove()
        linkMap[userChooseBtnIdx] = [];
        $(".weight-btn")
        .eq(userChooseBtnIdx)
        .css("background-image", "url(/img/dl.png)");
        $(".weight-btn")
        .eq(userChooseBtnIdx)
        .find("span")
        .eq(0)
        .text('0')
        console.log('linkMap:>>', linkMap)
        keys.map(itm => {
          console.log('itm', itm, ';', linkMap[itm])
          let idx = (linkMap[itm]).findIndex(item => item == firstSelect)
          if (idx >= 0) {
            linkMap[itm] = []
            dwt[itm] = 0
            showMultiCranePart(false, itm);
            $(".weight-btn")
              .eq(itm)
              .css("background-image", "url(/img/dl.png)");
            $(".weight-btn")
              .eq(itm)
              .find("span")
              .eq(0)
              .text('0')
          }
        })
        factWeight = 0
        updateFactWeight(factWeight)
        userChooseBtnIdx = -1;
        // if (res.currentIdx < res.arr.length && userChooseBtnIdx > -1)
        // batchWeight(res.currentIdx, res.arr, w, cnt);
      }
    );
  }

  // 退出按钮
  $(".main-close").click(() => {
    // logout();
    window.location.href = "/menu";
  });

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
  // 绑定磅秤按钮事件
  function bindCraneBtn(rowIndex) {
    let temp = $("#wzBody .tr")
      .eq(rowIndex)
      .find(".crane-btn");
    console.log(temp);
    temp.click(function(e) {
      e.stopPropagation();
      console.log("已经绑定");
      console.log($(this).data("bidx"));
      let btnIdx = $(this).data("bidx");
      let rowIdx = $(this).data("ridx");
      $(this).unbind();
      let selectArray = [];
      // selectArray = selectArray.filter(itm => itm != rowIdx);
      linkMap[btnIdx] = selectArray;
      console.log("after unbind crane btn:>>", linkMap[btnIdx]);
      $('.crane-btn[data-bidx="'+btnIdx+'"]').remove();
      showMultiCranePart(false, btnIdx);
      if (selectArray.length == 0) {
        $(".weight-btn")
          .eq(btnIdx)
          .css("background-image", 'url("/img/dl.png")');
      }
    });
  }
  function outStorageSuccess(currentObj, manAudit = false, cb) {
    // clearTopCbx()
    let uniqueCode = currentObj.sbillBillbatch;
    console.log("uniqueCode:>>>" + uniqueCode);
    console.log(linkMap);
    // 出库物资是还是磅计，默认是磅计
    let isBang = true;
    if (currentObj.goodsMetering == "理计" || currentObj.mtype == 0) {
      isBang = false;
    }
    if (!isBang) clearTopCbx()
    var tableIndex = tableList.findIndex(
      itm => itm.sbillBillbatch == uniqueCode
    );
    let otherSelectRowObj = {};
    Object.keys(linkMap).map(itm => {
      console.log("itm:>>", itm);
      if (linkMap[itm].length >= 0) {
        var arr = linkMap[itm];
        arr.map(item => {
          if (item != tableIndex) {
            // 判断是否一个物资对应多个秤
            let otherKeys = Object.keys(otherSelectRowObj);
            let idx = otherKeys.findIndex(
              itm => itm == tableList[item]["sbillBillbatch"]
            );
            if (idx >= 0) {
              otherSelectRowObj[tableList[item]["sbillBillbatch"]] =
                itm +
                ";" +
                otherSelectRowObj[tableList[item]["sbillBillbatch"]];
            } else {
              otherSelectRowObj[tableList[item]["sbillBillbatch"]] = itm;
            }
          }
        });
      }
    });
    // console.log("weightBtnIdx:>>>" + weightBtnIdx);
    // linkMap[weightBtnIdx] = -1;
    // if (userChooseBtnIdx > -1 && isBang) {
    //   Object.keys(linkMap).map(k => {
    //     var currentWeightArr = linkMap[k];
    //     currentWeightArr = currentWeightArr.filter(itm => itm != tableIndex);
    //     linkMap[k] = currentWeightArr;
    //   })
    // }
    $(".crane-btn").unbind();
    tableList = tableList.filter(itm => itm.sbillBillbatch != uniqueCode);
    selectRowIndex = -1;
    resetLinkmap();
    updateTableData(tableList);
    Object.keys(otherSelectRowObj).map(k => {
      let idx = tableList.findIndex(itm => itm.sbillBillbatch == k);
      let btnIdx = otherSelectRowObj[k];
      console.log("success btnidx", btnIdx);
      if (btnIdx.indexOf(";") > 0) {
        // 一个物资对应多秤
        let arr = btnIdx.split(";");
        arr.map((ar, ix) => {
          linkMap[Number(ar)].push(idx);
          console.log("ar:>>", ar, ";ix:>>", ix, "; typoef ar", typeof ar);
          if (ix == 0) {
            $("#wzBody .tr")
              .eq(idx)
              .find(".td")
              .eq(9)
              .html("");
            $("#wzBody .tr")
              .eq(idx)
              .find(".td")
              .eq(9)
              .html(
                '<div class="crane-btn column" data-bidx="' +
                  ar +
                  '"  data-ridx="' +
                  idx +
                  '"><span>' +
                  craneNames[ar] +
                  "</span></div>"
              );
          } else {
            $("#wzBody .tr")
              .eq(idx)
              .find(".td")
              .eq(9)
              .prepend(
                '<div class="crane-btn column" data-bidx="' +
                  ar +
                  '"  data-ridx="' +
                  idx +
                  '"><span>' +
                  craneNames[ar] +
                  "</span></div>"
              );
          }
        });
      } else {
        linkMap[btnIdx].push(idx);
        $("#wzBody .tr")
          .eq(idx)
          .find(".td")
          .eq(9)
          .html("");
        $("#wzBody .tr")
          .eq(idx)
          .find(".td")
          .eq(9)
          .html(
            '<div class="crane-btn column" data-bidx="' +
              btnIdx +
              '"  data-ridx="' +
              idx +
              '"><span>' +
              craneNames[btnIdx] +
              "</span></div>"
          );
      }
      bindCraneBtn(idx);
    });
    initActiveRect(selectRowIndex);
    $("#countIpt").val("");
    $("#weightInfo").text("");
    if (userChooseBtnIdx > -1 && isBang) {
      $(".weight-btn")
        .eq(userChooseBtnIdx)
        .css("background-image", "url(/img/dl.png)");
      dwt[userChooseBtnIdx] = 0;
      $(".weight-btn")
        .eq(userChooseBtnIdx)
        .find("span")
        .eq(0)
        .text(dwt[userChooseBtnIdx]);
      // debugger
      // showMultiCranePart((linkMap[userChooseBtnIdx].length > 0), userChooseBtnIdx)
      if (linkMap[userChooseBtnIdx].length == 0) {
        clearTopCbx()
        showMultiCranePart(false, userChooseBtnIdx)
        userChooseBtnIdx = -1;
      }
    }
    console.log("出库后的按钮映射");
    console.log(linkMap);
    if (manAudit) showMsg("请去电脑后台人工审核出库");
    else showMsg("该物资已出库成功");
    if (cb) cb();
  }

  function resetLinkmap() {
    linkMap = {
      0: [],
      1: [],
      2: [],
      3: []
    };
  }

  function updateTableData(data) {
    $("#wzBody .tr td:first-child").unbind();
    $("#wzBody .tr").remove();
    $("#wzBody .highlight-rect").remove();
    $("#wzBody").append(
      tableTemp({
        data,
        keys: trKeys
      })
    );
    $("#wzBody .tr").click(function() {
      var rowIdx = $(this).data("rowindex");
      selectRowIndex = Number(rowIdx);
      console.log("selectRowIndex:>>" + selectRowIndex);
      initActiveRect(selectRowIndex);
      // 判断是否可以直接出库
      let selectObj = tableList[selectRowIndex];
      console.log(selectObj);
      let td = selectObj.sbillBillbatch;
      let cnt = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum);
      if (Number(selectObj.pickType) === 1) {
        cnt = Number(selectObj.detailOkNnum)
      }
      if (selectObj.goodsMetering == "理计" || selectObj.mtype == 0) {
        let weight = formatWeight(
          Number(cnt * selectObj.goodsProperty1 * selectObj.goodsProperty2)
        );
        if (selectObj.mtype == 0) weight = selectObj.goodsWeight;
        $("#weightInfo").text(weight);
        $("#countIpt").val(cnt);
      } else {
        userChooseBtnIdx = -1
        let idx = Object.keys(singleGoodsCount).findIndex(itm => itm == td);
        if (idx < 0) {
          singleGoodsCount[td] = cnt;
        } else {
          cnt = singleGoodsCount[td];
        }
        $("#weightInfo").text("");
        // 是否是一个物资绑多个秤
        let arr = [];
        Object.keys(linkMap).map(k => {
          let i = linkMap[k].findIndex(itm => itm == selectRowIndex);
          if (i >= 0) arr.push(k);
        });
        var total = 0;
        if (arr.length > 0) {
          arr.map(itm => {
            dwtCounts[itm].records.map(im => {
              total += Number(im);
            });
          });
          factWeight = Number(total / 1000).toFixed(3);
          $("#weightInfo").text(factWeight);
        }
        $("#countIpt").val(cnt);
      }
    });
    $("#wzBody .tr .td:first-child").click(function(e) {
      e.stopPropagation();
      console.log("click td :>>>" + $(this).data("idx"));
      let rowidx = $(this).data("idx");
      // let result = window.confirm('您确定要删除此物资吗?')
      $("body").append(
        modalTemp({
          modalId: "modalDel",
          modalTitle: "您确定要删除此物资吗？"
        })
      );
      showModal("#modalDel", function(result) {
        if (result) {
          let currentTD = tableList[rowidx]["sbillBillbatch"];
          let btnIndx = -1;
          let otherSelectRowObj = {};
          console.log("currentTD:>>" + currentTD);
          // 选择的多对多 
          Object.keys(linkMap).map(k => {
            linkMap[k] = linkMap[k].filter(itm => itm != rowidx)
          })
          Object.keys(linkMap).map(k => {
            if (linkMap[k].length > 0) {
              linkMap[k].map(idx => {
                  let keys = Object.keys(otherSelectRowObj);
                  let indx = keys.findIndex(
                    im => im == tableList[idx]["sbillBillbatch"]
                  );
                  if (indx >= 0) {
                    // 一对多
                    otherSelectRowObj[tableList[idx]["sbillBillbatch"]] =
                      k +
                      ";" +
                      otherSelectRowObj[tableList[idx]["sbillBillbatch"]];
                  } else {
                    otherSelectRowObj[tableList[idx]["sbillBillbatch"]] = k;
                  }
              });
            }
          });
          selectRowIndex = -1;
          $(".crane-btn").unbind();
          delete singleGoodsCount[currentTD];
          tableList = tableList.filter(
            itm => itm["sbillBillbatch"] != currentTD
          );
          // TODO 判断当前选择物资是否是一对多个秤
          // let otherArr = [];
          // Object.keys(linkMap).map(k => {
          //   let idx = linkMap[k].findIndex(im => im == rowidx);
          //   if (idx >= 0 && k != btnIndx) otherArr.push(k);
          // });
          // if (otherArr.length > 0) {
          //   // 清空对于底部按钮
          //   otherArr.map(itm => {
          //     $(".weight-btn")
          //       .eq(itm)
          //       .css("background-image", "url(/img/dl.png)");
          //     showMultiCranePart(false, itm);
          //   });
          // }
          // ======
          updateTableData(tableList);
          resetLinkmap();
          // 清空底部按钮
          Object.keys(linkMap).map(k => {
            $('.weight-btn').eq(k).css('background-image', 'url(/img/dl.png)')
            showMultiCranePart(false, k)
          })
          Object.keys(otherSelectRowObj).map(k => {
            let idx = tableList.findIndex(itm => itm.sbillBillbatch == k);
            let btnIdx = otherSelectRowObj[k];
            if (btnIdx.indexOf(";") > 0) {
              let arr = btnIdx.split(";");
              arr.map((im, indx) => {
                linkMap[Number(im)].push(idx);
                if (indx == 0) {
                  $("#wzBody .tr")
                    .eq(idx)
                    .find(".td")
                    .eq(9)
                    .html("");
                  $("#wzBody .tr")
                    .eq(idx)
                    .find(".td")
                    .eq(9)
                    .html(
                      '<div class="crane-btn column" data-bidx="' +
                        im +
                        '" data-ridx="' +
                        idx +
                        '"><span>' +
                        craneNames[im] +
                        "</span></div>"
                    );
                } else {
                  $("#wzBody .tr")
                    .eq(idx)
                    .find(".td")
                    .eq(9)
                    .prepend(
                      '<div class="crane-btn column" data-bidx="' +
                        im +
                        '" data-ridx="' +
                        idx +
                        '"><span>' +
                        craneNames[im] +
                        "</span></div>"
                    );
                }
              });
            } else {
              linkMap[Number(btnIdx)].push(idx);
              $("#wzBody .tr")
                .eq(idx)
                .find(".td")
                .eq(9)
                .html("");
              $("#wzBody .tr")
                .eq(idx)
                .find(".td")
                .eq(9)
                .html(
                  '<div class="crane-btn column" data-bidx="' +
                    btnIdx +
                    '" data-ridx="' +
                    idx +
                    '"><span>' +
                    craneNames[btnIdx] +
                    "</span></div>"
                );
            }
            bindCraneBtn(idx);
          });
          console.log("del linkMap btnidx", btnIndx, linkMap[btnIndx]);
          Object.keys(linkMap).map(k => {
            $('.weight-btn').eq(k).css('background-image', (linkMap[k].length > 0) ? 'url(/img/gl.png)' : 'url(/img/dl.png)')
            showMultiCranePart((linkMap[k].length > 0), k)
          })
          // if (btnIndx >= 0 && linkMap[btnIndx].length == 0) {
          //   $(".weight-btn")
          //     .eq(btnIndx)
          //     .css("background-image", "url(/img/dl.png)");
          //   showMultiCranePart(false, btnIndx);
          // }
          initActiveRect(selectRowIndex);
        }
      });
    });
  }

  function showWzCount(currentBtnIdx) {
    let selectIdxArray = linkMap[currentBtnIdx];
    let count = 0;
    selectIdxArray.map(itm => {
      let selectObj = tableList[itm];
      count += Number(selectObj.goodsNum - selectObj.oconsignDetailOknum);
    });
    if (selectIdxArray.length == 1) {
      let obj = tableList[selectIdxArray[0]];
      count = singleGoodsCount[obj.sbillBillbatch];
    }
    $("#countIpt").val(count);
  }
});
function floorWeight(val) {
  let w = Number(val);
  if (isNaN(w)) {
    return "0";
  } else {
    return w.toFixed(3)
    // let str = w.toString();
    // let dotStr = str.substring(str.indexOf("."));
    // if (dotStr.length > 4) {
    //   return str.substring(0, str.indexOf(".") + 4);
    // } else {
    //   return w.toFixed(3);
    // }
  }
}

function formatWeight(val) {
  let w = Number(val);
  if (isNaN(w)) {
    return "0";
  } else {
    let str = w.toString();
    let dotStr = str.substring(str.indexOf("."));
    if (dotStr.length > 4) {
      let lastNum = Number(
        str.substring(str.indexOf(".") + 4, str.indexOf(".") + 5)
      );
      let preNum = Number(str.substring(0, str.indexOf(".") + 4));
      if (lastNum >= 5) preNum += 0.001;
      return preNum.toFixed(3);
    } else {
      return str;
    }
  }
}

function initActiveRect(idx) {
  if (idx == -1) {
    $("#wzBody > .active-rect").css("display", "none");
  } else {
    $("#wzBody > .active-rect").css("top", 68 * idx + "px");
    $("#wzBody > .active-rect").css("display", "block");
  }
}

function updateFactWeight(weight) {
  $("#weightInfo").text(weight);
}
