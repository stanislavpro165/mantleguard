// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// WARNING: This contract contains vulnerabilities for DEMONSTRATION ONLY.
// DO NOT USE IN PRODUCTION.
//
// Vulnerabilities:
//   1. Reentrancy in withdraw()
//   2. No access control in stealETH(), setOwner(), kill()
//   3. Unchecked external call in stealETH()
//   4. Selfdestruct
//   5. Timestamp dependence in getReward()
//   6. Tx.origin in protectedAction()
//   7. Unbounded loop in payoutAll()

contract VulnerableWallet {
    address public owner;
    mapping(address => uint) public balances;

    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);

    constructor() {
        owner = msg.sender;
    }

    // --- Reentrancy (SWC-107) ---
    // State changes AFTER external call -> reentrancy
    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount, "insufficient balance");
        // External call BEFORE state change!
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "ETH transfer failed");
        // State changes after call
        balances[msg.sender] -= amount;
    }

    // --- No Access Control + Unchecked Call (SWC-105, SWC-104) ---
    // Anyone can steal the contract's ETH
    function stealETH(address _target) public {
        (bool ok, ) = _target.call{value: address(this).balance}("");
        // ok is not checked
    }

    // --- No Access Control (SWC-105) ---
    // Anyone can become owner
    function setOwner(address newOwner) public {
        owner = newOwner;
    }

    // --- Selfdestruct (SWC-106) ---
    function kill() public {
        selfdestruct(payable(owner));
    }

    // --- Timestamp Dependence (SWC-116) ---
    uint public lastRewardTime;

    function getReward(address user) public {
        // block.timestamp in comparison - miner can manipulate
        if (block.timestamp >= lastRewardTime + 7 days) {
            lastRewardTime = block.timestamp;
        }
    }

    // --- Tx.origin Auth (SWC-115) ---
    function protectedAction() public {
        // tx.origin - phishing risk!
        require(tx.origin == owner);
    }

    // --- Unbounded Loop (SWC-126) ---
    address[] public users;

    function payoutAll() public {
        // If users[] grows large - gas griefing
        for (uint i = 0; i < users.length; i++) {
            payable(users[i]).transfer(1 ether);
        }
    }

    // --- Deposit (safe) ---
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // --- Integer Overflow/Underflow (SWC-101) ---
    // Solidity <0.8 - no built-in overflow check
    function addBalance(address user, uint amount) public {
        balances[user] = balances[user] + amount; // potential overflow
    }
}
