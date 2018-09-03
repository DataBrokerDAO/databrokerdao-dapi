const Token = artifacts.require('DtxToken.sol')
const TokenRegistry = artifacts.require('DtxTokenRegistry.sol')
const GateKeeper = artifacts.require('GateKeeper.sol')
const { createPermission } = require('./helpers/permissions')

module.exports = async function(deployer, network, accounts) {
  const dGateKeeper = await GateKeeper.deployed()
  // Deploy token registry
  await deployer.deploy(TokenRegistry, dGateKeeper.address)
  const dTokenRegistry = await TokenRegistry.deployed()
  await createPermission(
    dGateKeeper,
    accounts[0],
    dTokenRegistry,
    'LIST_TOKEN_ROLE',
    accounts[0]
  )

  // Deploy token
  await deployer.deploy(
    Token,
    web3.utils.asciiToHex('DTX'),
    18,
    dGateKeeper.address
  )
  await dTokenRegistry.addToken(web3.utils.asciiToHex('DTX'), Token.address)
}
