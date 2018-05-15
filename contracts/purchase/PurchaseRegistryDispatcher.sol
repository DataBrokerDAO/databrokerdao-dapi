pragma solidity ^0.4.20;

import "@settlemint/solidity-mint/contracts/utility/upgrading/Dispatcher.sol";
import "@settlemint/solidity-mint/contracts/utility/caching/CachedByAddress.sol";

import "../sensor/SensorRegistry.sol";
import "../dtxtoken/DtxToken.sol";
import "./Purchase.sol";


/**
 * Dispatches calls to the purchase registry
 */
contract PurchaseRegistryDispatcher is Dispatcher, CachedByAddress {

  // Same state as contract it will refer to
  bytes32 constant public CREATE_PERMISSIONS_ROLE = "CREATE_PERMISSIONS_ROLE";
  bytes32 constant public CHANGE_SETTINGS_ROLE = "CHANGE_SETTINGS_ROLE";
  mapping (address => Purchase) public purchases;
  address[] public purchasesIndex;
  DtxToken public token;
  SensorRegistry sensorRegistry;
  uint salePercentage = 1;

  function PurchaseRegistryDispatcher(
    address _gateKeeper,
    address _token,
    address _sensorRegistry
  )
    Secured(_gateKeeper)
    CachedByAddress(this)
    public
  {
    // State also needs to initialized!
    token = DtxToken(_token);
    sensorRegistry = SensorRegistry(_sensorRegistry);
  }

  function setTarget(address _target) public {
    super.setTarget(_target);
    super.invalidateCache();
  }
}
