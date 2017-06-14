pragma solidity ^0.4.8;

contract ThresholdPool {

  // timestamp representing when this pool was started
  uint256 public startTime;

  // number of milliseconds before the pool closes
  uint256 public poolTime;

  // threshold the pool needs to reach to execute transaction
  uint256 public threshold;

  // value of all funds contributed to the pool
  uint256 public total;

  // funds contributed to the pool are paid to this address
  // if threshold is reached before poolTime is exceeded
  address public recipient;

  // true if pool has been ended
  bool public ended;

  // contributor to balance mapping
  mapping (address => uint256) balances;

  function ThresholdPool (
    uint256 _poolTime,
    uint256 _threshold,
    address _recipient
  ) {
    startTime = currentTime();
    poolTime = _poolTime;
    threshold = _threshold;
    recipient = _recipient;
  }

  // send funds here to contribute to the pool
  function contribute() payable {
    // revert this call if pool is closed
    require(!isClosed());

    // add funds to the contributor's balance
    balances[msg.sender] += msg.value;

    // add funds to the total
    total += msg.value;
  }

  // gets balance of a pool contributor
  function balanceOf(address _contributor) constant returns (uint256 balance) {
    return balances[_contributor];
  }

  // returns true if the pool is closed
  function isClosed() returns (bool) {
    return currentTime() >= (startTime + poolTime);
  }

  function end() {
    require(isClosed());
    require(!ended);

    ended = true;
    
    if (total >= threshold) {
      // if the pool threshold was met or exceeded, transfer the total
      // to the recipient
      recipient.transfer(total);
    }
  }

  function withdraw() {
    require(isClosed());

    if (total < threshold && balances[msg.sender] > 0) {
      // if the pool threshold was not met, allow msg.sender to recover funds
      msg.sender.transfer(balances[msg.sender]);
    }
  }

  function currentTime() returns (uint256 _currentTime) {
    return now;
  }

}