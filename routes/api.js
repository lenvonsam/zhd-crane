const router = require('koa-router')()
const api = require('../controllers/apiCtrl')
const routes = router
  .post('/proxy', api.proxy)
  .post('/logout', api.logout)

module.exports = routes