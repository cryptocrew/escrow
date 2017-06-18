/*
var ThresholdPoolMock = artifacts.require("./ThresholdPoolMock.sol");

let accounts

web3.eth.getAccounts((err, _accounts) => {
  accounts = _accounts
  runTests()
})

function runTests () {
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
    isClosedTest({
      startTime: 999999990,
      poolTime: 15,
      expectedReturnVal: false,
      message: 'isClosed() should return false when currentTime is less than startTime + poolTime'
    })
    isClosedTest({
      startTime: 999999990,
      poolTime: 5,
      expectedReturnVal: true,
      message: 'isClosed() should return true when currentTime is greater than startTime + poolTime'
    })
    isClosedTest({
      startTime: 999999990,
      poolTime: 10,
      expectedReturnVal: true,
      message: 'isClosed() should return true when currentTime is equal to startTime + poolTime'
    })

    function isClosedTest(params) {
      const { startTime, poolTime, expectedReturnVal, message } = params
      it(message, () => {
        let tp
        return getTp.then((_tp) => {
          tp = _tp
          return tp.mockStartTime(startTime)
        }).then(() => {
          return tp.mockPoolTime(poolTime)
        }).then(() => {
          return tp.isClosed.call()
        }).then((value) => {
          assert.equal(value, expectedReturnVal, `isClosed() did not return ${expectedReturnVal}`)
        })
      })
    }

    testContributeError(
      true,
      accounts[0],
      650,
      100,
      'contribute() should throw and leave balance/total unchanged if isClosed() returns true'
    )

    testContributeError(
      false,
      accounts[1],
      650,
      -50,
      'contribute() should throw and leave balance/total unchanged if value is less than 0'
    )

    function testContributeError(isClosed, sender, initialBalance, mockValue, msg) {
      it(msg, () => {
        let success, err, tp
        return tpMock({
          isClosed,
          initialBalances: [[sender, initialBalance]],
          total: 250
        }).then((_tp) => {
          tp = _tp
          return tp.contribute({ value: mockValue })
        }).then((resp) => {
          success = resp
        }, (_err) => {
          err = _err
        }).then(() => {
          assert.equal(success, undefined, `contribute() did not throw an error`)
          assertInvalidOpCode(err)
          return tp.balanceOf(sender)
        }).then((balance) => {
          assert.equal(balance.toNumber(), initialBalance, `sender balance was changed`)
          return tp.total.call()
        }).then((total) => {
          assert.equal(total.toNumber(), 250, 'total was changed')
        })
      })
    }

    testContributeBalance({
      state: {
        isClosed: false
      },
      sender: accounts[2],
      paymentValue: 100,
      expectedBalance: [accounts[2], 100],
      message: 'contribute() when paid 100 should add 100 to sender balance that starts at 0'
    })

    testContributeBalance({
      state: {
        isClosed: false,
        initialBalances: [
          [accounts[2], 800]
        ]
      },
      sender: accounts[2],
      paymentValue: 100,
      expectedBalance: [accounts[2], 900],
      message: 'contribute() when paid 100 should add 100 to existing sender balance'
    })

    function testContributeBalance(params) {
      const { state, sender, paymentValue, expectedBalance, message } = params
      const address = expectedBalance[0]
      const expectedBalanceVal = expectedBalance[1]
      it(message, () => {
        let tp
        return tpMock(state).then((_tp) => {
          tp = _tp
          return tp.contribute({ from: sender, value: paymentValue })
        }).then(() => {
          return tp.balanceOf.call(address)
        }).then((balance) => {
          assert.equal(
            balance.toNumber(),
            expectedBalanceVal, 
            `balance for ${address} does not equal ${expectedBalanceVal}`
          )
          return tp.cleanup()
        })
      })
    }

    testContributeTotal({
      state: {
        isClosed: false,
        total: 0
      },
      sender: accounts[3],
      paymentValue: 100,
      expectedTotal: 100,
      message: 'contribute() when paid 100 should add 100 to existing zero total'
    })

    testContributeTotal({
      state: {
        isClosed: false,
        total: 250
      },
      sender: accounts[4],
      paymentValue: 100,
      expectedTotal: 350,
      message: 'contribute() when paid 100 should add 100 to existing non-zero total'
    })

    function testContributeTotal(params) {
      const { state, sender, paymentValue, expectedTotal, message } = params
      it(message, () => {
        let tp
        return tpMock(state).then((_tp) => {
          tp = _tp
          return tp.contribute({ from: sender, value: paymentValue })
        }).then(() => {
          return tp.total.call()
        }).then((total) => {
          assert.equal(
            total.toNumber(),
            expectedTotal, 
            `total does not equal ${expectedTotal}`
          )
          return tp.cleanup()
        })
      })
    }

    testEnd({
      state: {
        isClosed: false
      },
      expectError: true,
      message: 'end() should throw an error when pool is still open'
    })

    testEnd({
      state: {
        isClosed: true,
        ended: true
      },
      expectError: true,
      message: 'end() should throw an error when pool has already been ended'
    })

    testEnd({
      state: {
        isClosed: true,
        ended: false
      },
      expectedEndedVal: true,
      message: 'end() should set `ended` to true'
    })

    testEnd({
      state: {
        isClosed: true,
        ended: false,
        recipient: accounts[5],
        threshold: 100,
        total: 150,
        contractBalance: 150
      },
      expectedRecipientBalance: [accounts[5], 555],
      expectedContractBalance: 21,
      message: 'end() should transfer total to recipient if threshold is met'
    })

    function testEnd(params) {
      const { state, expectError, expectedEndedVal, expectedRecipientBalance, message } = params
      it(message, () => {
        let tp, success, err
        return tpMock(state).then((_tp) => {
          tp = _tp
          return tp.end()
        }).then((resp) => {
          success = true
        }, (_err) => {
          success = false
          err = _err
        }).then(() => {
          if (expectError) {
            assert.isDefined(err, 'expected error but none was thrown')
            assertInvalidOpCode(err)
          } else {
            assert.isUndefined(err, `unexpected error thrown: ${err ? err.message : ''}`)
            if (typeof expectedEndedVal !== 'undefined') {
              return tp.ended.call().then((endedVal) => {
                assert.equal(endedVal, expectedEndedVal, `expected 'ended' to be ${expectedEndedVal}`)
                return Promise.resolve()
              })
            } else {
              return Promise.resolve()
            }
          }
        }).then(() => {
          if (typeof expectedRecipientBalance !== 'undefined') {
            const recipient = expectedRecipientBalance[0]
            const expectedVal = expectedRecipientBalance[1]
            const actualVal = web3.eth.getBalance(recipient).toNumber()
            assert.equal(actualVal, expectedVal, `expected ${recipient} balance to be ${expectedVal}`)
          }
          return Promise.resolve()
        }).then(() => {
          tp.cleanup()
        })
      })
    }

    // test helpers

    function tpWithOpenPool() {
      let tp
      return getTp.then((_tp) => {
        tp = _tp
        return tp.mockStartTime(1000000000)
      }).then(() => {
        return tp.mockPoolTime(6000)
      }).then(() => {
        return Promise.resolve(tp)
      })
    }

    function tpWithClosedPool() {
      let tp
      return getTp.then((_tp) => {
        tp = _tp
        return tp.mockStartTime(900000000)
      }).then(() => {
        return tp.mockPoolTime(6000)
      }).then(() => {
        return Promise.resolve(tp)
      })
    }

    function tpMock(state) {
      const { isClosed, initialBalances, total, ended, threshold, recipient, contractBalance } = state
      const fn = isClosed ? tpWithClosedPool : tpWithOpenPool
      let tp
      return fn().then((_tp) => {
        tp = _tp
        return initialBalances && initialBalances.length > 0 ?
          Promise.all(initialBalances.map((b) => {
            const address = b[0]
            const value = b[1]
            return tp.mockBalance(address, value)
          })) : Promise.resolve()
      }).then(() => {
        return typeof contractBalance !== 'undefined' ?
          tp.mockContribute({ value: contractBalance }) : Promise.resolve()
      }).then(() => {
        return typeof threshold !== 'undefined' ? tp.mockThreshold(threshold) : Promise.resolve()
      }).then(() => {
        return typeof recipient !== 'undefined' ? tp.mockRecipient(recipient) : Promise.resolve()
      }).then(() => {
        return typeof total !== 'undefined' ? tp.mockTotal(total) : Promise.resolve()
      }).then(() => {
        return typeof ended !== 'undefined' ? tp.mockEnded(ended) : Promise.resolve()
      }).then(() => {
        return Promise.resolve(tp)
      })
    }

    function assertInvalidOpCode(err) {
      const opcodeErr = err.message.indexOf('invalid opcode') >= 0
      assert.isTrue(opcodeErr, `threw the wrong error: ${err.message}`)
    }

  })
}
*/