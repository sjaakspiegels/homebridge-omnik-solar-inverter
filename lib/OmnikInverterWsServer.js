'use strict'

const homebridgeLib = require('homebridge-lib')
const EventEmitter = require('events')
const WebSocket = require('ws')

class OmnikInverterWsServer extends EventEmitter {
  constructor (omnikInverterClient, options = {}) {
    super()
    this._options = {
      port: 8089
    }
    const optionParser = new homebridgeLib.OptionParser(this._options)
    optionParser.intKey('port', 1024, 65535)
    optionParser.parse(options)

    this.jsonFormatter = new homebridgeLib.JsonFormatter({
      noWhiteSpace: true
    })

    omnikInverterClient
      .on('data', (data) => { this.onEvent('data', data) })

    this.clients = {}
    this.server = new WebSocket.Server(this._options)
    this.server
      .on('listening', () => {
        this.emit('listening', this._options.port)
      })
      .on('connection', (ws, req) => {
        const socket = req.connection
        const id = socket.remoteAddress + ':' + socket.remotePort
        const path = req.url.slice(1)
        if (!['data'].includes(path)) {
          socket.destroy()
          this.emit(
            'warning', `${id}: web socket connection for invalid path ${path}`
          )
          return
        }
        this.emit('connect', id, path)
        this.clients[id] = { path: path, ws: ws }
        ws.on('close', () => {
          socket.destroy()
          delete this.clients[id]
          this.emit('disconnect', id, path)
        })
      })
  }

  onEvent (path, data) {
    const message = this.jsonFormatter.stringify(data)
    for (const id in this.clients) {
      const client = this.clients[id]
      if (client.path === path && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message)
      }
    }
  }

  disconnect () {
    this.server.close()
    this.server.removeAllListeners()
    this.emit('close', this._options.port)
  }
}

module.exports = OmnikInverterWsServer
