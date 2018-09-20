const ForeignBridge = artifacts.require('ForeignBridge.sol')
const HDWalletProvider = require('truffle-hdwallet-provider')
const GateKeeper = artifacts.require('GateKeeper.sol')
const Token = artifacts.require('LocalDTXToken.sol')
const { grantPermission } = require('./helpers/permissions')

module.exports = async function(deployer, network, accounts) {
  let config = {}

  try {
    config = require('./config/deploy_bridge.json')
  } catch (error) {
    console.log('Could not deploy bridge, no configuration file found')
    return
  }

  try {
    const validators = config.validatorSeeds.map(seedToAddress)
    console.log(validators);
    await deployer.deploy(ForeignBridge, config.requiredValidators, validators)

    const dGateKeeper = await GateKeeper.deployed()
    const dForeignBridge = await ForeignBridge.deployed()
    const dToken = await Token.deployed()

    await grantPermission(
      dGateKeeper,
      dToken,
      'MINT_ROLE',
      dForeignBridge.address
    )
    await grantPermission(
      dGateKeeper,
      dToken,
      'BURN_ROLE',
      dForeignBridge.address
    )

    dForeignBridge.registerToken(
      '0x765f0c16d1ddc279295c1a7c24b0883f62d33f75',
      dToken.address
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}

function seedToAddress(seed) {
  const provider = new HDWalletProvider(seed)
  return provider.getAddresses()[0]
}
