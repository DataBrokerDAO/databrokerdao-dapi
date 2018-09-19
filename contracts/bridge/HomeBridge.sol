pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../external/MiniMeToken.sol";

import "./Validatable.sol";


contract HomeBridge is Validatable, ApproveAndCallFallBack {
  using SafeMath for uint256;

  mapping(bytes32=>bool) usedHashes;

  event DepositReceived(address indexed _from, uint256 _amount, address _mainToken, bytes _data);

  constructor(uint8 _requiredValidators,address[] _initialValidators) Validatable(_requiredValidators,_initialValidators) public {

  }

  function checkValidations(
    bytes32 _hash,
    uint256 _length,
    uint8[] _v,
    bytes32[] _r,
    bytes32[] _s) public view returns(uint8)
    {
    uint8 approvals = 0;
    for (uint i = 0; i < _length ; i++) {
      address validator = ecrecover(
        _hash,
        _v[i],
        _r[i],
        _s[i]
      );
      require(isValidator(validator), "The validator address is not a validator");
      approvals++;
    }
    return approvals;
  }

  function withdraw(
    address _token,
    address _recipient,
    uint256 _amount,
    uint256 _withdrawblock,
    uint8[] _v,
    bytes32[] _r,
    bytes32[] _s) public
    {

    bytes32 hash = sha256(
      abi.encodePacked(
        _token,
        _recipient,
        _amount,
        _withdrawblock
      )
    );

    // the hash should not have been used before
    require(usedHashes[hash] == false, "the hash should not have been used before");

    // mark hash as used
    usedHashes[hash] = true;

    require(_token != 0x0, "the token should be defined");

    require(_recipient != 0x0, "the recipient should be defined");

    require(_amount >= 0, "the amount should be bigger than 0 and defined");

    // the time-lock should have passed
    // require(_withdrawblock <= block.number);

    // verify the provided signatures
    require(_v.length > 0, "the length of v should be more than 0");
    require(_v.length == _r.length, "the length of v and r need to be the same");
    require(_v.length == _s.length, "the length of v and s need to be the same");

    // verify if the threshold of required signatures is met
    uint8 validations = checkValidations(
      hash,
      _v.length,
      _v,
      _r,
      _s
    );
    require(validations >= requiredValidators, "you need more validations than required validators");
    // ERC-20 transfer
    MiniMeToken(_token).transfer(_recipient, _amount);
  }

  function receiveApproval(
    address _from,
    uint256 _amount,
    address _token,
    bytes _data) public
    {
		assert(_from != 0x0);
		assert(_token != 0x0);
		assert(_amount > 0);

    require(MiniMeToken(_token).allowance(_from, address(this)) >= _amount);
		MiniMeToken(_token).transferFrom(_from, address(this), _amount);

		emit DepositReceived(_from, _amount, _token, _data);
	}

}

