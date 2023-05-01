const StdERC20 = artifacts.require("StdERC20");

module.exports = function (deployer) {
  deployer.deploy(StdERC20);
};
