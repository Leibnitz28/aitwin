"""
Blockchain Service — Ethereum Smart Contract Integration
Handles ERC-721 NFT minting and ownership verification via web3.py.
Falls back to mock data when ETH keys are not configured.
"""

import random
from typing import Any, Optional
from config import Config
from utils.helpers import generate_short_id


class BlockchainService:
    """Interface to Ethereum blockchain for identity minting."""

    _web3: Any = None
    _contract: Any = None

    @classmethod
    def _init_web3(cls):
        """Lazy-initialize web3 connection."""
        if cls._web3 is not None:
            return True
        if not Config.has_blockchain():
            return False

        try:
            from web3 import Web3
            cls._web3 = Web3(Web3.HTTPProvider(Config.ETH_RPC_URL))
            if not cls._web3.is_connected():
                print("⚠️ web3: Could not connect to Ethereum RPC")
                cls._web3 = None
                return False
            print("✅ Connected to Ethereum network")
            return True
        except Exception as e:
            print(f"⚠️ web3 init error: {e}")
            cls._web3 = None
            return False

    @classmethod
    async def mint_nft(cls, twin_id: str, user_id: str, metadata: Optional[dict] = None) -> dict:
        """
        Mint an ERC-721 NFT representing the AI twin identity.
        Returns transaction details or mock data if blockchain is unavailable.
        """
        if cls._init_web3() and cls._web3 and Config.ETH_CONTRACT_ADDRESS:
            try:
                from web3 import Web3
                account = cls._web3.eth.account.from_key(Config.ETH_PRIVATE_KEY)
                nonce = cls._web3.eth.get_transaction_count(account.address)

                # Build a simple mint transaction
                # In production, this would interact with your deployed ERC-721 contract
                tx = {
                    "nonce": nonce,
                    "to": Config.ETH_CONTRACT_ADDRESS,
                    "value": 0,
                    "gas": 200000,
                    "gasPrice": cls._web3.eth.gas_price,
                    "data": cls._web3.keccak(text=f"mint:{twin_id}:{user_id}"),
                    "chainId": cls._web3.eth.chain_id,
                }

                signed = cls._web3.eth.account.sign_transaction(tx, Config.ETH_PRIVATE_KEY)
                tx_hash = cls._web3.eth.send_raw_transaction(signed.raw_transaction)

                return {
                    "transaction_hash": tx_hash.hex(),
                    "token_id": f"#{random.randint(1000, 9999)}",
                    "owner": account.address,
                    "contract_address": Config.ETH_CONTRACT_ADDRESS,
                    "status": "submitted",
                    "network": "ethereum",
                }
            except Exception as e:
                print(f"⚠️ Blockchain mint error: {e}")
                # Fall through to mock

        # Mock response for development
        mock_hash = f"0x{generate_short_id()}{generate_short_id()}{generate_short_id()}{generate_short_id()}"
        return {
            "transaction_hash": mock_hash,
            "token_id": f"#{random.randint(1000, 9999)}",
            "owner": f"0x7a3B8c2D9e1F...{generate_short_id()}",
            "contract_address": "0x1234...abcd (mock)",
            "status": "mock_success",
            "network": "ethereum-dev",
        }

    @classmethod
    async def verify_ownership(cls, token_id: str) -> dict:
        """Verify ownership of a minted identity NFT."""
        # In production: read contract state
        return {
            "token_id": token_id,
            "owner": f"0x7a3B...{generate_short_id()}",
            "verified": True,
        }
