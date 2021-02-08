/**
 * 全局变量
 */
// 全局
var globalTimeout = null

// 全局聚焦dom
var globalFocusDom = ''

/**
 * 全局变量配置
 */
var globalConfig = {
  // 吊秤配置
  crane: {
    // 吊秤数组重量
    tableList: [],
    // 用户选择当前行数
    selectRowIndex: -1,
    // 测试仓库名对应的操作员编码
    wnameMap: {
      '110': ['01', '02', '03', '04', '05', '06', '07'],
      '02': ['01', '02', '03', '04', '05'],
      '03': ['01', '02', '03', '04', '05', '06', '07'],
      '04': ['01', '02', '03', '04', '05', '06', '07'],
      '05': ['01', '02', '03', '04', '05'],
      '06': ['01', '02', '03', '04'],
      '07': ['01', '02', '03', '04'],
      '08': ['01', '02', '03', '04', '05', '06', '07'],
      '10': ['01', '02', '03', '04', '05', '06', '07'],
      '11': ['01', '02', '03', '04'],
      '12': ['01', '02', '03', '04', '05', '06', '07']
    },
    // 吊秤的标号
    craneNames: ['A1', 'A2', 'A3', 'A4'],
    // 吊秤选择操作员
    wnameCheckArr: [],
    // 单个出库物资记录数量
    singleGoodsCount: {},
    // 单个磅计物资出库是否可改数量以及分批称重数量
    dwtCounts: {
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
    },
    // 提单号
    tdNo: '',
    // 吊秤出/入库数量
    countVal: 1,
    // FIXME: 强制选择车牌号
    forceSelectCarNo: false,
    // 原产地数组
    globalOriginPlaceArr: [],
    // 车牌号
    globalShowCarNo: '',
    // 吊秤初始状态
    dwt: [0, 0, 0, 0],
    // 磅秤数组下标和物资数组下标相对应
    linkMap: {
      0: [],
      1: [],
      2: [],
      3: []
    },
    // 吊秤表头
    trKeys: [
      'businessTypeNo',
      'productBrandName',
      'specification',
      'length',
      'prodAreaName',
      'productTextureName',
      'usableAmount',
      // 公差 goodsProperty5 重量 goodsProperty4
      'toleranceRange',
      // 其他 车牌号
      'other'
    ]
  }
}
