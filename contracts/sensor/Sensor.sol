pragma solidity ^0.4.24;

import "../purchase/Purchase.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/Listing.sol";


/**
 * Contains one sensor entity
 */
contract Sensor is Listing {

  /**
  @dev Contructor
  @notice                Sets the address for token
  @param _owner          Address of the owner
  @param _price          Price for the listing
  @param _stakeAmount    Amount staked for the listing
  @param _gateKeeper     Address of the gatekeeper
  */
  constructor(
    address _owner,
    uint _price,
    uint _stakeAmount,
    address _gateKeeper
  )
    public
    Listing(_owner, _price, _stakeAmount, _gateKeeper)
  {}

}
