const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const app = new Koa()
const http = require('http')
const server = http.createServer(app.callback())
const io = require('socket.io')(server)
const net = require('net')

// 中间件
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const static = require('koa-static')
const views = require('koa-views')
const jsonp = require('koa-jsonp')
const STATICPATH = './static'
const VIEWPATH = './views'
const routers = require('./routes/index')
const commHelp = require('./utils/common')


app.use(static(path.join(__dirname, STATICPATH)))
app.use(views(path.join(__dirname, VIEWPATH), {
  extension: 'pug'
}))

app.use(bodyParser())
app.use(jsonp())
app.use(logger())

const router = new Router()

router.get('/socket', async (ctx) => {
  let count = Number(ctx.query.weight)
  count++
  console.log('count:>>' + count)
  io.emit('factWeight', count, 1)
  ctx.body = count
})
app.use(router.routes())
app.use(routers.routes()).use(routers.allowedMethods())

server.listen(3000, () => {
  console.log('[zhd-crane] start-quick is starting at port 3000')
})

io.on('connection', function(socket) {
  console.log('[zhd-crane] socket io connect successful')
})

const socketPorts = [3001, 3002, 3003, 3004]

function socketHandler(socket, port, portIdx) {
  console.log(`socket port:>>${port}`)
  socket.setEncoding('utf8')
  try {
    socket.on('data', data => {
      const origin = data.toString()
      console.log(`device port: [${port}] origin data:>>${origin}`)
      // const bytes = commHelp.hexstring2btye(origin)
      // console.log(bytes)
      // const decodeStr = commHelp.decodeCraneHexstring(bytes)
      // console.log(`device port: [${port}] decode data:>>${decodeStr}`)
      const decodeStr = origin
      io.emit('factWeight', decodeStr, portIdx)
      socket.write(`device port: [${port}] has received data`)
    })
    socket.on('end', () => {
      console.log(`soket port: [${port}] ended`)
    })
  } catch (e) {
    console.error('occur error', e)
    return socket.end()
  }
}

socketPorts.map((itm, idx) => {
  net.createServer(skt => {
    socketHandler(skt, itm, idx)
  }).listen(itm, () => {
    console.log('[zhd-crane] socket-server is starting at port ' + itm)
  })
})