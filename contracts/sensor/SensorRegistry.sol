pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/TokenCuratedRegistry.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokensystem/Token.sol";


/**
 * Contains all sensors
 */
contract SensorRegistry is TokenCuratedRegistry {

  /**
  @dev Contructor
  @notice                Sets the address for token
  @param _gateKeeper     Address of the gatekeeper
  @param _token          Address of the token
  */
  constructor(
    address _gateKeeper,
    address _token,
    address _listingFactory,
    address _challengeRegistry,
    uint _minEnlistAmount,
    uint _minChallengeAmount,
    uint _curatorPercentage
  )
    TokenCuratedRegistry(
      _gateKeeper,
      _token,
      _listingFactory,
      _challengeRegistry,
      _minEnlistAmount,
      _minChallengeAmount,
      _curatorPercentage
    )
    public
  {}
}
