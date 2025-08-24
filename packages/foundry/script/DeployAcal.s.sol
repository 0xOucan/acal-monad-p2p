// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { SponsorPool } from "../contracts/SponsorPool.sol";
import { AcalEscrow } from "../contracts/AcalEscrow.sol";

/// Run:
///   forge script script/DeployAcal.s.sol:DeployAcal --rpc-url monad_testnet --account deployer --broadcast -vv
contract DeployAcal is Script {
    function run() external {
        // Fixed parameters for Monad deployment
        address arbitro = 0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45;
        uint256 sponsorSeed = 1 ether; // 1 MON instead of 15

        console2.log("Deploying ACAL contracts to Monad testnet...");
        console2.log("Arbitro address:", arbitro);
        console2.log("Sponsor seed amount:", sponsorSeed);

        // Start broadcast using the deployer account
        vm.startBroadcast();

        // The actual deployer is the keystore account address
        address deployer = 0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45;
        console2.log("Deployer address:", deployer);
        console2.log("Current msg.sender:", msg.sender);

        // Deploy SponsorPool first (owner = deployer)
        SponsorPool pool = new SponsorPool(deployer);
        console2.log("SponsorPool deployed at:", address(pool));

        // Deploy AcalEscrow (owner = deployer)
        AcalEscrow escrow = new AcalEscrow(address(pool), arbitro, deployer);
        console2.log("AcalEscrow deployed at:", address(escrow));

        // Set escrow address in the pool
        console2.log("Pool owner:", pool.owner());
        console2.log("About to call setEscrow with msg.sender:", msg.sender);
        pool.setEscrow(address(escrow));
        console2.log("Escrow address set in SponsorPool");

        // Fund the SponsorPool with the seed amount
        (bool ok,) = payable(address(pool)).call{ value: sponsorSeed }("");
        require(ok, "Failed to seed SponsorPool");
        console2.log("SponsorPool funded with", sponsorSeed, "wei");

        vm.stopBroadcast();

        console2.log("=== Deployment Summary ===");
        console2.log("SponsorPool:", address(pool));
        console2.log("AcalEscrow:", address(escrow));
        console2.log("Arbitro:", arbitro);
        console2.log("Initial funding:", sponsorSeed, "wei");
        console2.log("Pool balance:", address(pool).balance);
    }
}
