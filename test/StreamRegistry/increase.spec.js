/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Sensor = artifacts.require('Sensor.sol')

contract('SensorRegistry', accounts => {
  describe('Function: increase', async () => {
    const [seller] = accounts

    it('should increase the stake for the listing', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can unlist
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '10', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      await token.approve(registry.address, web3.utils.toWei('10'), {
        from: seller,
      })
      const tx2 = await registry.increase(
        listingAddress,
        web3.utils.toWei('10')
      )

      // Check if event was emitted
      testEvent(tx2, 'Increased', {
        listing: listingAddress,
        increasedBy: web3.utils.toWei('10'),
        newStake: web3.utils.toWei('60'),
      })

      const sensor = await Sensor.at(listingAddress)
      const sensorStake = await sensor.stake.call()

      assert.equal(sensorStake, web3.utils.toWei('60'))
    })
  })
})
