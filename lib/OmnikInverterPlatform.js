'use strict'

const homebridgeLib = require('homebridge-lib')
const OmnikInverterAccessory = require('./OmnikInverterAccessory')
const OmnikInverterClient = require('./OmnikInverterClient')
const OmnikInverterWsServer = require('./OmnikInverterWsServer')

class OmnikInverterPlatform extends homebridgeLib.Platform {
  constructor (log, configJson, homebridge) {
    super(log, configJson, homebridge)
    this.heartbeatEnabled = true
    this
      .on('heartbeat', (beat) => { this.onHeartbeat(beat) })
      .on('shutdown', () => { this.onShutdown() })

    this.config = {
      port: 8089,
      timeout: 5
    }
    const optionParser = new homebridgeLib.OptionParser(this.config, true)
    optionParser
      .on('userInputError', (message) => {
        this.warn('config.json: %s', message)
      })
      .stringKey('name')
      .stringKey('platform')
      .hostKey()
      .stringKey('ipAddress')
      .intKey('timeout', 5, 120)
      .intKey('wsPort', 1024, 65535)
    try {
      optionParser.parse(configJson)
      this.debug('config: %j', this.config)
      const params = {
        timeout: this.config.timeout,
        ipAddress: this.config.ipAddress
      }
      this.omnikInverterClient = new OmnikInverterClient(params, log)
      this.connectOmnikInverterClient = -1
      this.omnikInverterClient
        .on('open', (port) => { this.log('connected to %s', port) })
        .on('close', (port) => {
          this.connectOmnikInverterClient = this.beat + 60
          this.log('disconnected from %s', port)
        })
        .on('error', (error) => { this.warn(error) })
        .on('warning', (message) => { this.warn(message) })
        .on('data', (data) => {this.onData(data) })

      if (this.config.wsPort != null) {
        this.server = new OmnikInverterWsServer(this.omnikInverterClient, { port: this.config.wsPort })
        this.connectServer = -1
        this.server
          .on('server: listening', (port) => {
            this.log('listening on port %d', port)
          })
          .on('close', (port) => {
            this.log('server: disconnected from port %d', port)
          })
          .on('connect', (host, path) => {
            this.log('server: %s connected to %s', host, path)
          })
          .on('disconnect', (host, path) => {
            this.connectServer = this.beat + 60
            this.log('server: %s disconnected from %s', host, path)
          })
          .on('warning', (message) => {
            this.warn('server: %s', message)
          })
          .on('error', (error) => {
            this.warn('server: %s', error)
          })
      }
    } catch (error) {
      this.fatal(error)
    }
  }

  onHeartbeat (beat) {
    this.beat = beat
    if (this.omnikInverterClient != null && !this.omnikInverterClient.connected && beat > this.connectOmnikInverterClient) {
      delete this.connectOmnikInverterClient
      this.omnikInverterClient.connect().catch((error) => {
        this.connectOmnikInverterClient = beat + 60
        this.warn(error)
      })
    }
  }

  onData (data) {
    if (this.electricity == null) {
      this.debug('data: %j', data)
      this.log('%s v%s', data.type, data.version)
      this.electricity = new OmnikInverterAccessory.Electricity(this, data)
      this.debug('initialised')
      this.emit('initialised')
    } else {
      this.vdebug('data: %j', data)
      this.electricity.check(data)
    }
  }

  onShutdown () {
    if (this.omnikInverterClient != null) {
      this.omnikInverterClient.close()
    }
    if (this.server != null) {
      this.server.disconnect()
    }
  }

  get logLevel () {
    return this.electricity == null ? 2 : this.electricity.logLevel
  }
}

module.exports = OmnikInverterPlatform
