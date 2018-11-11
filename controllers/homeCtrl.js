module.exports = {
  async home(ctx) {
    let user = ctx.cookies.get('currentUser')
    // console.log('user', user)
    if (user) {
      await ctx.render('index', {
        pageTitle: '型云吊称首页',
        pageBrand: '型云吊称'
      })
    } else {
      await ctx.render('login', {
        pageTitle: '型云吊称登录',
        loginType: 1
      })
    }
  },
  async loginPage(ctx) {
    let type = ctx.query.type || 0
    // console.log('loginType:>>' + type)
    await ctx.render('login', {
      pageTitle: '型云吊称登录',
      loginType: type
    })
  }
}