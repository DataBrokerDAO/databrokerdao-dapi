pragma solidity ^0.4.20;

import "../purchase/Purchase.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/Listing.sol";


contract Stream is Listing {

  /**
  @dev Contructor
  @notice                Sets the address for token
  @param _owner          Address of the owner
  @param _price          Price for the listing
  @param _stakeAmount    Amount staked for the listing
  @param _gateKeeper     Address of the gatekeeper
  */
  function Stream(
    address _owner,
    uint _price,
    uint _stakeAmount,
    address _gateKeeper
  )
    Listing(_owner, _price, _stakeAmount, _gateKeeper)
    public
  {}

  /**
  * implementation of cacher methods
  */
  function invalidateCache(address _cachedAddress, bytes32 /*_cachedBytes32*/, uint256 /*_cachedUint256*/) public {
    emit AddressCacheInvalidated(_cachedAddress);
  }
}
