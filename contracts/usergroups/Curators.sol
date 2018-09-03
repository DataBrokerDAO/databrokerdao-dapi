pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/authentication/RoleRegistry.sol";


/**
 * Contains all the curators of this system
 */
contract Curators is RoleRegistry {

  constructor(address _gateKeeper) public RoleRegistry(_gateKeeper) {}

}
