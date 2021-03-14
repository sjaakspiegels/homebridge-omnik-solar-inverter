'use strict'

const homebridgeLib = require('homebridge-lib')
const EventEmitter = require('events')
const WebSocket = require('ws')

class OmnikInverterWsClient extends EventEmitter {
  constructor (options) {
    super()
    this._options = {
      hostname: '127.0.0.1',
      port: 8088,
      timeout: 5
    }
    throw new Error('Geen wsClient')
    const optionParser = new homebridgeLib.OptionParser(this._options)
    optionParser.hostKey()
    optionParser.intKey('timeout', 5, 120)
    optionParser.parse(options)
    this._ws = {}
    this._timeout = {}
  }

  async connect (path) {
    const url = 'ws://' + this._options.hostname + ':' + this._options.port +
      '/' + path
    const ws = new WebSocket(url)
    this._ws[path] = ws
    ws
      .on('open', () => {
        this.emit('connect', url)
        this._setTimeout(path)
      })
      .on('close', () => {
        if (this._timeout[path] != null) {
          clearTimeout(this._timeout[path])
        }
        ws.removeAllListeners()
        delete this._ws[path]
        this.emit('disconnect', url)
      })
      .on('message', (message) => {
        this._setTimeout(path)
        if (path !== 'telegram') {
          try {
            message = JSON.parse(message)
          } catch (error) {
            this.emit('error', error)
          }
        }
        this.emit(path, message)
      })
      .on('error', (error) => { this.emit('error', error) })
  }

  isConnected (path) {
    return this._ws[path] != null
  }

  _setTimeout (path) {
    if (this._timeout[path] != null) {
      clearTimeout(this._timeout[path])
    }
    this._timeout[path] = setTimeout(() => {
      this.emit('error', new Error(
        `no data recevied in ${this._options.timeout} seconds`
      ))
      this._ws[path].terminate()
      // this.disconnect(path)
    }, this._options.timeout * 1000)
  }

  disconnect (path) {
    if (this._ws[path] != null) {
      this._ws[path].close()
    }
  }
}

module.exports = OmnikInverterWsClient
