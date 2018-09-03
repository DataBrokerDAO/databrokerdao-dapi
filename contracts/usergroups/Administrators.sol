pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/authentication/RoleRegistry.sol";


/**
 * Contains all the administrators of this system
 */
contract Administrators is RoleRegistry {

  constructor(address _gateKeeper) public RoleRegistry(_gateKeeper) {}

}
