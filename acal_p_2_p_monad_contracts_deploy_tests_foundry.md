# ACAL P2P (Monad) — Solidity Contracts + Foundry Deploy & Tests

Below is a full **Foundry** scaffold for the hybrid **2‑de‑3 (EIP‑712) Escrow** + **Sponsor Pool** design (without Verifier Pool), adapted so **Maker no necesita MON** (bono cubierto por sponsors) y el **Taker deposita el principal**.

> **Tipo de cambio hardcoded:** `1 MXN = 0.01 MON`
>
> **Parámetros por defecto:** `SUBSIDY = 0.12 MON`, `MAKER_BOND = 0.05 MON`, `TAKER_BOND = 0.05 MON`.

---

## 1) Estructura de carpetas

```
acal/
├─ foundry.toml
├─ remappings.txt            (opcional)
├─ lib/
│  └─ openzeppelin-contracts/   (via forge install)
├─ src/
│  ├─ AcalEscrow.sol
│  └─ SponsorPool.sol
├─ script/
│  └─ Deploy.s.sol
└─ test/
   └─ AcalEscrow.t.sol
```

---

## 2) `foundry.toml`

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200

remappings = [
  "@openzeppelin/=lib/openzeppelin-contracts/",
]
```

> Instalar OpenZeppelin v5:
>
> ```bash
> forge install openzeppelin/openzeppelin-contracts@v5.0.2 --no-commit
> ```

---

## 3) Contratos

### 3.1 `src/SponsorPool.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SponsorPool
/// @notice Custodia MON de los sponsors. Financia el bono del maker y paga el subsidio por orden.
contract SponsorPool is Ownable {
    address public escrow; // AcalEscrow autorizado

    event EscrowSet(address indexed escrow);
    event Deposited(address indexed from, uint256 amount);
    event MakerBondPulled(address indexed by, uint256 amount);
    event SubsidyPaid(address indexed to, uint256 amount);

    constructor(address _owner) Ownable(_owner) {}

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function setEscrow(address _escrow) external onlyOwner {
        require(escrow == address(0), "escrow already set");
        escrow = _escrow;
        emit EscrowSet(_escrow);
    }

    modifier onlyEscrow() {
        require(msg.sender == escrow, "not escrow");
        _;
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @dev Envía MON al contrato Escrow para fondear el bono del maker.
    function pullMakerBond(uint256 amount) external onlyEscrow {
        (bool ok, ) = payable(escrow).call{value: amount}("");
        require(ok, "transfer failed");
        emit MakerBondPulled(msg.sender, amount);
    }

    /// @dev Paga subsidio directamente al maker al completar la orden.
    function disburseSubsidy(address to, uint256 amount) external onlyEscrow {
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "subsidy xfer failed");
        emit SubsidyPaid(to, amount);
    }
}
```

---

### 3.2 `src/AcalEscrow.sol`

```solidity
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

    // --- Internals ---
    function _safeTransfer(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "xfer failed");
    }
}
```

---

## 4) Script de deploy — `script/Deploy.s.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SponsorPool} from "src/SponsorPool.sol";
import {AcalEscrow} from "src/AcalEscrow.sol";

/// Run:
///   export PRIVATE_KEY=0x...
///   export ARBITRO=0xArbitroAddress
///   export SPONSOR_SEED_ETH=10   # fondo inicial en MON (ether units)
///   forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --broadcast -vv
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address arbitro = vm.envAddress("ARBITRO");
        uint256 sponsorSeed = vm.envOr("SPONSOR_SEED_ETH", uint256(0));

        vm.startBroadcast(pk);

        // Owner del SponsorPool será el deployer
        SponsorPool pool = new SponsorPool(msg.sender);
        AcalEscrow escrow = new AcalEscrow(address(pool), arbitro, msg.sender);
        pool.setEscrow(address(escrow));

        if (sponsorSeed > 0) {
            (bool ok, ) = payable(address(pool)).call{value: sponsorSeed * 1 ether}("");
            require(ok, "seed failed");
        }

        console2.log("SponsorPool:", address(pool));
        console2.log("AcalEscrow:", address(escrow));
        console2.log("Arbitro:", arbitro);

        vm.stopBroadcast();
    }
}
```

---

## 5) Tests — `test/AcalEscrow.t.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {AcalEscrow, ISponsorPool} from "src/AcalEscrow.sol";
import {SponsorPool} from "src/SponsorPool.sol";

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
        vm.prank(taker);
        escrow.lockOrder{value: mon + escrow.TAKER_BOND()}(id);

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
        // En este test, el makerBond se transfiere desde escrow al pool; el pool también pagó la seed.
        uint256 poolBalAfter = address(pool).balance;
        assertEq(poolBalAfter, poolBalBefore - escrow.SUBSIDY());
    }

    function testCancel_MakerFault() public {
        // create + lock
        vm.prank(maker);
        uint256 id = escrow.createOrder(keccak256("CR2"), keccak256("HASHQR2"), 100, block.timestamp + 1 days);
        uint256 mon = escrow.mxnToMon(100);
        vm.prank(taker);
        escrow.lockOrder{value: mon + escrow.TAKER_BOND()}(id);

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
        vm.prank(taker);
        escrow.lockOrder{value: mon + escrow.TAKER_BOND()}(id);

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
        vm.prank(taker);
        escrow.lockOrder{value: mon + escrow.TAKER_BOND()}(id);

        // Disputa
        vm.prank(maker);
        escrow.disputeOrder(id);

        uint256 makerBefore = maker.balance;
        vm.prank(arbitro);
        escrow.resolveDispute(id, uint8(AcalEscrow.ActionType.Complete));

        assertEq(maker.balance, makerBefore + mon + escrow.SUBSIDY());
    }
}
```

---

## 6) Comandos útiles

```bash
# 1) Instalar deps
forge install openzeppelin/openzeppelin-contracts@v5.0.2 --no-commit

# 2) Compilar
forge build

# 3) Correr tests
forge test -vv

# 4) Deploy (ejemplo)
export PRIVATE_KEY=0xyourkey
export ARBITRO=0xArbitroAddr
export SPONSOR_SEED_ETH=15
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --broadcast -vv
```

---

## 7) Notas y ajustes

- **Seguridad gas/llamadas externas:** El contrato actual usa `ReentrancyGuard` y ordena *checks-effects-interactions*. Mantén `nonReentrant` en funciones que envían MON.
- **Subsidio insuficiente:** `completeOrder`/`resolveDispute(Complete)` requieren que `SponsorPool.balance() >= SUBSIDY`. Puedes cambiar para permitir completar sin subsidio si te interesa (pago 1.0 MON únicamente).
- **Políticas de cancelación:** hoy se premia a la contraparte con el bono del culpable. Ajusta a tu gusto (por ejemplo, enviar siempre bonos de vuelta al `SponsorPool`).
- **Commit‑reveal QR:** on‑chain guardamos `hashQR` y `cr`. La imagen/JSON del QR vive cifrada off‑chain; la dApp revela la clave al taker tras `lockOrder`.
- **Rangos/expiración:** valida `100 ≤ mxn ≤ 500` y `expiry ≤ now+7d`. Puedes añadir `lockTimeout` separado si quieres cortar disputas rápidas.
- **Eventos:** listos para indexar en tu backend/app.

Si quieres, en el siguiente paso te dejo el **diagrama de estado (Mermaid)** y los **snippets TS** para firmar EIP‑712 desde front (maker/taker) con `viem`/`ethers`. 

