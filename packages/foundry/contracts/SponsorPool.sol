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
