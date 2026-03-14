"""
Blockchain Routes — POST /mint-identity
Ethereum NFT minting for AI twin digital identity.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import IdentityMintRequest, IdentityMintResponse
from services.twin_service import TwinService
from services.blockchain_service import BlockchainService

router = APIRouter()


@router.post(
    "/mint-identity",
    response_model=IdentityMintResponse,
    summary="Mint the twin identity on the blockchain",
)
async def mint_identity(payload: IdentityMintRequest):
    """
    Secure the AI twin identity on the Ethereum blockchain.
    Mints an ERC-721 NFT with the twin's personality metadata.
    """
    twin = TwinService.get_twin(payload.twin_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Twin not found")

    # Prepare metadata for the NFT
    metadata = {
        "twin_id": payload.twin_id,
        "user_id": payload.user_id,
        "personality_summary": twin.analysis.summary,
        "overall_match": twin.analysis.overall_match,
        "traits": twin.analysis.traits.model_dump(),
    }

    # Mint via web3.py
    result = await BlockchainService.mint_nft(
        twin_id=payload.twin_id,
        user_id=payload.user_id,
        metadata=metadata,
    )

    # Update twin with blockchain tx hash
    TwinService.set_blockchain_tx(payload.twin_id, result["transaction_hash"])

    return IdentityMintResponse(
        twin_id=payload.twin_id,
        transaction_hash=result["transaction_hash"],
        token_id=result["token_id"],
        owner=result["owner"],
        contract_address=result["contract_address"],
        status=result["status"],
        network=result["network"],
    )
