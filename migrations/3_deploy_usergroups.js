const Administrators = artifacts.require('Administrators.sol')
const GateKeeper = artifacts.require('GateKeeper.sol')

const mintrc = require('../mintrc')
const {
  deployRoleRegistry,
  createAccounts,
} = require('@settlemint/solidity-mint')

module.exports = async function(deployer, network, accounts) {
  try {
    const dGateKeeper = await GateKeeper.deployed()

    // Administrator
    await deployRoleRegistry(deployer, Administrators, dGateKeeper, accounts[0])
    const DeployedAdministrators = await Administrators.deployed()
    await createAccounts(
      1,
      {
        prefix: 'admin',
        postfix: '@settlemint.com',
      },
      DeployedAdministrators,
      network === 'development'
        ? 'robot robot robot robot robot robot robot robot robot robot robot robot'
        : 'discover cousin hover skin skirt original crane spatial wrong barely keep jump',
      mintrc.environments
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}
