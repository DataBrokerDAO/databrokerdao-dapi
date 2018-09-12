pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/marketplaces/tokensystem/TokenRegistry.sol";


/**
 * Contains all the DTX tokens: in this case, there is only one
 */
contract LocalDTXTokenRegistry is TokenRegistry {

  constructor(address _gateKeeper) public TokenRegistry(_gateKeeper) {}

}
