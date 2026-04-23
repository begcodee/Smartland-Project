// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandSaleAnchor
 * @notice Records an immutable proof that a parcel sale was completed after fiat (e.g. Paystack) settlement.
 *         Only the `registrar` (Lands Commission hot wallet / backend) submits txs — buyers never need crypto wallets.
 *
 *         Off-chain app computes:
 *           saleId = keccak256(bytes(transferId))
 *           parcelKey = keccak256(bytes(landParcelId))
 *           paystackRefHash = keccak256(bytes(paystackReference))
 */
contract LandSaleAnchor {
    address public registrar;

    mapping(bytes32 => bool) public saleRecorded;

    event SaleAnchored(
        bytes32 indexed saleId,
        bytes32 indexed parcelKey,
        bytes32 paystackRefHash,
        uint256 timestamp
    );

    error NotRegistrar();
    error AlreadyAnchored();

    constructor(address _registrar) {
        require(_registrar != address(0), "registrar");
        registrar = _registrar;
    }

    function setRegistrar(address newRegistrar) external {
        if (msg.sender != registrar) revert NotRegistrar();
        require(newRegistrar != address(0), "registrar");
        registrar = newRegistrar;
    }

    function recordSale(bytes32 saleId, bytes32 parcelKey, bytes32 paystackRefHash) external {
        if (msg.sender != registrar) revert NotRegistrar();
        if (saleRecorded[saleId]) revert AlreadyAnchored();
        saleRecorded[saleId] = true;
        emit SaleAnchored(saleId, parcelKey, paystackRefHash, block.timestamp);
    }
}
