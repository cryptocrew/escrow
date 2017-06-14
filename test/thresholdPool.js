var ThresholdPoolMock = artifacts.require("./ThresholdPoolMock.sol");

contract('ThresholdPool', function(accounts) {

  let getTp
  
  beforeEach (() => {
    getTp = ThresholdPoolMock.deployed()
  })

  it(`startTime should be set`, function() {
    return getTp.then((tp) => {
      return tp.startTime.call()
    }).then((startTime) => {
      assert.equal(startTime.toNumber(), 1000000000, 'startTime was not set correctly')
    })
  })

  // tested against currentTim mocked as 1000000000 
  // isClosedTest(startTime, poolTime, expected, msg)
  isClosedTest(999999990, 15, false, 'isClosed() should return false when currentTime is ' +
    'less than startTime + poolTime')
  isClosedTest(999999990, 5, true, 'isClosed() should return true when currentTime is ' +
    'greater than startTime + poolTime')
  isClosedTest(999999990, 10, true, 'isClosed() should return true when currentTime is ' +
    'equal to startTime + poolTime')

  function isClosedTest(startTime, poolTime, expected, msg) {
    it(msg, () => {
      let tp
      return getTp.then((_tp) => {
        tp = _tp
        return tp.mockStartTime(startTime)
      }).then(() => {
        return tp.mockPoolTime(poolTime)
      }).then(() => {
        return tp.isClosed.call()
      }).then((value) => {
        assert.equal(value, expected, `isClosed() did not return ${expected}`)
      })
    })
  }

})
