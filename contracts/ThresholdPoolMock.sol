pragma solidity ^0.4.8;

import "./ThresholdPool.sol";

contract ThresholdPoolMock is ThresholdPool () {

  uint256 public mockCurrentTime;

  function ThresholdPoolMock (
    uint256 _poolTime,
    uint256 _threshold,
    address _recipient
  ) ThresholdPool (_poolTime, _threshold, _recipient) { }

  function mockStartTime(uint256 _startTime) {
    startTime = _startTime;
  }

  function mockPoolTime(uint256 _poolTime) {
    poolTime = _poolTime;
  }

  function mockThreshold(uint256 _threshold) {
    threshold = _threshold;
  }

  function currentTime() returns (uint256 _currentTime) {
    return 1000000000;
  }

}