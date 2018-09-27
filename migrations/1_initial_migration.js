var Migrations = artifacts.require('./Migrations.sol')

module.exports = async function(deployer, network, accounts) {
  try {
    await deployer.deploy(Migrations)
  } catch (error) {
    console.log(error)
    throw error
  }
}
