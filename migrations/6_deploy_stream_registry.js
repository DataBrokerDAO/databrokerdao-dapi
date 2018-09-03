// const _ = require('lodash')

const { createPermission, grantPermission } = require('./helpers/permissions')
const { GATEWAY_OPERATOR_ADDRESS } = require('./helpers/api')

const ChallengeRegistry = artifacts.require('ChallengeRegistry.sol')
const SensorRegistry = artifacts.require('SensorRegistry.sol')
const SensorRegistryDispatcher = artifacts.require(
  'SensorRegistryDispatcher.sol'
)
const SensorFactory = artifacts.require('SensorFactory.sol')
const SensorFactoryDispatcher = artifacts.require('SensorFactoryDispatcher.sol')
const Token = artifacts.require('DtxToken.sol')
const GateKeeper = artifacts.require('GateKeeper.sol')

async function approveRegistryFor(addresses, dDtxToken, index) {
  const user = addresses[index]
  // Mint tokens for user
  await dDtxToken.mint(user, web3.utils.toWei('100'), {
    from: addresses[0],
  })
  const balanceOfUser = await dDtxToken.balanceOf(user)
  // Approve tokens
  await dDtxToken.approve(SensorRegistry.address, balanceOfUser, {
    from: user,
  })
  if (index < addresses.length - 1) {
    index++
    return approveRegistryFor(addresses, dDtxToken, index)
  }
}

module.exports = async function(deployer, network, accounts) {
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
    web3.utils.toWei('50'), // minimum enlist amount (in wDTX)
    web3.utils.toWei('20'), // minimum challenge amount (in wDTX)
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
    web3.utils.toWei('50'), // minimum enlist amount (in wDTX)
    web3.utils.toWei('20'), // minimum challenge amount (in wDTX)
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

  // Grant mint permission: we will mint in approveRegistryFor
  await grantPermission(dGateKeeper, dDtxToken, 'MINT_ROLE', accounts[0])
  await approveRegistryFor(accounts, dDtxToken, 0)

  // Mint tokens for gateway operator user
  await dDtxToken.mint(GATEWAY_OPERATOR_ADDRESS, web3.utils.toWei('100000'), {
    from: accounts[0],
  })

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
}
