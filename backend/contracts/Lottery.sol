// SPDX-License-Identifier:  MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

/**@title A simple lottery project
 * @author Ogar Segun
 * @dev This implements ChaninlinkVRF and Chainlink automation
 */

contract Lottery is
    VRFConsumerBaseV2,
    ConfirmedOwner,
    AutomationCompatibleInterface
{
    //type declarations
    VRFCoordinatorV2Interface COORDINATOR;
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }
    enum Status {
        OPEN,
        CLOSED
    }
    //state variables:
    uint256 private immutable s_minimumFee;
    address payable[] private s_participantArray;
    uint public immutable i_interval;
    mapping(address => uint256) private s_mappingParticipant;
    address s_recentWinner;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit;
    uint16 requestConfirmations;
    uint32 numWords;
    uint public lastTimestamp;
    address public s_owner;
    Status status;

    //events
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfiled(uint256 requestId, uint256[] randomWords);
    event winnerPicked(address);

    //error
    error Lottery__ethNotEnough();
    error Lottery__requestNotFound();
    error Lottery__balanceNotSent();
    error Lottery__failedWinnerTransfer();
    error Lottery__raffleClosed();
    error Lottery__upkeepNotNeeded();

    constructor(
        address _coordinator,
        uint256 _minimumFee,
        uint64 subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        uint32 _numWords,
        uint updatei_interval
    ) VRFConsumerBaseV2(_coordinator) ConfirmedOwner(msg.sender) {
        s_owner = (msg.sender);
        i_interval = updatei_interval;
        lastTimestamp = block.timestamp;
        s_minimumFee = _minimumFee;
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        numWords = _numWords;
        COORDINATOR = VRFCoordinatorV2Interface(_coordinator);
    }

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        override
        returns (
            bool upkeepNeeded,
            bytes memory /*performData*/
        )
    {
        upkeepNeeded = false;

        bool elapsed = (block.timestamp > lastTimestamp + i_interval);
        bool lotteryEntered = s_participantArray.length > 0;
        bool balanceAvailable = address(this).balance > 0;
        upkeepNeeded = elapsed && lotteryEntered && balanceAvailable;
        if (upkeepNeeded) {
            status = Status.CLOSED;
        }

        return (upkeepNeeded, "");
    }

    function performUpkeep(
        bytes calldata /*performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Lottery__upkeepNotNeeded();
        }

        if (status != Status.CLOSED) {
            revert Lottery__raffleClosed();
        }

        if (lastTimestamp + i_interval > block.timestamp) {
            lastTimestamp = block.timestamp;
        }
        uint requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    //enterLottery function- payable
    function enterLottery() public payable {
        if (status != Status.OPEN) revert Lottery__raffleClosed();
        if (msg.value < s_minimumFee) revert Lottery__ethNotEnough();
        //to check if the address exist in the mapping
        if (s_mappingParticipant[msg.sender] != 0) {
            s_mappingParticipant[msg.sender] += msg.value;
        } else {
            s_mappingParticipant[msg.sender] = msg.value;
            s_participantArray.push(payable(msg.sender));
        }
    }

    function numberOfParticipants() public view returns (uint) {
        return s_participantArray.length;
    }

    function addressFund(address _address) public view returns (uint) {
        return s_mappingParticipant[_address];
    }

    function getLastTimestamp() public view returns (uint) {
        return lastTimestamp;
    }
    function getEntranceFee() public view returns(uint){
        return s_minimumFee;
    }

    function getAddressOfIndex(uint _index) public view returns (address) {
        return s_participantArray[_index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (Status) {
        return status;
    }

    function getInterval() public view returns (uint) {
        return i_interval;
    }

    function fulfillRandomWords(
        uint256, /*_requestId8*/
        uint256[] memory _randomWords
    ) internal override {
        uint256 randomValue = _randomWords[0];
        uint winnerIndex = randomValue % s_participantArray.length;

        status = Status.OPEN;
        lastTimestamp = block.timestamp;
        s_recentWinner = s_participantArray[winnerIndex];
        //initialize to empty

        s_participantArray = new address payable[](0);
        (bool sent, ) = s_participantArray[winnerIndex].call{
            value: address(this).balance
        }("");
        if (!sent) revert Lottery__failedWinnerTransfer();
        emit winnerPicked(s_recentWinner);
    }
}
