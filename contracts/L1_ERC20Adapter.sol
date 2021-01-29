// SPDX-License-Identifier: MIT
pragma solidity >0.6.0 <0.8.0;

import { ERC20 } from "./ERC20.sol";
import { L2_Bridge } from "./L2_Bridge.sol";

/**
 * @title L1_ERC20Adapter
 * @dev A little adapter contract that allows an existing ERC20 on Ethereum to interact with
 *      contracts on Layer 2!
 */
contract L1_ERC20Adapter is L2_Bridge {

    /*************
     * Variables *
     *************/

    ERC20 public l1ERC20;


    /***************
     * Constructor *
     ***************/

    /**
     * @param _l1ERC20 Address of the ERC20 contract we're wrapping.
     */
    constructor(
        address _l1ERC20
    )
        public
    {
        l1ERC20 = ERC20(_l1ERC20);
    }


    /********************
     * Public Functions *
     ********************/

    /**
     * Locks tokens into this contract and triggers a message to mint new tokens on Layer 2.
     * @param _amount Number of tokens to deposit. Will only work if you've given this contract
     *                an allowance.
     */
    function deposit(
        uint256 _amount
    )
        public
    {
        // Send funds to this contract to lock them up for later.
        l1ERC20.transferFrom(
            msg.sender,
            address(this),
            _amount
        );

        // Imagine this like an async function call.
        sendMessage(
            // Encode the function parameters to be sent to our partner contract.
            abi.encodeWithSignature(
                "mint(address,uint256)",
                msg.sender,
                _amount
            ),
            // Give it a bunch of gas for now.
            8000000
        );
    }

    /**
     * Sends tokens back to an account. Can only be triggered by the Layer 2 ERC20.
     * @param _withdrawer Address of the account to send tokens to.
     * @param _amount Number of tokens to withdraw.
     */
    function withdraw(
        address _withdrawer,
        uint256 _amount
    )
        public
        onlyViaBridge
    {
        l1ERC20.transfer(
            _withdrawer,
            _amount
        );
    }
}
