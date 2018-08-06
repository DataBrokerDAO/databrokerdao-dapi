pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../token/LocalDTXToken.sol";
import "./Validatable.sol";


contract ForeignBridge is Ownable, Validatable {

  mapping(bytes32=>uint8) public requests;
  mapping(bytes32=>bool) public requestsDone;
  mapping(bytes32=>bool) public signedRequests;

  mapping(address=>bool) public validators;

  // maps home token addresses -> foreign token addresses
  mapping(address=>address) public tokenMap;
  address[] public registeredTokens;

  event TokenAdded(
    address _mainToken,
    address _sideToken
  );
  event MintRequestSigned(
    bytes32 _mintRequestsHash,
    bytes32 indexed _transactionHash,
    address _mainToken,
    address _recipient,
    uint256 _amount,
    uint8 _requiredSignatures,
    uint8 _signatureCount,
    bytes32 _signRequestHash
  );
  event MintRequestExecuted(
    bytes32 _mintRequestsHash,
    bytes32 indexed _transactionHash,
    address _mainToken,
    address _recipient,
    uint256 _amount
  );
  event WithdrawRequestSigned(
    bytes32 _withdrawRequestsHash,
    bytes32 _transactionHash,
    address _mainToken,
    address _recipient,
    uint256 _amount,
    uint256 _withdrawBlock,
    address _signer,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  );
  event WithdrawRequestGranted(
    bytes32 _withdrawRequestsHash,
    bytes32 _transactionHash,
    address _mainToken,
    address _recipient,
    uint256 _amount,
    uint256 _withdrawBlock
  );

  constructor(
    uint8 _requiredValidators,
    address[] _initialValidators
  ) public Validatable(_requiredValidators,_initialValidators)
  {
  }

  // Register ERC20 token on the home net and its counterpart token on the foreign net.
  function registerToken(address _mainToken, address _foreignToken) public onlyOwner {
    require(tokenMap[_mainToken] == 0, "the main token should not be registered yet");

    require(_mainToken != 0x0, "the main token should not be 0");
    require(_foreignToken != 0x0, "the foreign token should not be 0");

    LocalDTXToken t = LocalDTXToken(_foreignToken);

    require(address(t) != 0x0, "the foreign token should not be 0");

    tokenMap[_mainToken] = t;
    registeredTokens.push(_mainToken);
    emit TokenAdded(_mainToken, _foreignToken);
  }

  function tokens() public view returns(address[]) {
    return registeredTokens;
  }

  function signMintRequest(
    bytes32 _transactionHash,
    address _mainToken,
    address _recipient,
    uint256 _amount,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  ) public
  {
    require(_amount > 0, "the amount needs to be greater than 0");

    // Token should be registered
    require(tokenMap[_mainToken] != 0x0, "the token should be registered already");

    // Unique hash for this request
    bytes32 reqHash = sha256(
      abi.encodePacked(
        _transactionHash,
        _mainToken,
        _recipient,
        _amount
      )
    );

    // Request shouldnt be done
    require(requestsDone[reqHash] != true, "this request should not be handled yet");

    address validator = ecrecover(
      reqHash,
      _v,
      _r,
      _s
    );
    require(isValidator(validator), "the validator should actually be a validator");

    // Request shouldnt already be signed by validator
    bytes32 signRequestHash = sha256(
      abi.encodePacked(
        reqHash,
        validator
      )
    );
    require(signedRequests[signRequestHash] != true, "the request should not be signed yet");
    signedRequests[signRequestHash] = true;

    requests[reqHash]++;
    if (requests[reqHash] < requiredValidators) {
      emit MintRequestSigned(
        reqHash,
        _transactionHash,
        _mainToken,
        _recipient,
        _amount,
        requiredValidators,
        requests[reqHash],
        signRequestHash
      );
    } else {
      requestsDone[reqHash] = true;
      LocalDTXToken(tokenMap[_mainToken]).mint(_recipient,_amount);
      emit MintRequestExecuted(
        reqHash,
        _transactionHash,
        tokenMap[_mainToken],
        _recipient,
        _amount
      );
    }
  }

  function signWithdrawRequest(
    bytes32 _transactionHash,
    address _mainToken,
    address _recipient,
    uint256 _amount,
    uint256 _withdrawBlock,
    uint8 _v,
    bytes32 _r,
    bytes32 _s) public
    {
    require(_amount > 0, "the amount should be greater than 0");

    // Token should be registered
    require(tokenMap[_mainToken] != 0x0, "the main token should be registed beforehand");

    // Unique hash for this request
    bytes32 reqHash = sha256(
      abi.encodePacked(
        _mainToken,
        _recipient,
        _amount,
        _withdrawBlock
      )
    );

    // Request shouldnt be done
    require(requestsDone[reqHash] != true, "the request should not be processed yet");

    address validator = ecrecover(
      reqHash,
      _v,
      _r,
      _s
    );
    require(isValidator(validator), "the validator should actually be a validator");

    // Request shouldnt already be signed by validator
    bytes32 signRequestHash = sha256(
      abi.encodePacked(
        reqHash,
        validator
      )
    );
    require(signedRequests[signRequestHash] != true, "the transaction should not be signed yet");
    signedRequests[signRequestHash] = true;

    requests[reqHash]++;

    emit WithdrawRequestSigned(
      reqHash,
      _transactionHash,
      _mainToken,
      _recipient,
      _amount,
      _withdrawBlock,
      validator,
      _v,
      _r,
      _s
    );

    if (requests[reqHash] >= requiredValidators) {
      requestsDone[reqHash] = true;

      // Burn the tokens we received
      LocalDTXToken(tokenMap[_mainToken]).burn(address(this), _amount);

      emit WithdrawRequestGranted(
        reqHash,
        _transactionHash,
        _mainToken,
        _recipient,
        _amount,
        _withdrawBlock
      );
    }
  }



}

