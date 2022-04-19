// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract LuckyDraw {
    struct participant {
        address payable participant_address;
        uint amount;
    }

    participant participantInfo; // create state variable with struct as the reference type
    participant[] public participants; // Create an array with struct as the reference type

    address payable public manager;
    uint public total_participants;
    uint public contractBalance;
    address public winner;

    modifier isPaymentEnough() {
        require(msg.value >= 0.5 ether);
        _;
    }

    modifier restricted() {
        require(msg.sender == manager); // Only Manager Can Call This Function
        _;
    }

    modifier ifOnlyHasParticipant() {
        require(total_participants > 0);
        _;
    }

    constructor() {
        /*
            manager, the public account that deployed the contract 
        */
        manager = payable(msg.sender);
    }

    function enterLuckyDraw() public payable isPaymentEnough {
        participantInfo = participant(payable(msg.sender), msg.value);
        participants.push(participantInfo);

        updateCondition();
    }

    /*
        Randomly generating number in Hexadecimal
        ( for picking a Random winner )
        
        will take 2 values, that possible for outside people to influence the outcome of random number
        
        1.  block difficulty 
            is some amount of time to process a actual transaction, 
            that it takes to pick or solve or close a block
        2.  current time
        
    */
    function random() private view returns (uint) {
        return
            uint(
                keccak256(abi.encodePacked(block.difficulty, block.timestamp))
            ) % total_participants;
    }

    function findWinner() public restricted ifOnlyHasParticipant {
        /*
            if index = 0 , first player will be a winner 
            if index = 3 , fourth player will be a winner
        */
        uint index = random();

        winner = participants[index].participant_address;

        /*
            Sending the whole contract balance to a winner
        */
        participants[index].participant_address.transfer(address(this).balance);

        /*
            Resetting the contract state
            Delete all participants and start a new game
        */
        // participants = new participant[](0);
        for (uint x = 0; x < total_participants; x++) {
            participants.pop();
        }

        updateCondition();
    }

    function destroyContract() public restricted {
        /*
            sending all funds to the manager public account 
        */
        selfdestruct(manager);
    }

    function updateCondition() private {
        contractBalance = address(this).balance;
        total_participants = participants.length;
    }
}
