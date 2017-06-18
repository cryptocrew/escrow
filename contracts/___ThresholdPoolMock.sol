pragma solidity ^0.4.8;

import "./ThresholdPool.sol";

contract ___ThresholdPoolMock is ThresholdPool () {

  uint256 public mockCurrentTime;

  address public garbageDump;

  function ___ThresholdPoolMock (
    uint256 _poolTime,
    uint256 _threshold,
    address _recipient
  ) ThresholdPool (_poolTime, _threshold, _recipient) payable {
    garbageDump = 0x124d333116975d60FB53a78b4e229722d2bb1fDf;
  }

  function mockStartTime(uint256 _startTime) {
    startTime = _startTime;
  }

  function mockPoolTime(uint256 _poolTime) {
    poolTime = _poolTime;
  }

  function mockThreshold(uint256 _threshold) {
    threshold = _threshold;
  }

  function mockRecipient(address _recipient) {
    recipient = _recipient;
  }

  function mockBalance(address contributor, uint256 balance) {
    balances[contributor] = balance;
  }

  function mockTotal(uint256 _total) {
    total = _total;
  }

  function mockEnded(bool _ended) {
    ended = _ended;
  }

  function mockContribute() payable { }

  function cleanup() {
    garbageDump.transfer(this.balance);
    total = 0;
  }

  function currentTime() returns (uint256 _currentTime) {
    return 1000000000;
  }

}