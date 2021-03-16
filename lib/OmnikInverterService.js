'use strict'

const homebridgeLib = require('homebridge-lib')

class OmnikInverterService extends homebridgeLib.ServiceDelegate {
  constructor (omnikInverterAccessory, data) {
    const params = {
      name: omnikInverterAccessory.name,
      Service: omnikInverterAccessory.Services.my.Resource
    }
    super(omnikInverterAccessory, params)
  }

  static get Electricity () { return Electricity }
}

class Electricity extends OmnikInverterService {
  constructor (omnikInverterAccessory, data) {
    super(omnikInverterAccessory, data)
    this.addCharacteristicDelegate({
      key: 'consumption',
      Characteristic: this.Characteristics.eve.TotalConsumption
    })
    this.addCharacteristicDelegate({
      key: 'power',
      Characteristic: this.Characteristics.eve.CurrentConsumption
    })
    this.addCharacteristicDelegate({
      key: 'lastUpdated',
      Characteristic: this.Characteristics.my.LastUpdated,
      silent: true
    })
    this.addCharacteristicDelegate({
      key: 'logLevel',
      Characteristic: this.Characteristics.my.LogLevel,
      value: omnikInverterAccessory.platform.logLevel
    }).on('didSet', (value) => {
      omnikInverterAccessory.logLevel = value
    })
    this.check(data)
  }

  check (data) {
    this.values.consumption = data.total
    this.values.power = data.current
    const date = data.lastupdated == null ? new Date() : new Date(data.lastupdated)
    this.values.lastUpdated = String(date).slice(0, 24)
  }
}

module.exports = OmnikInverterService
