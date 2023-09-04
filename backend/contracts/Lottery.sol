// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

/**
 * we want users to enter the lottery game,
 * a winner will be selected by the contract after
 * an event has been triggered (maybe certain time-interval)
 * based on verifiable random mechanism provided
 * by chainlink.
 *
 *
 */

contract Lottery {
    //state variables:
    uint256 private immutable minimumFee;
    address payable[] public participantArray;
    mapping(address => uint256) private mappingParticipant;

    //error
    error Lottery_ethNotEnough();

    constructor(uint256 _minimumFee) {
        minimumFee = _minimumFee;
    }

    //enterLottery function- payable
    function enterLottery() public payable {
        if (msg.value < minimumFee) revert Lottery_ethNotEnough();
        if (mappingParticipant[msg.sender] != 0) {
            mappingParticipant[msg.sender] += msg.value;
        } else {
            mappingParticipant[msg.sender] = msg.value;
            participantArray.push(payable(msg.sender));
        }
    }

    function arrayLength() public view returns (uint) {
        return participantArray.length;
    }

    function returnMapping(address _address) public view returns (uint) {
        return mappingParticipant[_address];
    }

    function selectAndPayWinner() public {}
}
