const router = require('koa-router')()
const api = require('../controllers/homeCtrl')

const routes = router
  .get('', api.home)
  .get('login', api.loginPage)
  .get('menu', api.menuPage)
  .get('outedQuery', api.outedQueryPage)

module.exports = routes
