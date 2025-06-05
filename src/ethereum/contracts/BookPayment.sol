// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookPayment {
    address public owner;
    mapping(string => bool) public completedPayments;
    mapping(string => uint256) public orderAmounts;
    
    event PaymentReceived(address from, uint256 amount, string orderId);
    event PaymentCompleted(string orderId, address from, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    function setOrderAmount(string memory orderId, uint256 amount) public onlyOwner {
        orderAmounts[orderId] = amount;
    }
    
    function makePayment(string memory orderId) public payable {
        require(orderAmounts[orderId] > 0, "Order not found");
        require(msg.value >= orderAmounts[orderId], "Insufficient payment amount");
        require(!completedPayments[orderId], "Payment already completed");
        
        completedPayments[orderId] = true;
        emit PaymentReceived(msg.sender, msg.value, orderId);
        emit PaymentCompleted(orderId, msg.sender, msg.value);
    }
    
    function isPaymentCompleted(string memory orderId) public view returns (bool) {
        return completedPayments[orderId];
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
} 