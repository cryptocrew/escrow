var ThresholdPool = artifacts.require("./ThresholdPool.sol");
var ThresholdPoolMock = artifacts.require("./ThresholdPoolMock.sol");

module.exports = function(deployer) {
  deployer.deploy(ThresholdPool,
    60,
    100,
    '0x7adcb763ed77c4b93f22204040710f8d3c840c7d'
  );
};

module.exports = function(deployer) {
  deployer.deploy(ThresholdPoolMock,
    60,
    100,
    '0x7adcb763ed77c4b93f22204040710f8d3c840c7d'
  );
};
