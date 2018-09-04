/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const SensorRegistryDispatcher = artifacts.require(
  'SensorRegistryDispatcher.sol'
)
const Token = artifacts.require('DtxToken.sol')

contract('SensorRegistry', accounts => {
  describe('Function: enlist', async () => {
    const [seller] = accounts

    it('is upgradeable', async () => {
      const registryDispatcher = await SensorRegistryDispatcher.deployed()
      const registryAddress = await registryDispatcher.target.call()
      const registry = await SensorRegistry.at(registryAddress)
      const token = await Token.deployed()

      await token.approve(registry.address, web3.utils.toWei('50'), {
        from: seller,
      })
      const tx = await registry.enlist(web3.utils.toWei('50'), '1', '', {
        from: seller,
      })

      // Check if events have been emitted
      testEvent(tx, 'Enlisted', {
        stake: web3.utils.toWei('50'),
        price: '1',
      })
    })
  })
})
