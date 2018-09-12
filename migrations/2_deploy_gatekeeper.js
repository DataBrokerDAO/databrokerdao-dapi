const GateKeeper = artifacts.require('GateKeeper.sol')

module.exports = async function(deployer, network, accounts) {
  try {
    await deployer.deploy(GateKeeper)
  } catch (error) {
    console.log(error)
    throw error
  }
}
