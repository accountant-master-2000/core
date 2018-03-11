const path = require('path')
const livereload = require('livereload')

const connect = require('connect')
const stat = require('serve-static')

const lrserver = livereload.createServer()
const compiled = path.join(__dirname, 'docs')

lrserver.watch(compiled)

const server = connect()
server.use(stat(compiled))

server.listen(666)
