// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CustomMintableERC20 is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable {
    /* ========== 全局参数 ========== */
    uint8 private tokenDecimals;
    ///////////////////////////////////////////////////////////////////////////////
    // 交易燃烧参数
    // isBurn 决定交易是否燃烧；
    // burnPercent 为燃烧百分比，以万分之一为单位
    ///////////////////////////////////////////////////////////////////////////////
    bool public isBurn = false;
    uint256 public burnPercent;
    ///////////////////////////////////////////////////////////////////////////////
    // 交易手续费参数
    // isFee决定交易是否收费；
    // feePercent 为收费百分比，以万分之一为单位；
    // feeBeneficiary 为接收交易手续费地址
    ///////////////////////////////////////////////////////////////////////////////
    bool public isFee = false;
    uint256 public feePercent;
    address public feeBeneficiary;

    /* ========== 构造函数 ========== */
    ///////////////////////////////////////////////////////////////////////////////
    // 创建合约时运行（只运行一次），确保合约只被 init 一次
    ///////////////////////////////////////////////////////////////////////////////
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function init(address _creator, uint256 _initialSupply, string calldata _name, string calldata _symbol, uint8 _decimals, uint256 _tradeBurnRatio, uint256 _tradeFeeRatio, address _teamAccount) initializer public {
        __ERC20_init(_name, _symbol);
        tokenDecimals = _decimals;
        if (_tradeBurnRatio > 0) {
            isBurn = true;
            burnPercent = _tradeBurnRatio;
        }
        if (_tradeFeeRatio > 0) {
            isFee = true;
            feePercent = _tradeFeeRatio;
        }
        feeBeneficiary = _teamAccount;
        _mint(_creator, _initialSupply);
    }
    
    function decimals() public view override returns (uint8) {
        return tokenDecimals;
    }
    /* ========== 设置函数 ========== */
    ///////////////////////////////////////////////////////////////////////////////
    // 设置交易手续费，只有合约拥有者才能修改
    // 如要取消交易手续费，则设置 _feePercent = 0
    // _feePercent 按万分之一计算，0 <= _feePercent <= 10000
    ///////////////////////////////////////////////////////////////////////////////
    function setFee(uint256 _feePercent, address _newReceiver) external onlyOwner {
        if (_feePercent == 0)
            isFee = false;
        else {
            isFee = true;
            feePercent = _feePercent;
            feeBeneficiary = _newReceiver;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////
    // 设置交易燃烧，只有合约拥有者才能修改
    // 如要取消交易燃烧，则设置 _burnPercent = 0
    // _burnPercent 按万分之一计算，0 <= _burnPercent <= 10000
    ///////////////////////////////////////////////////////////////////////////////
    function setBurn(uint256 _burnPercent) external onlyOwner {
        if (_burnPercent == 0)
            isBurn = false;
        else {
            isBurn = true;
            burnPercent = _burnPercent;
        }
    }

    /* ========== 功能函数 ========== */
    ///////////////////////////////////////////////////////////////////////////////
    // 销毁功能在 ERC20BurnableUpgradeable.sol 里面定义
    // burn(uint256 amount)销毁 function caller 的 token amount
    // burnFrom(address account, uint256 amount) 销毁 function caller 被 allow spend 的 token amount
    ///////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////
    // 运算函数
    ///////////////////////////////////////////////////////////////////////////////
    function getAmount(uint256 _amount, uint256 _percent) internal pure returns (uint256) {
        return _amount * _percent / 10000;
    }

    ///////////////////////////////////////////////////////////////////////////////
    // 复写 transfer 函数，以实现交易销毁及交易收取手续费功能
    ///////////////////////////////////////////////////////////////////////////////
    function transfer(address to, uint256 amount) public override returns (bool) {
        address _fromAddr = _msgSender();
        uint256 _feeAmount;
        uint256 _burnAmount;
        uint256 _remainingAmount;

        if (isFee) {
            _feeAmount = getAmount(amount, feePercent);
            _transfer(_fromAddr, feeBeneficiary, _feeAmount);
        }

        if (isBurn) {
            _burnAmount = getAmount(amount, burnPercent);
            _burn(_fromAddr, _burnAmount);
        }

        _remainingAmount = amount - _feeAmount - _burnAmount;
        _transfer(_fromAddr, to, _remainingAmount);

        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////
    // mint 函数，实现增发功能
    ///////////////////////////////////////////////////////////////////////////////
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}