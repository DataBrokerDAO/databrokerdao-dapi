pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/authentication/Secured.sol";
import "@settlemint/solidity-mint/contracts/utility/syncing/Syncable.sol";
import "@settlemint/solidity-mint/contracts/utility/metadata/MetaDataContainer.sol";


/**
 * Contains one sensor purchase entity
 */
contract Purchase is Secured, MetaDataContainer {

  uint public price; // price per second for which access was purchased
  uint public startTime; // the time at which the purchaser will gain access to this sensor
  uint public endTime; // the time at which the purchaser will lose access to this sensor
  address public purchaser; // address of the user
  address public sensor; // id of the sensor to which access was purchased

  constructor(
    uint _price,
    uint _startTime,
    uint _endTime,
    address _purchaser,
    address _sensor,
    address _gateKeeper
  )
    public
    Secured(_gateKeeper)
  {
    price = _price;
    startTime = _startTime;
    endTime = _endTime;
    purchaser = _purchaser;
    sensor = _sensor;
  }

  /**
  * implementation of metadata methods
  */
  function updateMetaData(string ipfsHash) public {
    super.updateMetaData(ipfsHash);
  }
}
