/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')

const PurchaseRegistry = artifacts.require('PurchaseRegistry.sol')

contract('PurchaseRegistry', accounts => {
  const [admin] = accounts

  describe('Function: setSalePercentage', async () => {
    it('should not change the percentage when user does not have the right role', async () => {
      const purchasing = await PurchaseRegistry.deployed()

      try {
        await purchasing.setSalePercentage(10, {
          from: accounts[9],
        })
      } catch (err) {
        assert(err.reason === 'You do not have the correct roles')
      }
    })

    it('should change the percentage when user has the right role', async () => {
      const purchasing = await PurchaseRegistry.deployed()

      const tx = await purchasing.setSalePercentage(10, {
        from: admin,
      })

      // Check if events have been emitted
      testEvent(tx, 'SalePercentageChanged', {
        value: '10',
      })
    })
  })
})
