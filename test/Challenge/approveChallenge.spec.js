/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Sensor = artifacts.require('Sensor.sol')

contract('SensorRegistry', accounts => {
  describe('Function: approveChallenge', async () => {
    const [seller] = accounts

    it('should approve the challenge and refund the stakes to the right addresses', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can challenge
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '10', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      // Add some challenges
      await token.approve(registry.address, web3.utils.toWei('20'), {
        from: seller,
      })
      await registry.challenge(listingAddress, web3.utils.toWei('20'), '') // challenge 1
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      await registry.challenge(listingAddress, web3.utils.toWei('50'), '') // challenge 2

      // Approve
      // No need to approve: we are transfering tokens from the contract itself
      const tx2 = await registry.approveChallenge(listingAddress, {
        from: seller,
      })

      // Check if event was emitted
      testEvent(tx2, 'ChallengeApproved', {
        listing: listingAddress,
      })

      // Check if listing is updated
      const sensor = await Sensor.at(listingAddress)
      const sensorStake = await sensor.stake.call()
      const sensorChallengesStake = await sensor.challengesStake.call()

      assert.equal(sensorStake, web3.utils.toWei('0'), sensorStake.toString())
      assert.equal(
        sensorChallengesStake,
        web3.utils.toWei('0'),
        sensorChallengesStake.toString()
      )
    })
  })
})
