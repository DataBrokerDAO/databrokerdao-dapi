pragma solidity ^0.4.24;

import "./Sensor.sol";
import "./SensorRegistry.sol";
import "@settlemint/solidity-mint/contracts/marketplaces/tokencuratedregistry/ListingFactory.sol";


/**
 * Creates new sensors
 */
contract SensorFactory is ListingFactory {

  constructor(address _gateKeeper) public ListingFactory(_gateKeeper) {}

  function createListing(
    address _owner,
    uint _price,
    uint _stakeAmount,
    address _tcr,
    string _metadata
  ) public
  {
    // Create listing
    Sensor _newSensor = new Sensor(_owner, _price, _stakeAmount, gateKeeper);

    // Metadata role
    gateKeeper.createPermission(
      msg.sender,
      address(_newSensor),
      bytes32("UPDATE_METADATA_ROLE"),
      msg.sender
    );

    // Add metadata
    _newSensor.updateMetaData(_metadata);

    // Add listing to token curated registry
    SensorRegistry sensorRegistry = SensorRegistry(_tcr);
    sensorRegistry.addListing(address(_newSensor));
  }
}
