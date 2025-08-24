// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {AcalEscrow, ISponsorPool} from "../contracts/AcalEscrow.sol";
import {SponsorPool} from "../contracts/SponsorPool.sol";

contract AcalEscrowTest is Test {
    AcalEscrow escrow;
    SponsorPool pool;

    uint256 makerPk = 0xA11CE;
    address maker;
    uint256 takerPk = 0xB0B;
    address taker;
    uint256 arbPk = 0xAAABBB;
    address arbitro;

    function setUp() public {
        maker = vm.addr(makerPk);
        taker = vm.addr(takerPk);
        arbitro = vm.addr(arbPk);

        // Deployer
        address deployer = address(this);
        pool = new SponsorPool(deployer);
        escrow = new AcalEscrow(address(pool), arbitro, deployer);
        pool.setEscrow(address(escrow));

        // Fondos
        vm.deal(address(pool), 0); // start 0
        vm.deal(maker, 1 ether);
        vm.deal(taker, 5 ether);
        vm.deal(arbitro, 1 ether);

        // Seed sponsors
        vm.deal(address(this), 10 ether);
        (bool ok, ) = payable(address(pool)).call{value: 5 ether}("");
        require(ok, "seed");
    }

    function _sign(AcalEscrow.Action memory a, uint256 pk) internal view returns (bytes memory sig) {
        bytes32 digest = escrow.hashAction(a);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        sig = abi.encodePacked(r, s, v);
    }

    function testCreateLockComplete_MakerTakerSign() public {
        // Maker create
        vm.prank(maker);
        uint256 id = escrow.createOrder(keccak256("CR1"), keccak256("HASHQR1"), 100, block.timestamp + 1 days);

        // Taker lock (1.0 + 0.05)
        uint256 mon = escrow.mxnToMon(100); // 1 ether
        uint256 takerBond = escrow.TAKER_BOND();
        vm.prank(taker);
        escrow.lockOrder{value: mon + takerBond}(id);

        // Complete with maker + taker signatures
        AcalEscrow.Action memory a = AcalEscrow.Action({
            orderId: id,
            actionType: AcalEscrow.ActionType.Complete,
            evidenceHash: keccak256("ticket1"),
            deadline: block.timestamp + 1 hours
        });
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _sign(a, makerPk);
        sigs[1] = _sign(a, takerPk);

        uint256 makerBalBefore = maker.balance;
        uint256 poolBalBefore = address(pool).balance;

        escrow.completeOrder(id, sigs, a);

        // Maker recibió 1.12 MON
        assertEq(maker.balance, makerBalBefore + mon + escrow.SUBSIDY());
        // SponsorPool pagó 0.12, pero recuperó el makerBond (0.05) de vuelta al pool.
        // Net change: -subsidy + makerBond = -0.12 + 0.05 = -0.07
        uint256 poolBalAfter = address(pool).balance;
        assertEq(poolBalAfter, poolBalBefore - escrow.SUBSIDY() + escrow.MAKER_BOND());
    }

    function testCancel_MakerFault() public {
        // create + lock
        vm.prank(maker);
        uint256 id = escrow.createOrder(keccak256("CR2"), keccak256("HASHQR2"), 100, block.timestamp + 1 days);
        uint256 mon = escrow.mxnToMon(100);
        uint256 takerBond = escrow.TAKER_BOND();
        vm.prank(taker);
        escrow.lockOrder{value: mon + takerBond}(id);

        // Cancel maker fault with taker + arbitro
        AcalEscrow.Action memory a = AcalEscrow.Action({
            orderId: id,
            actionType: AcalEscrow.ActionType.CancelMakerFault,
            evidenceHash: keccak256("badQR"),
            deadline: block.timestamp + 1 hours
        });
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _sign(a, takerPk);
        sigs[1] = _sign(a, arbPk);

        uint256 takerBefore = taker.balance;
        escrow.cancelOrder(id, sigs, a);
        // Taker recupera principal + takerBond + makerBond
        assertEq(taker.balance, takerBefore + mon + escrow.TAKER_BOND() + escrow.MAKER_BOND());
    }

    function testExpireLocked() public {
        vm.prank(maker);
        uint256 id = escrow.createOrder(keccak256("CR3"), keccak256("HASHQR3"), 100, block.timestamp + 1 days);
        uint256 mon = escrow.mxnToMon(100);
        uint256 takerBond = escrow.TAKER_BOND();
        vm.prank(taker);
        escrow.lockOrder{value: mon + takerBond}(id);

        vm.warp(block.timestamp + 2 days);
        uint256 takerBefore = taker.balance;
        escrow.expireLocked(id);
        // Taker recupera principal + takerBond; makerBond regresa al pool
        assertEq(taker.balance, takerBefore + mon + escrow.TAKER_BOND());
    }

    function testResolveDispute_Complete() public {
        vm.prank(maker);
        uint256 id = escrow.createOrder(keccak256("CR4"), keccak256("HASHQR4"), 100, block.timestamp + 1 days);
        uint256 mon = escrow.mxnToMon(100);
        uint256 takerBond = escrow.TAKER_BOND();
        vm.prank(taker);
        escrow.lockOrder{value: mon + takerBond}(id);

        // Disputa
        vm.prank(maker);
        escrow.disputeOrder(id);

        uint256 makerBefore = maker.balance;
        vm.prank(arbitro);
        escrow.resolveDispute(id, uint8(AcalEscrow.ActionType.Complete));

        assertEq(maker.balance, makerBefore + mon + escrow.SUBSIDY());
    }
}
