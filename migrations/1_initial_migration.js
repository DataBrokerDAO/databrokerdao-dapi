var Migrations = artifacts.require('./Migrations.sol')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Migrations)
}
