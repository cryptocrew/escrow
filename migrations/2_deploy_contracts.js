var HumanStandardToken = artifacts.require("./HumanStandardToken.sol");

module.exports = function(deployer) {
  deployer.deploy(HumanStandardToken,
    1000000,
    'WowToken',
    2,
    'WOT'
  );
};
