/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')
const getEventProperty = require('../helpers/getEventProperty')

const PurchaseRegistry = artifacts.require('PurchaseRegistry.sol')
const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')
const Purchase = artifacts.require('Purchase.sol')

contract('PurchaseRegistry', accounts => {
  describe('Function: purchaseAccess', async () => {
    const [seller] = accounts

    it('should allow a user to buy access to sensor data', async () => {
      const purchasing = await PurchaseRegistry.deployed()
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
      const purchaseAddress = getEventProperty(
        tx2,
        'AccessPurchased',
        'purchase'
      )

      const purchase = await Purchase.at(purchaseAddress)
      const purchasePurchaser = await purchase.purchaser.call()
      const purchaseSensor = await purchase.sensor.call()

      assert.equal(purchasePurchaser, seller)
      assert.equal(purchaseSensor, listingAddress)

      const purchaseInRegistry = await purchasing.purchases.call(
        purchaseAddress
      )
      assert.equal(purchaseInRegistry, purchaseAddress)
    })

    it('should allow a user to buy access to sensor data without an endtime', async () => {
      const purchasing = await PurchaseRegistry.deployed()
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
      await token.approve(purchasing.address, web3.utils.toWei('20'), {
        from: seller,
      })
      const tx2 = await purchasing.purchaseAccess(listingAddress, 0, '', {
        from: seller,
      })

      // Check if events have been emitted
      testEvent(tx2, 'AccessPurchased', {
        sensor: listingAddress,
      })
      const purchaseAddress = getEventProperty(
        tx2,
        'AccessPurchased',
        'purchase'
      )

      const purchase = await Purchase.at(purchaseAddress)
      const purchasePurchaser = await purchase.purchaser.call()
      const purchaseSensor = await purchase.sensor.call()

      assert.equal(purchasePurchaser, seller)
      assert.equal(purchaseSensor, listingAddress)

      const purchaseInRegistry = await purchasing.purchases.call(
        purchaseAddress
      )
      assert.equal(purchaseInRegistry, purchaseAddress)
    })
  })
})
