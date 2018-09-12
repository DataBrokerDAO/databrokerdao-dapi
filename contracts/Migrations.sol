pragma solidity ^0.4.24;


contract Migrations {
  address public owner;
  uint public lastCompletedMigration;

  modifier restricted() {
    require(msg.sender == owner, "the sendor of the transaction is not the owner");
    _;
  }

  constructor() public {
    owner = msg.sender;
  }

  function setCompleted(uint completed) public restricted {
    lastCompletedMigration = completed;
  }

  function upgrade(address newAddress) public restricted {
    Migrations upgraded = Migrations(newAddress);
    upgraded.setCompleted(lastCompletedMigration);
  }
}
