// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { AcalEscrow } from "../contracts/AcalEscrow.sol";
import { SponsorPool } from "../contracts/SponsorPool.sol";

contract TestCompletion is Script {
    AcalEscrow constant escrow = AcalEscrow(payable(0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e));
    SponsorPool constant pool = SponsorPool(payable(0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816));

    // Test accounts (you can use any test addresses)
    address constant MAKER = 0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0;
    address constant TAKER = 0x742D35cc6634C0532925a3b8D34A32D11a8C5C95; // Different taker for this test

    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");

        console2.log("=== Testing Automatic Completion Flow ===");
        console2.log("Maker:", MAKER);
        console2.log("Taker:", TAKER);

        vm.startBroadcast(deployerPk);

        // Step 1: Create a new order as Maker
        console2.log("\n1. Creating order as Maker...");
        vm.stopBroadcast();

        // We need to use different private keys for maker and taker
        // For demo, let's use the deployer as maker
        vm.startBroadcast(deployerPk);

        uint256 orderId = escrow.createOrder(
            keccak256("TRADE_REF_001"),
            keccak256("QR_HASH_001"),
            150, // 150 MXN (valid range)
            block.timestamp + 2 hours
        );
        console2.log("Order created with ID:", orderId);

        // Step 2: Lock order as Taker
        console2.log("\n2. Locking order as Taker...");
        uint256 monAmount = escrow.mxnToMon(150); // 1.5 ETH
        uint256 takerBond = escrow.TAKER_BOND(); // 0.05 ETH
        uint256 totalRequired = monAmount + takerBond; // 1.55 ETH

        console2.log("MON required:", monAmount);
        console2.log("Taker bond:", takerBond);
        console2.log("Total required:", totalRequired);

        escrow.lockOrder{ value: totalRequired }(orderId);
        console2.log("Order locked successfully!");

        // Step 3: Prepare completion signatures
        console2.log("\n3. Preparing completion with Maker + Taker signatures...");

        AcalEscrow.Action memory action = AcalEscrow.Action({
            orderId: orderId,
            actionType: AcalEscrow.ActionType.Complete,
            evidenceHash: keccak256("PAYMENT_PROOF_001"),
            deadline: block.timestamp + 1 hours
        });

        // Generate signatures (in a real app, each party signs separately)
        bytes[] memory signatures = new bytes[](2);

        // Maker signature (using deployer key for demo)
        signatures[0] = _signAction(action, deployerPk);

        // Taker signature (using deployer key for demo - in reality would be different)
        signatures[1] = _signAction(action, deployerPk);

        console2.log("Signatures generated!");

        // Step 4: Complete the order
        console2.log("\n4. Executing automatic completion...");

        uint256 makerBalBefore = address(0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45).balance;
        uint256 poolBalBefore = pool.balance();

        escrow.completeOrder(orderId, signatures, action);

        uint256 makerBalAfter = address(0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45).balance;
        uint256 poolBalAfter = pool.balance();

        console2.log("\n=== COMPLETION RESULTS ===");
        console2.log("Maker balance change:", makerBalAfter - makerBalBefore);
        console2.log("Pool balance change:", int256(poolBalAfter) - int256(poolBalBefore));
        console2.log("Expected maker received: MON + Subsidy =", monAmount + escrow.SUBSIDY());
        console2.log("Order status should be: Completed (3)");

        // Check final order status
        (,,,,,,, AcalEscrow.Status status,,) = escrow.orders(orderId);
        console2.log("Final order status:", uint256(status));

        vm.stopBroadcast();

        console2.log("\n*** Automatic completion test finished! ***");
    }

    function _signAction(AcalEscrow.Action memory action, uint256 privateKey) internal view returns (bytes memory) {
        bytes32 digest = escrow.hashAction(action);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        return abi.encodePacked(r, s, v);
    }
}
