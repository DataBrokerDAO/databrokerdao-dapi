/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Sensor = artifacts.require('Sensor.sol')

contract('SensorRegistry', accounts => {
  describe('Function: denyChallenge', async () => {
    const [seller] = accounts

    it('should deny the challenge and refund the stakes to the right addresses', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can unlist
      await token.approve(registry.address, web3.utils.toWei('100'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('100'), '10', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      // Add some challenges
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      await registry.challenge(listingAddress, web3.utils.toWei('50'), '') // challenge 1
      await token.approve(registry.address, web3.utils.toWei('60'), {
        from: seller,
      })
      await registry.challenge(listingAddress, web3.utils.toWei('60'), '') // challenge 2

      // Deny
      // No need to approve: we are transfering tokens from the contract itself
      const tx2 = await registry.denyChallenge(listingAddress, {
        from: seller,
      })

      // Check if event was emitted
      testEvent(tx2, 'ChallengeDenied', {
        listing: listingAddress,
      })

      // Check if listing is updated
      const sensor = await Sensor.at(listingAddress)
      const sensorStake = await sensor.stake.call()
      const sensorChallengesStake = await sensor.challengesStake.call()

      assert.equal(
        sensorStake,
        web3.utils.toWei('100'),
        `${sensorStake.toString()} is not equal to ${web3.utils
          .toWei('100')
          .toString()}`
      )
      assert.equal(sensorChallengesStake, web3.utils.toWei('0'))
    })
  })
})
