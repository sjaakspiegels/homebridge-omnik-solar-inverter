'use strict'

const homebridgeLib = require('homebridge-lib')
const EventEmitter = require('events')
const fetch = require('node-fetch')

class OmnikInverterClient extends EventEmitter {
  constructor (options = {}, log) {
    super()
    const optionParser = new homebridgeLib.OptionParser(this._options)
    optionParser.stringKey('ipAddress')
    optionParser.intKey('timeout', 5, 120)
    optionParser.parse(options)
    this.ipAddress = options.ipAddress
    this.connected = false
  }

  async connect () {
    try {
      setInterval(() => { this.parseData() }, 2000)
      this.connected = true
    } catch (error) {
      console.error(formatError(error))
      this.connected = false
      setTimeout(async () => {
        await connect()
      }, 10000)
    }
  }

  close() {
  }

  parseData () {
    this.webRequest()
      .then(data => { this.emit('data', data) })
  }

  webRequest () {
    return fetch('http://' + this.ipAddress + '/js/status.js')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.text()
      })
      .then(function (myText) {
        const myRegexp = /(myDeviceArray\[0\]=")(.*)(";)/g
        const match = myRegexp.exec(myText)
        const items = match[2].split(',')
        const result = {}
        result.id = items[0]
        result.current = items[5] 
        result.today = items[6] / 100
        result.total = items[7] / 10
        return result
      })
      .catch(function (error) {
        console.log('Error: ' + error)
      })
  }
}

module.exports = OmnikInverterClient
