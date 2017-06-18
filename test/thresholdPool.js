const _ = require('lodash')
const ThresholdPoolMock = artifacts.require("./ThresholdPoolMock.sol");

contract('ThresholdPool', function(accounts) {

  const init = { poolTime: 100, currentTime: 0, recipient: accounts[9] }

  describe('isClosed()', () => {
    it('should return false when currentTime is less than startTime + poolTime', async () => {
      return await isClosedTest({
        init,
        finalTime: 50,
        expectedReturnVal: false
      })
    })

    it('should return true when currentTime is greater than startTime + poolTime', async () => {
      return await isClosedTest({
        init,
        finalTime: 150,
        expectedReturnVal: true
      })
    })

    it('should return true when currentTime is equal to startTime + poolTime', async () => {
      return await isClosedTest({
        init,
        finalTime: 100,
        expectedReturnVal: true
      })
    })
  })

  describe('contribute()', () => {
    it('should throw when isClosed() is true', async () => {
      return await contributeTest({
        init,
        finalTime: 150,
        contributeCalls: [{
          sender: accounts[0],
          value: 1000
        }],
        expectThrow: true
      })
    })

    it('should throw when payment value is 0', async () => {
      return await contributeTest({
        init,
        contributeCalls: [{
          sender: accounts[0],
          value: 0
        }],
        expectThrow: true
      })
    })

    it('should throw when payment value is less than 0', async () => {
      return await contributeTest({
        init,
        contributeCalls: [{
          sender: accounts[0],
          value: -1000
        }],
        expectThrow: true
      })
    })

    it('should set sender balance to payment amount sent', async () => {
      return await contributeTest({
        init,
        contributeCalls: [{
          sender: accounts[0],
          value: 1000
        }],
        expectedSenderBalances: [{
          sender: accounts[0],
          value: 1000
        }]
      })
    })

    it('should add each payment amount contributed to total', async () => {
      return await contributeTest({
        init,
        contributeCalls: [
          { sender: accounts[0], value: 1000 },
          { sender: accounts[0], value: 2000 },
          { sender: accounts[0], value: 3000 },
          { sender: accounts[1], value: 3000 }
        ],
        expectedTotal: 9000
      })
    })

    it('should mantain cumulative totals for multiple sender contributions', async () => {
      return await contributeTest({
        init,
        contributeCalls: [
          { sender: accounts[0], value: 1000 },
          { sender: accounts[0], value: 2000 },
          { sender: accounts[1], value: 3000 },
          { sender: accounts[1], value: 2000 }
        ],
        expectedSenderBalances: [
          { sender: accounts[0], value: 3000 },
          { sender: accounts[1], value: 5000 }
        ]
      })
    })

  })

  describe('end()', () => {
    it('should throw if isClosed() returns false', async () => {
      return await endTest({
        init,
        endCalls: [
          { sender: accounts[0] }
        ],
        expectThrow: true
      })
    })
    
    it('should throw if ended has already been called', async () => {
      return await endTest({
        init,
        finalTime: 150,
        makePreCall: true,
        endCalls: [
          { sender: accounts[0] }
        ],
        expectThrow: true
      })
    })
    
    it('should set `ended=true`', async () => {
      return await endTest({
        init,
        finalTime: 150,
        endCalls: [
          { sender: accounts[0] }
        ],
        expectEndedToBeTrue: true
      })
    })

    it('should not transfer total to recipient if total is less than threshold', async () => {
      return await endTest({
        init: Object.assign(init, {
          threshold: 1000
        }),
        finalTime: 150,
        endCalls: [
          { sender: accounts[0] }
        ],
        expectedRecipientTransferAmt: 0
      })
    })

    it.only('should transfer total to recipient if total is greater than threshold', async () => {
      return await endTest({
        init: Object.assign(init, {
          threshold: 1000
        }),
        contributeCalls: [
          { sender: accounts[0], value: 500 },
          { sender: accounts[1], value: 500 },
          { sender: accounts[2], value: 500 }
        ],
        finalTime: 150,
        endCalls: [
          { sender: accounts[0] }
        ],
        expectedRecipientTransferAmt: 1500
      })
    })

  })

})

async function endTest (params) {
  const { init, finalTime, contributeCalls,  makePreCall, endCalls, expectThrow,
    expectEndedToBeTrue, expectedRecipientTransferAmt } = params
  const tp = await mockTP(init)
  if (typeof contributeCalls !== 'undefined') {
    await makeContributeCalls(tp, contributeCalls)
  }
  if (typeof finalTime !== 'undefined') {
    await tp.changeTime(finalTime)
  }
  let err
  const initialRecipientBalance = getBalanceInEth(init.recipient)
  if (makePreCall) {
    await tp.end()
  }
  try {
    await makeEndCalls(tp, endCalls)
  } catch (_err) {
    err = _err
  } finally {
    handleErrorAssert(err, expectThrow)
    if (typeof expectEndedToBeTrue !== 'undefined') {
      const ended = await tp.ended.call()
      assert.equal(ended, true, `expected 'ended' to be true but received ${ended}`)
    }
    if (typeof expectedRecipientTransferAmt !== 'undefined') {
      const finalRecipientBalance = getBalanceInEth(init.recipient)
      const actualRecipientTransferAmt = finalRecipientBalance - initialRecipientBalance

      // WHY ISN'T IT SHOWING THE BALANCE CHANGE FOR RECIPIENT?
      console.log("ADDRESS: ", init.recipient)
      console.log("FINAL: ", finalRecipientBalance)
      console.log("INITIAL: ", initialRecipientBalance)
      
      assert.equal(
        actualRecipientTransferAmt,
        expectedRecipientTransferAmt,
        `expected ${expectedRecipientTransferAmt} to be transfered to ${init.recipient}, ` +
          `but ${actualRecipientTransferAmt} was transferred`
      )
    }
  }
}

async function contributeTest (params) {
  const { init, finalTime, contributeCalls, expectThrow, expectedSenderBalances, expectedTotal } = params
  const tp = await tpChangeTime(init, finalTime)
  let err
  try {
    await makeContributeCalls(tp, contributeCalls)
  } catch (_err) {
    err = _err
  } finally {
    handleErrorAssert(err, expectThrow)
    if (typeof expectedSenderBalances !== 'undefined') {
      const actualBalances = await Promise.all(_.map(expectedSenderBalances, (b) => {
        return balanceOf(tp, b.sender)
      }))
      _.forEach(actualBalances, (actualBalance, i) => {
        assert.equal(actualBalance, expectedSenderBalances[i].value)
      })
    }
    if (typeof expectedTotal !== 'undefined') {
      const actualTotal = await tp.total.call()
      assert.equal(actualTotal.toNumber(), expectedTotal)
    }
  }
}

async function tpChangeTime (init, finalTime) {
  const tp = await mockTP(init)
  if (finalTime) {
    await tp.changeTime(finalTime)
  }
  return tp
}

async function makeContributeCalls(tp, contributeCalls) {
  return await Promise.all(_.map(contributeCalls, (c) => {
    return tp.contribute({ from: c.sender, value: c.value })
  }))
}

async function makeEndCalls(tp, endCalls) {
  return await Promise.all(_.map(endCalls, (c) => {
    return tp.end({ from: c.sender })
  }))
}

async function isClosedTest (params) {
  const { init, finalTime, expectedReturnVal } = params
  const tp = await mockTP(init)
  await tp.changeTime(finalTime)
  const actualReturnVal = await tp.isClosed.call()
  assert.equal(
    actualReturnVal,
    expectedReturnVal,
    `isClosed() did not return ${expectedReturnVal}`
  )
}

async function mockTP (params) {
  const { poolTime, threshold, recipient, currentTime } = params
  return await ThresholdPoolMock.new(
    poolTime,
    threshold,
    recipient,
    currentTime
  )
}

async function balanceOf (tp, address) {
  const b = await tp.balanceOf.call(address)
  return b.toNumber()
}

async function logTP (tp) {
  console.log("")
  console.log("ThresholdPool:")
  console.log("--------------")
  console.log(`BALANCE: ${getBalanceInEth(tp.address)}`)
  console.log(`startTime=${await tp.startTime.call()}`)
  console.log(`poolTime=${await tp.poolTime.call()}`)
  console.log(`threshold=${await tp.threshold.call()}`)
  console.log(`recipient=${await tp.recipient.call()}`)
  console.log(`currentTime()=${await tp.currentTime.call()}`)
  console.log(`isClosed()=${await tp.isClosed.call()}`)
  console.log("")
}

function handleErrorAssert (err, expectThrow) {
  const errTestMsg = expectThrow ?
    `expected an error, but no error was thrown` : `unexpected error thrown: ${err}`
  assert.equal(typeof err !== 'undefined', expectThrow ? true : false, errTestMsg)
}

function getBalanceInEth (address) {
  return web3.eth.getBalance(address).toNumber()
}

async function getAccounts() {
  return await new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        reject(err)
      } else {
        resolve(accounts)
      }
    })
  })
}