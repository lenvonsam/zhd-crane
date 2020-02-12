const httpHelp = require('../utils/http')
// const PROXYURL = 'http://192.168.80.99:8080/warehouse-dev/warehouse'
const PROXYURL = 'http://192.168.80.102:8686/warehouse/warehouse'
// const PROXYURL = 'http://localhost:7568/warehouse'

module.exports = {
  async logout (ctx) {
    await ctx.cookies.set('currentUser', null)
    ctx.body = {
      status: 0
    }
  },
  async warehouseName (ctx) {
    let val = ctx.cookies.get('currentUser') || null
    if (val) {
      let arr = val.split('|')
      ctx.body = {
        wname: arr[1]
      }
    } else {
      await ctx.render("login", {
        pageTitle: "型云吊秤登录",
        loginType: 1
      })
    }
  },
  async proxy(ctx) {
    const body = ctx.request.body
    let params = Object.assign({}, body.params)
    let user = ctx.cookies.get('currentUser')
    console.log('user', user)
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
    if (body.url == '/outStorage' || body.url == '/outStorageAudit' || body.url == '/outStorageQuery') {
      if (userArr && userArr.length == 3) {
        params.userId = userArr[1]
        if (body.url == '/outStorageQuery') {
          params.superWarehousemanFlag = userArr[2]
          params.memberCode = userArr[0]
        }
      } else {
        ctx.body = {
          status: -2,
          message: '用户过期'
        }
        return
      }
    }
    // if (body.url == '/outStorageAudit') {
    //   if (userArr && userArr.length == 3) {
    //     params.userId = userArr[1]
    //   } else {
    //     ctx.body = {
    //       status: -2,
    //       message: '用户过期'
    //     }
    //     return
    //   }
    // }
    console.log('warehouse proxy:>>>\n', params)
    let data = body.method === 'get' ? (await httpHelp.httpGet(PROXYURL + body.url, params)) : (await httpHelp.httpPost(PROXYURL + body.url, params))
    console.log('warehouse proxy resp:>>\n', data)
    if (body.url == '/login') {
      if (data.status == 0 && data.data != null) {
        // let str = JSON.stringify(data.data)
        // console.log('cookie 保存', data.data)
        await ctx.cookies.set('currentUser', `${data.data.memberCode}|${data.data.operatorUserid}|${data.data.superWarehousemanFlag}`, {
          domain: '192.168.80.202',
          maxAge: 10 * 60 * 60 * 1000,
          httpOnly: false
        })
      }
    }
    ctx.body = data
  }
}