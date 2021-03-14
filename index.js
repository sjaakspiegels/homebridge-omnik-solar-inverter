'use strict'

const OmnikInverterPlatform = require('./lib/OmnikInverterPlatform')
const packageJson = require('./package.json')

module.exports = function (homebridge) {
  OmnikInverterPlatform.loadPlatform(homebridge, packageJson, 'Omnik Inverter', OmnikInverterPlatform)
}
