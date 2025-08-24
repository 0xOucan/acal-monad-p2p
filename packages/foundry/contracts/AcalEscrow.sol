// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface ISponsorPool {
    function pullMakerBond(uint256 amount) external;
    function disburseSubsidy(address to, uint256 amount) external;
    function balance() external view returns (uint256);
}

/// @title ACAL Escrow (2-of-3 EIP-712)
/// @notice Gestiona órdenes Maker/Taker. Maker no necesita MON; SponsorPool cubre su bono y subsidio.
contract AcalEscrow is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    // ====== Parámetros ======
    uint256 public constant SUBSIDY = 0.12 ether;     // 0.12 MON
    uint256 public constant MAKER_BOND = 0.05 ether;  // 0.05 MON (lo aporta SponsorPool)
    uint256 public constant TAKER_BOND = 0.05 ether;  // 0.05 MON (lo aporta el taker)

    enum Status { Open, Locked, Completed, Cancelled, Disputed, Expired }

    enum ActionType { Complete, CancelMakerFault, CancelTakerFault, Dispute }

    struct Order {
        address maker;
        address taker;
        bytes32 cr;        // keccak256(bytes(CR))
        bytes32 hashQR;    // keccak256(jsonQR || salt)
        uint256 mxn;       // [100..500]
        uint256 mon;       // mxn * 1e16
        uint256 expiry;    // <= now + 7d; además respeta el QR
        Status status;
        uint256 makerBond; // 0.05
        uint256 takerBond; // 0.05 cuando se lockea
    }

    struct Action {
        uint256 orderId;
        ActionType actionType; // 0..3
        bytes32 evidenceHash;  // hash del ticket/fotos si aplica
        uint256 deadline;      // anti-replay
    }

    bytes32 private constant _ACTION_TYPEHASH = keccak256(
        "Action(uint256 orderId,uint8 actionType,bytes32 evidenceHash,uint256 deadline)"
    );

    ISponsorPool public immutable sponsorPool;
    address public arbitro; // address operador ACAL

    mapping(uint256 => Order) public orders;
    mapping(bytes32 => bool) public usedCR; // Unicidad de CR
    uint256 public nextId;

    // ====== Eventos ======
    event OrderCreated(uint256 indexed id, address indexed maker, uint256 mxn, uint256 mon, uint256 expiry);
    event OrderLocked(uint256 indexed id, address indexed taker, uint256 value);
    event OrderCompleted(uint256 indexed id);
    event OrderCancelled(uint256 indexed id, ActionType reason);
    event OrderDisputed(uint256 indexed id);
    event OrderExpired(uint256 indexed id);
    event ArbitroChanged(address indexed oldA, address indexed newA);

    constructor(address _sponsorPool, address _arbitro, address _owner)
        EIP712("AcalEscrow", "1")
        Ownable(_owner)
    {
        require(_sponsorPool != address(0), "pool=0");
        sponsorPool = ISponsorPool(_sponsorPool);
        arbitro = _arbitro;
    }

    // ====== Admin ======
    function setArbitro(address _arbitro) external onlyOwner {
        emit ArbitroChanged(arbitro, _arbitro);
        arbitro = _arbitro;
    }

    // ====== Helpers ======
    function mxnToMon(uint256 mxn) public pure returns (uint256) {
        // 1 MXN = 0.01 MON → 0.01 * 1e18 = 1e16 wei
        return mxn * 1e16;
    }

    function _hashAction(Action memory a) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                _ACTION_TYPEHASH,
                a.orderId,
                a.actionType,
                a.evidenceHash,
                a.deadline
            )
        );
        return _hashTypedDataV4(structHash);
    }

    /// @notice Expone el digest para test/clients que quieran firmar off-chain fácilmente.
    function hashAction(Action memory a) external view returns (bytes32) {
        return _hashAction(a);
    }

    // ====== Core ======
    function createOrder(bytes32 crHash, bytes32 hashQR, uint256 mxn, uint256 expiry)
        external
        nonReentrant
        returns (uint256 id)
    {
        require(!usedCR[crHash], "CR used");
        require(mxn >= 100 && mxn <= 500, "mxn range");
        require(expiry <= block.timestamp + 7 days, "expiry>7d");

        // Pull maker bond from SponsorPool into the escrow balance
        sponsorPool.pullMakerBond(MAKER_BOND);

        id = nextId++;
        orders[id] = Order({
            maker: msg.sender,
            taker: address(0),
            cr: crHash,
            hashQR: hashQR,
            mxn: mxn,
            mon: mxnToMon(mxn),
            expiry: expiry,
            status: Status.Open,
            makerBond: MAKER_BOND,
            takerBond: 0
        });
        usedCR[crHash] = true;

        emit OrderCreated(id, msg.sender, mxn, mxnToMon(mxn), expiry);
    }

    function lockOrder(uint256 id) external payable nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.Open, "not Open");
        require(block.timestamp < o.expiry, "expired");
        require(msg.value == o.mon + TAKER_BOND, "need mon+takerBond");

        o.taker = msg.sender;
        o.takerBond = TAKER_BOND;
        o.status = Status.Locked;

        emit OrderLocked(id, msg.sender, msg.value);
    }

    // --- 2-de-3 firma lógica ---
    function _check2of3(uint256 id, bytes[] calldata sigs, Action memory a) internal view returns (bool) {
        Order storage o = orders[id];
        require(a.orderId == id, "bad id");
        require(a.deadline >= block.timestamp, "deadline");

        bytes32 digest = _hashAction(a);
        uint256 mask; // bit0=maker, bit1=taker, bit2=arbitro

        for (uint256 i; i < sigs.length; ++i) {
            address rec = digest.recover(sigs[i]);
            if (rec == o.maker) mask |= 1;
            else if (rec == o.taker) mask |= 2;
            else if (rec == arbitro) mask |= 4;
        }
        // >= 2 of 3
        uint256 count = ((mask & 1) != 0 ? 1 : 0) + ((mask & 2) != 0 ? 1 : 0) + ((mask & 4) != 0 ? 1 : 0);
        return count >= 2;
    }

    function completeOrder(uint256 id, bytes[] calldata sigs, Action memory a)
        external
        nonReentrant
    {
        Order storage o = orders[id];
        require(o.status == Status.Locked, "not Locked");
        require(a.actionType == ActionType.Complete, "wrong action");
        require(_check2of3(id, sigs, a), "need 2 of 3");
        require(sponsorPool.balance() >= SUBSIDY, "no subsidy");

        o.status = Status.Completed; // efectos primero

        // 1) Paga subsidio 0.12 MON al maker desde SponsorPool
        sponsorPool.disburseSubsidy(o.maker, SUBSIDY);
        // 2) Paga principal 1.0 MON al maker desde el escrow
        _safeTransfer(o.maker, o.mon);
        // 3) Devuelve bonos
        _safeTransfer(o.taker, o.takerBond);
        _safeTransfer(address(sponsorPool), o.makerBond); // regresa bono al pool

        emit OrderCompleted(id);
    }

    function cancelOrder(uint256 id, bytes[] calldata sigs, Action memory a)
        external
        nonReentrant
    {
        Order storage o = orders[id];
        require(o.status == Status.Locked, "not Locked");
        require(
            a.actionType == ActionType.CancelMakerFault || a.actionType == ActionType.CancelTakerFault,
            "wrong action"
        );
        require(_check2of3(id, sigs, a), "need 2 of 3");

        o.status = Status.Cancelled;

        if (a.actionType == ActionType.CancelMakerFault) {
            // Maker culpable: Taker recupera principal y su bono; además recibe el makerBond como compensación.
            _safeTransfer(o.taker, o.mon + o.takerBond + o.makerBond);
        } else {
            // Taker culpable: Taker recupera sólo su principal; Maker recibe el takerBond como compensación.
            _safeTransfer(o.taker, o.mon);
            _safeTransfer(o.maker, o.takerBond);
            _safeTransfer(address(sponsorPool), o.makerBond); // bono del maker vuelve al pool
        }

        emit OrderCancelled(id, a.actionType);
    }

    function disputeOrder(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.Locked, "not Locked");
        require(msg.sender == o.maker || msg.sender == o.taker, "not party");
        o.status = Status.Disputed;
        emit OrderDisputed(id);
    }

    /// @notice Solo el árbitro ACAL resuelve una disputa.
    /// @param verdict 0=Complete, 1=CancelMakerFault, 2=CancelTakerFault
    function resolveDispute(uint256 id, uint8 verdict) external nonReentrant {
        require(msg.sender == arbitro, "not arbitro");
        Order storage o = orders[id];
        require(o.status == Status.Disputed, "not Disputed");

        if (verdict == uint8(ActionType.Complete)) {
            require(sponsorPool.balance() >= SUBSIDY, "no subsidy");
            o.status = Status.Completed;
            sponsorPool.disburseSubsidy(o.maker, SUBSIDY);
            _safeTransfer(o.maker, o.mon);
            _safeTransfer(o.taker, o.takerBond);
            _safeTransfer(address(sponsorPool), o.makerBond);
            emit OrderCompleted(id);
            return;
        }

        o.status = Status.Cancelled;
        if (verdict == uint8(ActionType.CancelMakerFault)) {
            _safeTransfer(o.taker, o.mon + o.takerBond + o.makerBond);
        } else if (verdict == uint8(ActionType.CancelTakerFault)) {
            _safeTransfer(o.taker, o.mon);
            _safeTransfer(o.maker, o.takerBond);
            _safeTransfer(address(sponsorPool), o.makerBond);
        } else {
            revert("bad verdict");
        }
        emit OrderCancelled(id, ActionType(verdict));
    }

    // --- Expiraciones ---
    function expireOpen(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.Open, "not Open");
        require(block.timestamp >= o.expiry, "not yet");
        o.status = Status.Expired;
        _safeTransfer(address(sponsorPool), o.makerBond);
        emit OrderExpired(id);
    }

    function expireLocked(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.Locked, "not Locked");
        require(block.timestamp >= o.expiry, "not yet");
        o.status = Status.Expired;
        _safeTransfer(o.taker, o.mon + o.takerBond);
        _safeTransfer(address(sponsorPool), o.makerBond);
        emit OrderExpired(id);
    }

    // --- Receive function to accept ETH ---
    receive() external payable {}

    // --- Internals ---
    function _safeTransfer(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "xfer failed");
    }
}
