// const { deployProxy, upgradeProxy } = require("@openzeppelin/truffle-upgrades");

// const CustomMintableERC20 = artifacts.require("CustomMintableERC20");
// // const CustomMintableERC20_V2 = artifacts.require('CustomMintableERC20_V2');

// module.exports = async function (deployer) {
//   const instance = await deployProxy(CustomMintableERC20, [], { deployer });
//   // const upgraded = await upgradeProxy(instance.address, CustomMintableERC20_V2, { deployer });
// };
const CustomMintableERC20 = artifacts.require("CustomMintableERC20");

module.exports = function (deployer) {
  deployer.deploy(CustomMintableERC20);
};
