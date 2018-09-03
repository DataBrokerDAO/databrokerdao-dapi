pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/utility/upgrading/Dispatcher.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokensystem/interfaces/IToken.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/interfaces/IListing.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/interfaces/IListingFactory.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/ChallengeRegistry.sol";


/**
 * Dispatches calls to the sensor registry
 */
contract SensorRegistryDispatcher is Dispatcher {

  // Same state as contract it will refer to
  uint minEnlistAmount;
  uint minChallengeAmount;
  uint curatorPercentage;
  mapping(address => IListing) public listings;
  address[] listingsIndex;
  IToken public token;
  IListingFactory public listingFactory;
  ChallengeRegistry challengeRegistry;

  constructor(
    address _gateKeeper,
    address _token,
    address _listingFactory,
    address _challengeRegistry,
    uint _minEnlistAmount,
    uint _minChallengeAmount,
    uint _curatorPercentage
  )
    Secured(_gateKeeper)
    public
  {
    // State also needs to initialized!
    token = IToken(_token);
    listingFactory = IListingFactory(_listingFactory);
    challengeRegistry = ChallengeRegistry(_challengeRegistry);

    minEnlistAmount = _minEnlistAmount;
    minChallengeAmount = _minChallengeAmount;
    curatorPercentage = _curatorPercentage;
  }

  function setTarget(address _target) public {
    super.setTarget(_target);
  }
}
