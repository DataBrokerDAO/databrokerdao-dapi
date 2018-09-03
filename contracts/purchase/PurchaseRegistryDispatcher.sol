pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/utility/upgrading/Dispatcher.sol";
import "../sensor/SensorRegistry.sol";
import "../dtxtoken/DtxToken.sol";
import "./Purchase.sol";


/**
 * Dispatches calls to the purchase registry
 */
contract PurchaseRegistryDispatcher is Dispatcher {

  // Same state as contract it will refer to
  bytes32 constant public CREATE_PERMISSIONS_ROLE = "CREATE_PERMISSIONS_ROLE";
  bytes32 constant public CHANGE_SETTINGS_ROLE = "CHANGE_SETTINGS_ROLE";
  mapping (address => Purchase) public purchases;
  address[] public purchasesIndex;
  DtxToken public token;
  SensorRegistry sensorRegistry;
  uint salePercentage = 1;

  constructor(
    address _gateKeeper,
    address _token,
    address _sensorRegistry
  )
    public
    Secured(_gateKeeper)
  {
    // State also needs to initialized!
    token = DtxToken(_token);
    sensorRegistry = SensorRegistry(_sensorRegistry);
  }

  function setTarget(address _target) public {
    super.setTarget(_target);
  }
}
