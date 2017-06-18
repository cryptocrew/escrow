/*var HumanStandardToken = artifacts.require("./HumanStandardToken.sol");

contract('HumanStandardToken', function(accounts) {

  const initialBalance = 1000000

  let getHst
  
  beforeEach (() => {
    getHst = HumanStandardToken.deployed()
  })

  it(`should put ${initialBalance} HumanStandardToken in the first account`, function() {
    return getHst.then(function(hst) {
      return hst.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), initialBalance, `${initialBalance} wasn't in the first account`);
    });
  });

  it('should set symbol to WOT', () => {
    return getHst.then((hst) => {
      return hst.symbol.call()
    }).then((symbol) => {
      assert.equal(symbol, 'WOT', "asdf")
    })
  })

  it('should transfer funds for a valid transaction', () => {
    let hst
    let a1Initial, a2Initial, a1Final, a2Final
    return getHst.then((_hst) => {
      hst = _hst
      return hst.balanceOf(accounts[0])
    }).then((b) => {
      a1Initial = b.toNumber()
      return hst.balanceOf(accounts[1])
    }).then((b) => {
      a2Initial = b.toNumber()
      return hst.transfer(accounts[1], 20, { from: accounts[0] })
    }).then((results) => {
      const evt = results.logs[0]
      assert.equal(evt.event, 'Transfer', "logged event was not a 'Transfer'")
      assert.equal(evt.args._from, accounts[0], "log message has incorrect sender account")
      assert.equal(evt.args._to, accounts[1], "log message has incorrect recipient account")
      assert.equal(evt.args._value.toNumber(), 20, "log message has incorrect value")
      return hst.balanceOf(accounts[0])
    }).then((b) => {
      a1Final = b.toNumber()
      return hst.balanceOf(accounts[1])
    }).then((b) => {
      a2Final = b.toNumber()
      assert.equal(a1Final, a1Initial - 20, `${a1Initial - 20} was not the final balance of the sender account`)
      assert.equal(a2Final, a2Initial + 20, `${a2Initial + 20} was not the final balance of the recipient account`)
    })
  })

})
*/

/*
function getEthBalance (address) {
  return web3.fromWei(web3.eth.getBalance(address).toNumber(), 'ether')
}
*/
