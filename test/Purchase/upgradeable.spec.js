/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const PurchaseRegistry = artifacts.require('PurchaseRegistry.sol')
const PurchaseRegistryDispatcher = artifacts.require(
  'PurchaseRegistryDispatcher.sol'
)
const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')

contract('PurchaseRegistry', accounts => {
  describe('Function: purchaseAccess', async () => {
    const [seller] = accounts

    it('should allow a user to buy access to sensor data', async () => {
      const purchasingDispatcher = await PurchaseRegistryDispatcher.deployed()
      const purchasingAddress = await purchasingDispatcher.target.call()
      const purchasing = await PurchaseRegistry.at(purchasingAddress)
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist first
      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '1', '', {
        from: seller,
      })
      const listingAddress = getEventProperty(tx, 'Enlisted', 'listing')

      // Then purchase
      await token.approve(purchasing.address, web3.utils.toWei('100'), {
        from: seller,
      })
      const endTime = new Date().getTime() / 1000 + 60 // one minute from now
      const tx2 = await purchasing.purchaseAccess(listingAddress, endTime, '', {
        from: seller,
      })

      // Check if events have been emitted
      testEvent(tx2, 'AccessPurchased', {
        sensor: listingAddress,
      })
    })
  })
})
