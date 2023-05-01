// const { deployProxy, upgradeProxy } = require("@openzeppelin/truffle-upgrades");

// const ERC20V3Factory = artifacts.require("ERC20V3Factory");
// // const StdERC20_V2 = artifacts.require('StdERC20_V2');

// module.exports = async function (deployer) {
//   const instance = await deployProxy(ERC20V3Factory, [], { deployer });
//   // const upgraded = await upgradeProxy(instance.address, ERC20V3Factory_V2, { deployer });
// };
const ERC20V3Factory = artifacts.require("ERC20V3Factory");
const BigNumber = require("bignumber.js");

module.exports = function (deployer) {
  deployer.deploy(
    ERC20V3Factory,
    "0xf11fce2ada8d2001a5c9f9de6a3f8e2d358d2ed3",
    "0x0410420879ffeecc5cc8933bb6c1aac3c49d857c",
    "0x9d77341871358892378427e293ed4bbe0493b9f7",
    "0x6bb95eede00d276d2b6892d52bf8837d2b9dcb15",
    BigNumber(5 * 1e16)
  );
};
