const Token = artifacts.require('DtxToken.sol')
const TokenMinter = artifacts.require('DtxMinter.sol')
const GateKeeper = artifacts.require('GateKeeper.sol')
const { createPermission } = require('./helpers/permissions')

module.exports = async function(deployer, network, accounts) {
  const dGateKeeper = await GateKeeper.deployed()
  const dToken = await Token.deployed()
  // Deploy minter
  await deployer.deploy(TokenMinter, dToken.address, dGateKeeper.address)
  const dTokenMinter = await TokenMinter.deployed()

  // Grant permission to mint
  await createPermission(
    dGateKeeper,
    accounts[0],
    dToken,
    'MINT_ROLE',
    dTokenMinter.address
  )
}
