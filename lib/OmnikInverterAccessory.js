'use strict'

const homebridgeLib = require('homebridge-lib')
const OmnikInverterService = require('./OmnikInverterService')

class OmnikInverterAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (platform, name, data) {
    const params = {
      name: name,
      id: data.id,
      manufacturer: 'homebridge-omnik-inverter',
      model: 'homebridge-omnik-inverter',
      firmware: '1.0',
      category: platform.Accessory.Categories.Sensor,
      inheritLogLevel: name !== 'Solar energy'
    }
    super(platform, params)
    setImmediate(() => {
      this.emit('initialised')
    })
  }

  check (data) {
    this.service.check(data)
  }

  static get Electricity () { return Electricity }
}

class Electricity extends OmnikInverterAccessory {
  constructor (platform, data) {
    super(platform, 'Solar energy', data)
    this.service = new OmnikInverterService.Electricity(this, data)
    this.historyService = new homebridgeLib.ServiceDelegate.History.Consumption(
      this, {},
      this.service.characteristicDelegate('consumption')
    )
    this.dummyService = new homebridgeLib.ServiceDelegate.Dummy(this)
  }
}

module.exports = OmnikInverterAccessory
