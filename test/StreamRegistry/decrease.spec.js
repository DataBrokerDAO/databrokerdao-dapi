/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Sensor = artifacts.require('Sensor.sol')

contract('SensorRegistry', accounts => {
  describe('Function: decrease', async () => {
    const [seller] = accounts

    it('should decrease the stake for the listing as when stake is still the minimum stake', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can decrease
      await token.approve(registry.address, web3.utils.toWei('60'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('60'), '10', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      const tx2 = await registry.decrease(
        listingAddress,
        web3.utils.toWei('5'),
        {
          from: seller,
        }
      )

      // Check if event was emitted
      testEvent(tx2, 'Decreased', {
        listing: listingAddress,
        decreasedBy: web3.utils.toWei('5'),
        newStake: web3.utils.toWei('55'),
      })

      const sensor = await Sensor.at(listingAddress)
      const sensorStake = await sensor.stake.call()

      assert.equal(sensorStake, web3.utils.toWei('55'))
    })

    it('should not decrease when stake amount would go beneath minimum stake', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can decrease
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '10', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      try {
        await registry.decrease(listingAddress, web3.utils.toWei('5'))
      } catch (err) {
        assert(
          err.reason === 'stake - _stakeAmount >= minEnlistAmount',
          err.reason
        )
        //assert(err.reason.includes('not less than balance'))
      }
    })
  })
})
