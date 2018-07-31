const { createPermission, grantPermission } = require('./helpers/permissions')
const ChallengeRegistry = artifacts.require('ChallengeRegistry')
const SensorRegistry = artifacts.require('SensorRegistry')
const SensorRegistryDispatcher = artifacts.require('SensorRegistryDispatcher')
const SensorFactory = artifacts.require('SensorFactory')
const SensorFactoryDispatcher = artifacts.require('SensorFactoryDispatcher')
const Token = artifacts.require('LocalDTXToken')
const GateKeeper = artifacts.require('GateKeeper')

async function performMigration(deployer, network, accounts) {
  const dGateKeeper = await GateKeeper.deployed()
  const dDtxToken = await Token.deployed()

  // Deploy registry for challenges
  await deployer.deploy(ChallengeRegistry, dGateKeeper.address)
  const dChallengeRegistry = await ChallengeRegistry.deployed()

  // Deploy factory dispatcher
  await deployer.deploy(SensorFactoryDispatcher, dGateKeeper.address)
  const dSensorFactoryDispatcher = await SensorFactoryDispatcher.deployed()
  await createPermission(
    dGateKeeper,
    accounts[0],
    dSensorFactoryDispatcher,
    'UPGRADE_CONTRACT',
    accounts[0]
  )

  // Deploy factory for sensors: we use this design pattern to make sure we can use the interfaces
  // for the listings in the TCR
  await deployer.deploy(SensorFactory, dGateKeeper.address)
  const dSensorFactory = await SensorFactory.deployed()

  await grantPermission(
    dGateKeeper,
    dGateKeeper,
    'CREATE_PERMISSIONS_ROLE',
    dSensorFactory.address
  )

  // Set sensor registry address in dispatcher
  await dSensorFactoryDispatcher.setTarget(dSensorFactory.address)

  // Deploy sensor registry dispatcher, and grant permissions
  await deployer.deploy(
    SensorRegistryDispatcher,
    dGateKeeper.address,
    dDtxToken.address,
    dSensorFactory.address,
    dChallengeRegistry.address,
    web3.toWei(50), // minimum enlist amount (in wDTX)
    web3.toWei(20), // minimum challenge amount (in wDTX)
    10 // curator percentage
  )
  const dSensorRegistryDispatcher = await SensorRegistryDispatcher.deployed()
  await createPermission(
    dGateKeeper,
    accounts[0],
    dSensorRegistryDispatcher,
    'UPGRADE_CONTRACT',
    accounts[0]
  )

  // Deploy sensor registry
  await deployer.deploy(
    SensorRegistry,
    dGateKeeper.address,
    dDtxToken.address,
    dSensorFactory.address,
    dChallengeRegistry.address,
    web3.toWei(50), // minimum enlist amount (in wDTX)
    web3.toWei(20), // minimum challenge amount (in wDTX)
    10 // curator percentage
  )
  const dSensorRegistry = await SensorRegistry.deployed()

  // Grant sensor registry permission to create permissions:
  await grantPermission(
    dGateKeeper,
    dGateKeeper,
    'CREATE_PERMISSIONS_ROLE',
    dSensorRegistry.address
  )

  // Set sensor registry address in dispatcher
  await dSensorRegistryDispatcher.setTarget(dSensorRegistry.address)

  // Set admin permissions: only on first account, since this is the admin.
  // See migrations step 3.
  await createPermission(
    dGateKeeper,
    accounts[0],
    dSensorRegistry,
    'WITHDRAW_FUNDS_ROLE',
    accounts[0]
  )
  await createPermission(
    dGateKeeper,
    accounts[0],
    dSensorRegistry,
    'CURATE_CHALLENGE_ROLE',
    accounts[0]
  )

  // Enlist a sensor!
  // await enlistSensor(deployer, network, accounts)
}

module.exports = function(deployer, network, accounts) {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch(error => {
      console.log(error)
      process.exit(1)
    })
}
