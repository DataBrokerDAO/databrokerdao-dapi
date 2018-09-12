pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/utility/upgrading/Dispatcher.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokensystem/interfaces/IToken.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/interfaces/IListing.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/interfaces/IListingFactory.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/ChallengeRegistry.sol";

/**
 * Dispatches calls to the sensor factory
 */
contract SensorFactoryDispatcher is Dispatcher {

  constructor(
    address _gateKeeper
  )
    public
    Secured(_gateKeeper)
  {}

  function setTarget(address _target) public {
    super.setTarget(_target);
  }
}
