/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Sensor = artifacts.require('Sensor.sol')
const Challenge = artifacts.require('Challenge.sol')
const ChallengeRegistry = artifacts.require('ChallengeRegistry.sol')

contract('SensorRegistry', accounts => {
  describe('Function: challenge', async () => {
    const [seller] = accounts

    it('should add a new challenge when minimum challenge stake amount is exceeded', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()
      const challengeRegistry = await ChallengeRegistry.deployed()

      // Enlist before we can challenge
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '10', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx2 = await registry.challenge(
        listingAddress,
        web3.utils.toWei('50'),
        '',
        {
          from: seller,
        }
      )

      // Check if event was emitted
      testEvent(tx2, 'Challenged', {
        listing: listingAddress,
        stake: web3.utils.toWei('50'),
      })

      // Check if listing is updated
      const sensor = await Sensor.at(listingAddress)
      const sensorChallengesStake = await sensor.challengesStake.call()
      const sensorNumberOfChallenges = await sensor.numberOfChallenges.call()

      assert.equal(
        sensorChallengesStake,
        web3.utils.toWei('50'),
        sensorChallengesStake.toString()
      )
      console.log(111, sensorNumberOfChallenges, new web3.utils.BN('1'))
      assert.equal(
        sensorNumberOfChallenges.toString(),
        new web3.utils.BN('1').toString(),
        sensorNumberOfChallenges.toString()
      )

      const challengeAddress = getEventProperty(tx2, 'Challenged', 'challenge')

      // Check if challenge is updated
      const challenge = await Challenge.at(challengeAddress)
      const challengeChallenger = await challenge.challenger.call()
      const challengeListing = await challenge.listing.call()

      assert.equal(challengeChallenger, seller)
      assert.equal(challengeListing, listingAddress)

      const challengeInRegistry = await challengeRegistry.challenges.call(
        challengeAddress
      )
      assert.equal(challengeInRegistry, challengeAddress)
    })

    it('should not add a new challenge when minimum challenge stake amount is not reached', async () => {
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

      try {
        await registry.challenge(listingAddress, web3.utils.toWei('2'), '')
      } catch (err) {
        assert(err.reason === '_stakeAmount >= minChallengeAmount', err.reason)
      }
    })
  })
})
