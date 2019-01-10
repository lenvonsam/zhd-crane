module.exports = {
  async home(ctx) {
    let user = ctx.cookies.get("currentUser");
    // console.log('user', user)
    if (user) {
      await ctx.render("index", {
        pageTitle: "型云吊秤首页",
        pageBrand: "型云吊秤"
      });
    } else {
      await ctx.render("login", {
        pageTitle: "型云吊秤登录",
        loginType: 1
      });
    }
  },
  async loginPage(ctx) {
    let type = ctx.query.type || 0;
    // console.log('loginType:>>' + type)
    await ctx.render("login", {
      pageTitle: "型云吊秤登录",
      loginType: type
    });
  },
  async menuPage(ctx) {
    let user = ctx.cookies.get("currentUser");
    if (user) {
      await ctx.render("menu", {
        pageTitle: "型云吊秤主菜单"
      });
    } else {
      await ctx.render("login", {
        pageTitle: "型云吊秤登录",
        loginType: 1
      });
    }
  },
  async outedQueryPage(ctx) {
    let user = ctx.cookies.get("currentUser");
    if (user) {
      await ctx.render("outedQuery", {
        pageTitle: "吊秤已出库物资查询",
        pageBrand: "型云吊秤"
      });
    } else {
      await ctx.render("login", {
        pageTitle: "型云吊秤登录",
        loginType: 1
      });
    }
  }
};
