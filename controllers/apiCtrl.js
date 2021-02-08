const httpHelp = require('../utils/http')
// const PROXYURL = 'http://192.168.80.99:8080/warehouse-dev/warehouse'
// const PROXYURL = 'http://127.0.0.1:8008/api/'
const PROXYURL = 'http://aliscp-pro.aliyun.xingyun361.com:8008/api/'
// const PROXYURL = 'http://localhost:7568/warehouse'

module.exports = {
  async logout(ctx) {
    await ctx.cookies.set('currentUser', null)
    ctx.body = {
      status: 0
    }
  },
  async warehouseName(ctx) {
    let val = ctx.cookies.get('currentUser') || null
    if (val) {
      let arr = val.split('|')
      ctx.body = {
        wname: arr[3]
      }
    } else {
      await ctx.render('login', {
        pageTitle: '型云吊秤登录',
        loginType: 1
      })
    }
  },
  async proxy(ctx) {
    const body = ctx.request.body
    let params = Object.assign({}, body.params)
    let user = ctx.cookies.get('currentUser')
    console.log('user', user)
    console.log('url:>>', body.url)
    console.log('method:>>', body.method)
    let userArr = user ? user.split('|') : []
    if (body.url == 'crane/dc/outStorage' && body.method == 'get') {
      if (userArr && userArr.length == 4) {
        params.warehouseId = userArr[0]
        params.stockRoomId = userArr[1]
        params.stockZoneId = userArr[2]
      } else {
        ctx.body = {
          status: -2,
          message: '用户过期'
        }
        return
      }
    }
    if (
      body.url == '/outStorage' ||
      body.url == '/outStorageAudit' ||
      body.url == '/outStorageQuery'
    ) {
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
    let data =
      body.method === 'get'
        ? await httpHelp.httpGet(PROXYURL + body.url, params)
        : await httpHelp.httpPost(PROXYURL + body.url, params)
    console.log('warehouse proxy resp:>>\n', data)
    if (body.url == '/base/user/login') {
      if (data.success) {
        let userData = await httpHelp.httpGet(
          PROXYURL + 'crane/dc/warehouse/' + params.username + '/userInfo'
        )
        console.log('userData:>>', userData)
        if (userData.success) {
          // let str = JSON.stringify(data.data)
          // console.log('cookie 保存', data.data)
          await ctx.cookies.set(
            'currentUser',
            `${userData.data.warehouseId}|${userData.data.stockRoomId}|${userData.data.stockZoneId}|${params.username}`,
            {
              domain: '192.168.80.91',
              maxAge: 13 * 60 * 60 * 1000,
              httpOnly: false
            }
          )
        }
      }
    }
    ctx.body = data
  }
}
