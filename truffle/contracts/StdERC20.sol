// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StdERC20 is Initializable, ERC20Upgradeable {
    uint8 private tokenDecimals;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function init(address _owner, uint256 _totalSupply, string calldata _name, string calldata _symbol, uint8 _decimals) initializer public {
        __ERC20_init(_name, _symbol);
        tokenDecimals = _decimals;
        _mint(_owner, _totalSupply);
    }
    
    function decimals() public view override returns (uint8) {
        return tokenDecimals;
    }
}