// contracts/mocks/MockVRFCoordinator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockVRFCoordinator
 * @dev Mock implementation of Chainlink VRF Coordinator for testing
 */
contract MockVRFCoordinator {
    uint256 private requestIdCounter = 1;
    
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = requestIdCounter++;
        
        emit RandomWordsRequested(
            keyHash,
            requestId,
            0, // preSeed
            subId,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );

        // For testing, we can manually trigger the callback
        // In production, this would be handled by Chainlink oracles
        return requestId;
    }

    /**
     * @dev Manually fulfill VRF request for testing
     * @param consumer The contract that requested randomness
     * @param requestId The request ID
     * @param randomWords Array of random words
     */
    function fulfillRandomWords(
        address consumer,
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        // Call the consumer's fulfillRandomWords function
        (bool success,) = consumer.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );
        require(success, "VRF fulfillment failed");
    }

    /**
     * @dev Helper function to generate mock random words for testing
     */
    function generateMockRandomWords(uint256 seed, uint32 numWords) 
        external 
        pure 
        returns (uint256[] memory) 
    {
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint32 i = 0; i < numWords; i++) {
            randomWords[i] = uint256(keccak256(abi.encodePacked(seed, i)));
        }
        return randomWords;
    }
}
