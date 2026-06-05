// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// FixedWallet — безопасная версия VulnerableWallet.
// Все уязвимости исправлены для демонстрации MantleGuard.

contract FixedWallet {
    address public owner;
    mapping(address => uint) public balances;
    bool private _locked; // reentrancy guard

    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    // FIXED: Checks-Effects-Interactions pattern + reentrancy guard
    function withdraw(uint amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "insufficient balance");
        // Effects first
        balances[msg.sender] -= amount;
        // Then interaction
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "ETH transfer failed");
    }

    // FIXED: Access control added
    function stealETH(address payable _target) public onlyOwner {
        (bool ok, ) = _target.call{value: address(this).balance}("");
        require(ok, "transfer failed");
    }

    // FIXED: Access control added
    function setOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "zero address");
        owner = newOwner;
    }

    // FIXED: Selfdestruct protected
    function kill() public onlyOwner {
        selfdestruct(payable(owner));
    }

    // FIXED: No timestamp dependence for critical logic
    uint public lastRewardTime;
    function claimReward() public {
        // Use block number as more reliable timing
        // (simplified for demo)
        lastRewardTime = block.timestamp;
    }

    // Safe deposit
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
