$(function() {
  $("body").removeClass("main-bg");
  $("body").addClass("main-bg");
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

  var factWeight = "";
  var userChooseBtnIdx = -1;
  var dwt = [w1, w2, w3, w4];
  var bottomTemp = _.template($("#weightBtns").html());
  $("#secBtns").html(bottomTemp(datas));
  // modal template
  var modalTemp = _.template($("#zhdModal").html());
  // 根据品名、材质、规格、产地相等，能合并一同绑定出库
  function isTheSame(origin, compare) {
    console.log("is the same", compare);
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
      origin.goodsProperty1;
    console.log(compareStr, orginStr);
    return orginStr == compareStr;
  }
  // 板材物资合并秤重规则
  // pntreeName 物资大类
  // partsnameName 品名
  // warehouseName 仓库名称
  // goodsSpec1 厚度(mm)
  // goodsSpec2 宽度(mm)
  function plankCompare (origin, compare) {
    var originStr = origin.goodsSpec1 + '**' + origin.goodsSpec2 + '**' + origin.warehouseName
    var compareStr = compare.goodsSpec1 + '**' + origin.goodsSpec2 + '**' + origin.warehouseName
    console.log('plank origin:>>', originStr, '; compare:>>', compareStr)
    return originStr == compareStr
  }
  $(".weight-btn").click(function() {
    if (selectRowIndex == -1) {
      showMsg("请先选择物资");
      return;
    }
    plankWeightArr = []
    let selectObj = tableList[selectRowIndex];
    console.log('selectObj:>>' , selectObj);
    let cnt = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum);
    if (
      (selectObj.goodsMetering == "理计" && selectObj.dataAwedit == 0) ||
      selectObj.mtype == 0
    ) {
      showMsg("无需关联吊秤可以直接出库");
      return;
    }
    console.log("click me");
    let btnIdx = Number($(this).data("index"));
    console.log("btnidx:>>", btnIdx);
    console.log("btnRowIndx:>> ", linkMap[btnIdx]);
    console.log("dwt weight:>>", dwt[btnIdx]);
    if (Number(dwt[btnIdx]) > 0 && linkMap[btnIdx].length == 0) {
      showMsg("请将磅秤重置为零，才能进行设备绑定");
      return;
    }
    let idx = linkMap[btnIdx].findIndex(itm => itm == selectRowIndex);
    // let idx = Object.keys(linkMap)
    // .map(itm => linkMap[itm])
    // .findIndex(it => it == selectRowIndex);
    if (idx >= 0) {
      // alert('此物资已关联设备')
      console.log("此物资已关联设备");
      // selectRowIndex = linkMap[btnIdx];
      initActiveRect(selectRowIndex);
      showWzCount(btnIdx);
      factWeight = Number(dwt[btnIdx] / 1000).toFixed(3);
      updateFactWeight(factWeight);
      userChooseBtnIdx = btnIdx;
      return;
    }
    var otherIdxs = [];
    Object.keys(linkMap).map(itm => {
      if (itm != btnIdx) {
        linkMap[itm].map(item => {
          otherIdxs.push(item);
        });
      }
    });
    idx = otherIdxs.findIndex(itm => itm == selectRowIndex);
    if (idx >= 0) {
      showMsg("此物资已关联其他设备");
      return;
    }
    // 判断时候相同物资明细
    if (linkMap[btnIdx].length > 0) {
      console.log("selectrowindex:>>>", selectRowIndex);
      console.log("orign idx:>>", linkMap[btnIdx][0]);
      let origin = tableList[linkMap[btnIdx][0]];
      let compare = tableList[selectRowIndex];
      // console.log("origin obj", origin);
      // console.log("compare obj", compare, compare.goodsSpec);
      if (origin.pntreeName == '板材') {
        if (origin.warehouseName == '板材定开') {
          if (!plankCompare(origin, compare)) {
            showMsg('此物资不能不与之前物资合并一起称重')
            return
          } 
        } else {
          showMsg('之前物资不是板材定开库的物资，不能合并一起称重')
          return
        }
      } else {
        if (!isTheSame(origin, compare)) {
          showMsg("此物资不能与之前的物资合并一起称重");
          return;
        }
      }
    }
    if (selectRowIndex >= 0) {
      // let result = window.confirm("你确定要关联此设备吗?");

      $("body").append(
        modalTemp({
          modalId: "linkDevice",
          modalTitle: "您确定要关联此设备吗?"
        })
      );
      showModal("#linkDevice", function(result) {
        if (result) {
          $(".weight-btn")
            .eq(btnIdx)
            .next()
            .css("display", "block");
          linkMap[btnIdx].push(selectRowIndex);
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
          showWzCount(btnIdx);
          factWeight = Number(dwt[btnIdx] / 1000).toFixed(3);
          updateFactWeight(factWeight);
          console.log("hander link btn:>>", linkMap[btnIdx]);
          userChooseBtnIdx = btnIdx;
          $(".weight-btn")
            .eq(btnIdx)
            .css("background-image", "url(/img/gl.png)");
        }
      });
    } else {
      console.log("currentidx:>>" + selectRowIndex);
      console.log("btnidx:>>" + btnIdx);
      console.error("进入未处理的判断");
      // if (selectRowIndex == -1) {
      //   showMsg("请选择关联设备的物资");
      // } else if (selectRowIndex != linkMap[btnIdx]) {
      //   linkMap[btnIdx] == -1
      //     ? showMsg("该物资已被关联到其他设备")
      //     : showMsg("此设备已关联其他物资");
      // }
    }
  });

  // websocket
  var socket = io();
  try {
    socket.on("factWeight", function(data, idx) {
      console.log(data + ";" + idx);
      dwt[idx] = data;
      if (Number(data) >= 0)
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
    "goodsProperty5",
    "goodsProperty4"
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
      sbillBillcode: "TD" + tdNo
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
            Object.keys(linkMap).map(itm => {
              if (linkMap[itm].length > 0) {
                linkMap[itm].map(item => {
                  chooseItems[tableList[item]["sbillBillbatch"]] = itm;
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
            Object.keys(chooseItems).map(k => {
              let idx = tableList.findIndex(itm => itm.sbillBillbatch == k);
              let btnIdx = chooseItems[k];
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
    if (btnIndex == -1) {
      return "请先选中关联设备的物资";
    } else if (linkMap[btnIndex].length == 1) {
      return "ok";
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
    $("#countIpt").val(countVal);
  });
  // 显示物资重量
  $("#weightInfo").text("");

  // 单个出库
  function singleOutStorage(currentObj, currentTd, cnt, weight, idx, max) {
    return new Promise((resolve, reject) => {
      if (idx == 0) loading("批量出库中，请耐心等待...");
      // if (idx == max) userChooseBtnIdx = -1;
      request("/lockTd", {
        tdNo: currentTd
      })
        .then(resp => {
          console.log(resp);
          if (resp.status == 0) {
            console.log("锁库成功");
            request("/outStorage", {
              oconsignBillcode: currentObj.oconsignBillcode,
              oconsignBillbatch: currentObj.oconsignBillbatch,
              goodsNum: cnt,
              goodsWeight: weight
            })
              .then(res => {
                console.log(res);
                if (res.status == 0) {
                  if (res.message.startsWith("[待审核]")) {
                    // var result = window.confirm(`此条物资需要审核确认\n 出库重量:${w}\n 出库数量:${cnt}`)
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
                        outStorageSuccess(currentObj, true);
                        reject();
                      }
                    });
                  } else {
                    if (idx == max) hideLoad();
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
                showMsg(res.message || "网络异常");
                request("/unlockTd", {
                  tdNo: currentTd
                });
                showMsg(e);
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
    // if (idx == 0) loading("批量出库中，请耐心等待...");
    // // if (idx == max) userChooseBtnIdx = -1;
    // request("/lockTd", {
    //   tdNo: currentTd
    // })
    //   .then(resp => {
    //     console.log(resp);
    //     if (resp.status == 0) {
    //       console.log("锁库成功");
    //       request("/outStorage", {
    //         oconsignBillcode: currentObj.oconsignBillcode,
    //         oconsignBillbatch: currentObj.oconsignBillbatch,
    //         goodsNum: cnt,
    //         goodsWeight: weight
    //       })
    //         .then(res => {
    //           console.log(res);
    //           if (res.status == 0) {
    //             if (res.message.startsWith("[待审核]")) {
    //               // var result = window.confirm(`此条物资需要审核确认\n 出库重量:${w}\n 出库数量:${cnt}`)
    //               hideLoad();
    //               $("body").append(
    //                 modalTemp({
    //                   modalId: "modal" + currentObj.oconsignBillbatch,
    //                   modalTitle: `提单号:${
    //                     currentObj.sbillBillcode
    //                   }中此条物资需要审核确认\n 出库重量:${weight}\n 出库数量:${cnt}`
    //                 })
    //               );
    //               setTimeout(function() {
    //                 showModal("#modal" + currentObj.oconsignBillbatch, function(
    //                   result
    //                 ) {
    //                   if (result) {
    //                     var outstorageNo = res.message.split("|")[1];
    //                     request("/outStorageAudit", {
    //                       billCode: outstorageNo,
    //                       status: 1,
    //                       remark: "吊秤审核"
    //                     })
    //                       .then(rp => {
    //                         if (rp.status == 0) {
    //                           outStorageSuccess(currentObj);
    //                         } else {
    //                           showMsg(rp.message);
    //                           request("/unlockTd", {
    //                             tdNo: currentTd
    //                           });
    //                         }
    //                       })
    //                       .catch(e => {
    //                         console.log(e);
    //                         request("/unlockTd", {
    //                           tdNo: currentTd
    //                         });
    //                         if (idx == max) hideLoad();
    //                         showMsg(e);
    //                       });
    //                   } else {
    //                     if (idx == max) hideLoad();
    //                     outStorageSuccess(currentObj, true);
    //                   }
    //                 });
    //               }, 300);
    //             } else {
    //               if (idx == max) hideLoad();
    //               outStorageSuccess(currentObj);
    //             }
    //           } else if (res.status == -2) {
    //             if (idx == max) hideLoad();
    //             showMsg("账户已禁用");
    //             request("/unlockTd", {
    //               tdNo: currentTd
    //             });
    //           } else {
    //             if (idx == max) hideLoad();
    //             showMsg(res.message || "网络异常");
    //             request("/unlockTd", {
    //               tdNo: currentTd
    //             });
    //           }
    //         })
    //         .catch(e => {
    //           console.log(e);
    //           if (idx == max) hideLoad();
    //           showMsg(res.message || "网络异常");
    //           request("/unlockTd", {
    //             tdNo: currentTd
    //           });
    //           showMsg(e);
    //         });
    //     } else if (resp.status == -2) {
    //       if (idx == max) hideLoad();
    //       showMsg("账户已禁用");
    //     } else {
    //       if (idx == max) hideLoad();
    //       showMsg(resp.message || "网络异常");
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     if (idx == max) hideLoad();
    //     showMsg(err);
    //   });
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
    console.log(cnt);
    console.log("currentUserChooseBtn", userChooseBtnIdx);
    if (Number(w) <= 0) {
      showMsg("重量必须大于0");
      return;
    }
    if (userChooseBtnIdx == -1) {
      if (selectRowIndex == -1) {
        showMsg("请选择出库的物资");
        return;
      }
      var selectObj = tableList[selectRowIndex];
      if (
        (selectObj.goodsMetering == "理计" && selectObj.dataAwedit == 0) ||
        selectObj.mtype == 0
      ) {
      } else {
        showMsg("请选择出库的磅秤");
        return;
      }
    }
    // 批量出库
    if (userChooseBtnIdx > -1) {
      let detailIdx = linkMap[userChooseBtnIdx];
      if (detailIdx.length > 1) {
        console.log("batch outstorage");
        let arr = detailIdx.map(itm => tableList[itm])
        let cnt = tableList[selectRowIndex]
        let idx = arr.filter(itm => itm.sbillBillbatch == cnt.sbillBillbatch)
        if (idx >= 0) {
          batchWeight(0, detailIdx, w, cnt);
        } else {
          let currentObj = tableList[selectRowIndex];
          let currentTd = currentObj.sbillBillcode;
          singleOutStorage(currentObj, currentTd, cnt, w, 0, 0);
        }
        // detailIdx.map((index, idx) => {
        //   let currentObj = tableList[index];
        //   let currentTd = currentObj.sbillBillcode;
        //   let currentCnt = Number(
        //     currentObj.goodsNum - currentObj.oconsignDetailOknum
        //   );
        //   console.log("currentCnt:>>", currentCnt, "; w:>>", w, ";cnt:>>", cnt);
        //   let currentWeight = getFixWeight(
        //     Number((Number(w) / Number(cnt)) * currentCnt).toFixed(4)
        //   );
        //   console.log("idx:>>", idx, ";currentWeight:>>", currentWeight);
        //   singleOutStorage(
        //     currentObj,
        //     currentTd,
        //     currentCnt,
        //     currentWeight,
        //     idx,
        //     detailIdx.length - 1
        //   );
        // });
      } else {
        console.log("single bang outstorage");
        let currentObj = tableList[detailIdx[0]];
        if (detailIdx.length == 0) currentObj = tableList[selectRowIndex]
        let selectObj = tableList[selectRowIndex]
        if (selectObj.sbillBillbatch != currentObj.sbillBillbatch) currentObj = tableList[selectRowIndex]
        let currentTd = currentObj.sbillBillcode;
        singleOutStorage(currentObj, currentTd, cnt, w, 0, 0);
      }
    } else {
      let currentObj = tableList[selectRowIndex];
      let currentTd = currentObj.sbillBillcode;
      singleOutStorage(currentObj, currentTd, cnt, w, 0, 0);
    }
  });
  let plankWeightArr = []
  function batchWeight(idx, detailArray, w, cnt) {
    let currentObj = tableList[detailArray[idx]];
    let currentTd = currentObj.sbillBillcode;
    let currentCnt = Number(
      currentObj.goodsNum - currentObj.oconsignDetailOknum
    );
    // if (idx == 0) plankWeightArr = []
    let currentWeight = getFixWeight(
      Number((Number(w) / Number(cnt)) * currentCnt).toFixed(4)
    );
    let tempWeight = 0
    let tempWstr = ''
    if (currentObj.pntreeName == '板材' && (idx < detailArray.length - 1)) {
      if (currentObj.partsnameName == '花纹板') {
        tempWeight = (((Number(currentObj.goodsSpec1) + 0.3) * 7.85) / 1000) * (Number(currentObj.goodsSpec2) / 1000) * Number(currentObj.goodsProperty1) * currentCnt
        tempWstr = tempWeight.toFixed(4)
        currentWeight = getFixWeight(tempWstr)
        plankWeightArr.push(currentWeight)
      } else {
        tempWeight = (Number(currentObj.goodsSpec1) * 7.85 / 1000) * (Number(currentObj.goodsSpec2) / 1000) * Number(currentObj.goodsProperty1) * currentCnt
        tempWstr = tempWeight.toFixed(4)
        currentWeight = getFixWeight(tempWstr)
        plankWeightArr.push(currentWeight)
      }
    } else if (currentObj.pntreeName == '板材' && (idx == detailArray.length - 1)) {
      let t = 0
      if (plankWeightArr.length > 0) {
        plankWeightArr.map(itm => {
          t += Number(itm)
        })
      }
      tempWeight = Number(w) - t 
      if (tempWeight < 0) tempWeight = 0.001
      currentWeight = tempWeight.toFixed(3)
    }
    console.log('outstorage idx:>>', idx, ';plankWeightArr:>>', plankWeightArr, ';currentWeight:>>', currentWeight)
    singleOutStorage(
      currentObj,
      currentTd,
      currentCnt,
      currentWeight,
      idx,
      detailArray.length - 1
    ).then(
      res => {
        console.log("currentIndx:>>", res);
        if (res.currentIdx < res.arr.length && userChooseBtnIdx > -1)
          batchWeight(res.currentIdx, res.arr, w, cnt);
      },
      () => {
        console.error("暂停");
      }
    );
  }

  // 退出按钮
  $(".main-close").click(() => {
    logout();
    window.location.href = "/login";
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
      let selectArray = linkMap[btnIdx];
      selectArray = selectArray.filter(itm => itm != rowIdx);
      linkMap[btnIdx] = selectArray;
      console.log("after unbind crane btn:>>", linkMap[btnIdx]);
      $(this).remove();
      if (selectArray.length == 0) {
        $(".weight-btn")
          .eq(btnIdx)
          .css("background-image", 'url("/img/dl.png")');
      }
    });
  }
  function outStorageSuccess(currentObj, manAudit = false, cb) {
    // debugger
    let uniqueCode = currentObj.sbillBillbatch;
    console.log("uniqueCode:>>>" + uniqueCode);
    console.log(linkMap);
    var tableIndex = tableList.findIndex(
      itm => itm.sbillBillbatch == uniqueCode
    );
    let otherSelectRowObj = {};
    Object.keys(linkMap).map(itm => {
      if (linkMap[itm].length >= 0) {
        var arr = linkMap[itm];
        arr.map(item => {
          if (item != tableIndex) {
            otherSelectRowObj[tableList[item]["sbillBillbatch"]] = itm;
          }
        });
      }
    });
    // console.log("weightBtnIdx:>>>" + weightBtnIdx);
    // linkMap[weightBtnIdx] = -1;
    if (userChooseBtnIdx > -1) {
      var currentWeightArr = linkMap[userChooseBtnIdx];
      currentWeightArr = currentWeightArr.filter(itm => itm != tableIndex);
      linkMap[userChooseBtnIdx] = currentWeightArr;
    }
    $(".crane-btn").unbind();
    tableList = tableList.filter(itm => itm.sbillBillbatch != uniqueCode);
    selectRowIndex = -1;
    resetLinkmap();
    updateTableData(tableList);
    Object.keys(otherSelectRowObj).map(k => {
      let idx = tableList.findIndex(itm => itm.sbillBillbatch == k);
      let btnIdx = otherSelectRowObj[k];
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
            '"><span>' +
            craneNames[btnIdx] +
            "</span></div>"
        );
      bindCraneBtn(idx);
    });
    initActiveRect(selectRowIndex);
    $("#countIpt").val("");
    $("#weightInfo").text("");
    if (userChooseBtnIdx > -1) {
      $(".weight-btn")
        .eq(userChooseBtnIdx)
        .css("background-image", "url(/img/dl.png)");
      dwt[userChooseBtnIdx] = 0;
      $(".weight-btn")
        .eq(userChooseBtnIdx)
        .find("span")
        .eq(0)
        .text(dwt[userChooseBtnIdx]);
      if (linkMap[userChooseBtnIdx].length == 0) userChooseBtnIdx = -1;
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
      let cnt = Number(selectObj.goodsNum - selectObj.oconsignDetailOknum);
      if (
        (selectObj.goodsMetering == "理计" && selectObj.dataAwedit == 0) ||
        selectObj.mtype == 0
      ) {
        $("#countIpt").val(cnt);
        let weight = formatWeight(
          Number(cnt * selectObj.goodsProperty1 * selectObj.goodsProperty2)
        );
        if (selectObj.mtype == 0) weight = selectObj.goodsWeight;
        $("#weightInfo").text(weight);
      } else {
        $("#countIpt").val(cnt);
        $("#weightInfo").text("");
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
          Object.keys(linkMap).map(k => {
            // let index = linkMap[k].findIndex(itm => itm == rowidx)
            linkMap[k].map(idx => {
              if (idx == rowidx) {
                btnIndx = k;
              } else {
                otherSelectRowObj[tableList[idx]["sbillBillbatch"]] = k;
              }
            });
          });
          selectRowIndex = -1;
          $(".crane-btn").unbind();
          tableList = tableList.filter(
            itm => itm["sbillBillbatch"] != currentTD
          );
          updateTableData(tableList);
          resetLinkmap();
          Object.keys(otherSelectRowObj).map(k => {
            let idx = tableList.findIndex(itm => itm.sbillBillbatch == k);
            let btnIdx = otherSelectRowObj[k];
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
            bindCraneBtn(idx);
          });
          console.log("del linkMap btnidx", btnIndx, linkMap[btnIndx]);
          if (btnIndx >= 0 && linkMap[btnIndx].length == 0)
            $(".weight-btn")
              .eq(btnIndx)
              .css("background-image", "url(/img/dl.png)");
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
    $("#countIpt").val(count);
  }
});

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
