const httpHelp = require('../utils/http')
const PROXYURL = 'http://192.168.80.99:8080/warehouse-dev/warehouse'

module.exports = {
  async logout (ctx) {
    await ctx.cookies.set('currentUser', null)
    ctx.body = {
      status: 0
    }
  },
  async proxy(ctx) {
    const body = ctx.request.body
    console.log('warehouse proxy:>>>\n', body)
    let params = Object.assign({}, body.params)
    let user = ctx.cookies.get('currentUser')
    let userArr = user ? user.split('|') : []
    if (body.url == '/outWaitStorageQuery') {
      if (userArr && userArr.length == 3) {
        params.currentPage = 1
        params.pageSize = 100
        params.memberCode = userArr[0]
        params.warehouseCode = ''
        params.superWarehousemanFlag = userArr[2]
        params.userId = userArr[1]
      } else {
        ctx.body = {
          status: -2,
          message: '用户过期'
        }
        return
      }
    }
    if (body.url == '/outStorage') {
      if (userArr && userArr.length == 3) {
        params.userId = userArr[1]
      } else {
        ctx.body = {
          status: -2,
          message: '用户过期'
        }
        return
      }
    }
    if (body.url == '/outStorageAudit') {
      if (userArr && userArr.length == 3) {
        params.userId = userArr[1]
      } else {
        ctx.body = {
          status: -2,
          message: '用户过期'
        }
        return
      }
    }
    let data = body.method === 'get' ? (await httpHelp.httpGet(PROXYURL + body.url, params)) : (await httpHelp.httpPost(PROXYURL + body.url, params))
    console.log('warehouse proxy resp:>>\n', data)
    if (body.url == '/login') {
      if (data.status == 0 && data.data != null) {
        // let str = JSON.stringify(data.data)
        // console.log('cookie 保存', data.data)
        await ctx.cookies.set('currentUser', `${data.data.memberCode}|${data.data.operatorUserid}|${data.data.superWarehousemanFlag}`, {
          domain: '192.168.80.200',
          maxAge: 5 * 60 * 60 * 1000,
          httpOnly: false
        })
      }
    }
    ctx.body = data
  }
}