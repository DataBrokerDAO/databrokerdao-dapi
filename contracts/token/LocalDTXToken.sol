pragma solidity ^0.4.24;

import "@settlemint/solidity-mint/contracts/marketplaces/tokensystem/Token.sol";


/**
 * Contains the Local DTX token
 */
contract LocalDTXToken is Token {

  constructor(
    bytes32 _name,
    uint8 _decimals,
    address _gateKeeper
  )
    Token(
      _name,
      _decimals,
      _gateKeeper
    )
    public
  {}

  function getIndexLength() public view returns (uint length) {
    length = tokenHolders.length;
  }

  function getByIndex(uint index) public view returns (address key, uint256 balance) {
    key = tokenHolders[index];
    balance = balances[tokenHolders[index]].balance;
  }

  function getByKey(address _key) public view returns (address key, uint256 balance) {
    key = _key;
    balance = balances[_key].balance;
  }

}
