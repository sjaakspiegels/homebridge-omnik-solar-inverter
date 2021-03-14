'use strict'

const homebridgeLib = require('homebridge-lib')
const OmnikInverterClient = require('../lib/OmnikInverterClient')
const OmnikInverterWsServer = require('../lib/OmnikInverterWsServer')

let inverter

const formatError = homebridgeLib.OptionParser.formatError

async function connect () {
  console.log('call connect')
  try {
    setInterval(() => { inverter.parseData() }, 2000)
  } catch (error) {
    console.error(formatError(error))
    setTimeout(async () => {
      await connect()
    }, 10000)
  }
}

async function main () {
  inverter = new OmnikInverterClient({ ipAddress: '10.0.0.19' })
  inverter.on('error', (error) => {
    console.error(formatError(error))
  })
  inverter.on('data', (data) => { console.log('data:', data) })
  inverter.on('warning', (message) => { console.log('warning: %s', message) })
  inverter.on('close', () => {
    console.log('connection closed')
    setTimeout(async () => {
      await connect()
    }, 10000)
  })
  const server = new OmnikInverterWsServer(inverter)
  server.on('listening', (port) => { console.log('listening on port %d', port) })
  server.on('connect', (host, path) => { console.log('%s: %s client connected', host, path) })
  server.on('disconnect', (host, path) => { console.log('%s: %s client disconnected', host, path) })
  server.on('warning', (message) => { console.log('warning: %s', message) })
  await connect()
}

main()
