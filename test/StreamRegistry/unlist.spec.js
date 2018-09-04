/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Sensor = artifacts.require('Sensor.sol')

contract('SensorRegistry', accounts => {
  describe('Function: unlist', async () => {
    const [seller] = accounts

    it('should remove the sensor data from the whitelist', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can unlist
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '1', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      const tx2 = await registry.unlist(listingAddress, {
        from: seller,
      })

      // Check if event was emitted
      testEvent(tx2, 'Unlisted', {
        listing: listingAddress,
      })

      const sensor = await Sensor.at(listingAddress)
      const sensorWhitelisted = await sensor.whitelisted.call()

      assert.isFalse(sensorWhitelisted)
    })
  })
})
