/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')

const SensorRegistry = artifacts.require('SensorRegistry.sol')

contract('SensorRegistry', accounts => {
  const [admin] = accounts

  describe('Function: setCuratorPercentage', async () => {
    it('should not change the min enlist amount when user does not have the right role', async () => {
      const registry = await SensorRegistry.deployed()

      try {
        await registry.setCuratorPercentage(10, {
          from: accounts[9],
        })
      } catch (err) {
        assert.equal(
          err.reason,
          'You do not have the correct roles',
          err.reason
        )
      }
    })

    it('should change the min enlist amount when user has the right role', async () => {
      const registry = await SensorRegistry.deployed()

      const tx = await registry.setCuratorPercentage(10, {
        from: admin,
      })

      // Check if events have been emitted
      testEvent(tx, 'CuratorPercentageChanged', {
        value: '10',
      })
    })
  })

  describe('Function: setMinChallengeAmount', async () => {
    it('should not change the min enlist amount when user does not have the right role', async () => {
      const registry = await SensorRegistry.deployed()

      try {
        await registry.setMinChallengeAmount(10, {
          from: accounts[9],
        })
      } catch (err) {
        assert(err.reason === 'You do not have the correct roles', err.reason)
      }
    })

    it('should change the min enlist amount when user has the right role', async () => {
      const registry = await SensorRegistry.deployed()

      const tx = await registry.setMinChallengeAmount(10, {
        from: admin,
      })

      // Check if events have been emitted
      testEvent(tx, 'MinChallengeAmountChanged', {
        value: '10',
      })
    })
  })

  describe('Function: setMinEnlistAmount', async () => {
    it('should not change the min enlist amount when user does not have the right role', async () => {
      const registry = await SensorRegistry.deployed()

      try {
        await registry.setMinEnlistAmount(10, {
          from: accounts[9],
        })
      } catch (err) {
        assert.equal(
          err.reason,
          'You do not have the correct roles',
          err.reason
        )
      }
    })

    it('should change the min enlist amount when user has the right role', async () => {
      const registry = await SensorRegistry.deployed()

      const tx = await registry.setMinEnlistAmount(10, {
        from: admin,
      })

      // Check if events have been emitted
      testEvent(tx, 'MinEnlistAmountChanged', {
        value: '10',
      })
    })
  })
})
