<p align="center">
  <img src="homebridge-omnik-inverter.png" height="200px">
</p>
<span align="center">

# Homebridge Omnik Inverter

[![GitHub issues](https://img.shields.io/github/issues/sjaakspiegels/homebridge-omnik-inverter)](https://github.com/sjaakspiegels/homebridge-omnik-inverter/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/ebaauw/homebridge-omnik-inverter)](https://github.com/sjaakspiegels/homebridge-omnik-inverter/pulls)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

</span>

## Homebridge plugin for Omnik Inverter
Copyright © 2018-2021 Sjaak Spiegels. All rights reserved.

This [Homebridge](https://github.com/homebridge/homebridge) plugin exposes a omnik inverter meter to Apple's [HomeKit](http://www.apple.com/ios/home/), using a webrequest to the omnik inverter.
It provides insight from HomeKit into your actual and historic energy delivery.

This plugin makes a webrequest to the Omnik Inverter every 4 minutes. Because the inverter updates the information every 5 minutes this interval is good enough. 

The smart meter sends a push notification ("telegram" in DSMR speak), every second, updating the electricity consumption almost in real time.
Older versions of DSMR might send notifications less frequently.
Gas consumption is updated once every five minutes.
Homebridge Omnik Inverter maintains the historic consumption.

The Omnik Inverter reports the following measurements:
- Solar_Power_Current;
- Solar_Power_Today;
- Solar_Power_Total;

Each accessory exposes a service with `Total Delivery`, just like an Eve Energy, enabling the [Eve](https://www.evehome.com/en/eve-app) app to display the consumption history.
Eve computes the `Total Cost` and `Projected Cost`.

### Prerequisites
You need an Omnik Inverter connected to your local network. The ip address of the inverter has to be configured in the json configuration file.
You need a server to run Homebridge.
This can be anything running [Node.js](https://nodejs.org): from a Raspberry Pi, a NAS system, or an always-on PC running Linux, macOS, or Windows.
See the [Homebridge Wiki](https://github.com/homebridge/homebridge/wiki) for details.
I run Homebridge Omnik Inverter on a Raspberry Pi 4.


### Configuration
Homebridge Omnik Inverter needs the folowing configuration in the config.json:
```json
"platforms": [
  {
    "platform": "Omnik Inverter",
    "ipaddress": "your-ip"
  }
]
```
### References
This project is inspired by the homebridge-p1 plugin by Erik Baauw. I also used the homebridge-lib package.
https://github.com/ebaauw/homebridge-p1
