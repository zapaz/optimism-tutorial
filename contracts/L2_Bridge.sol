// SPDX-License-Identifier: MIT
pragma solidity >0.6.0 <0.8.0;

import { iOVM_BaseCrossDomainMessenger } from "@eth-optimism/contracts/build/contracts/iOVM/bridge/iOVM_BaseCrossDomainMessenger.sol";

/**
 * @title L2_Bridge
 * @dev An abstraction for comms between Layer 1 (Ethereum) and Layer 2 (Optimistic Ethereum).
        You can use this contract on both L1 and L2. This helper assumes that you're interacting
        with one specific contract on the other domain. You'll need to make tweaks if you want
        to interact with more than one contract!
 * @notice Don't use this contract in production without some sort of authentication mechanism!
 *         For further information, look at the createBridge function below.
 */
contract L2_Bridge {

    /*************
     * Variables *
     *************/

    iOVM_BaseCrossDomainMessenger internal messenger;
    address internal partner;
    uint256 internal gasLimit;
    

    /**********************
     * Function Modifiers *
     **********************/

    /**
     * Modifier that guarantees a function can only be called by this contract's partner.
     */
    modifier onlyViaBridge() {
        require(
            messenger.xDomainMessageSender() == partner,
            "L2_Bridge: Function can only be triggered by the bridge partner contract."
        );

        require(
            msg.sender == address(messenger),
            "L2_Bridge: Function can only be called by the CrossDomainMessenger."
        );

        _;
    }


    /********************
     * Public Functions *
     ********************/

    /**
     * Initializes a bridge between this contract and a contract on Layer 1 (or on Layer 2,
     * if you're using this contract on Layer 1). 
     * @param _partner Address on the other domain to communicate with.
     * @param _messenger CrossDomainMessenger address on the current domain.
     */
    function createBridge(
        address _partner,
        iOVM_BaseCrossDomainMessenger _messenger
    )
        public
    {
        partner = _partner;
        messenger = _messenger;
    }

    /**
     * Sends a message to be executed by the partner contract.
     * @param _message Message to send to the partner contract.
     * @param _gasLimit Gas limit for the call.
     */
    function sendMessage(
        bytes memory _message,
        uint256 _gasLimit
    )
        public
    {
        messenger.sendMessage(
            partner,
            _message,
            uint32(_gasLimit)
        );
    }
}
