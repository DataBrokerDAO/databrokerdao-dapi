const { grantPermission, createPermission } = require('./helpers/permissions')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const PurchaseRegistry = artifacts.require('PurchaseRegistry.sol')
const PurchaseRegistryDispatcher = artifacts.require(
  'PurchaseRegistryDispatcher.sol'
)
const Token = artifacts.require('LocalDTXToken.sol')
const GateKeeper = artifacts.require('GateKeeper.sol')

module.exports = async function(deployer, network, accounts) {
  try {
    const dGateKeeper = await GateKeeper.deployed()
    const dDtxToken = await Token.deployed()
    const dSensorRegistry = await SensorRegistry.deployed()

    // Deploy purchase registry dispatcher, and grant permissions
    await deployer.deploy(
      PurchaseRegistryDispatcher,
      dGateKeeper.address,
      dDtxToken.address,
      dSensorRegistry.address
    )
    const dPurchaseRegistryDispatcher = await PurchaseRegistryDispatcher.deployed()
    await createPermission(
      dGateKeeper,
      accounts[0],
      dPurchaseRegistryDispatcher,
      'UPGRADE_CONTRACT',
      accounts[0]
    )

    // Deploy purchase registry
    await deployer.deploy(
      PurchaseRegistry,
      dGateKeeper.address,
      dDtxToken.address,
      dSensorRegistry.address
    )
    const dPurchaseRegistry = await PurchaseRegistry.deployed()

    // Grant permission to create permissions:
    await grantPermission(
      dGateKeeper,
      dGateKeeper,
      'CREATE_PERMISSIONS_ROLE',
      dPurchaseRegistry.address
    )

    // Set purchase registry address in dispatcher
    await dPurchaseRegistryDispatcher.setTarget(dPurchaseRegistry.address)

    // Give admin permission to change settings
    await createPermission(
      dGateKeeper,
      accounts[0],
      dPurchaseRegistry, // purchase registry
      'CHANGE_SETTINGS_ROLE',
      accounts[0]
    )
    await createPermission(
      dGateKeeper,
      accounts[0],
      dSensorRegistry, // sensor registry
      'CHANGE_SETTINGS_ROLE',
      accounts[0]
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}
